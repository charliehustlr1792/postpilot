import { Request, Response } from "express";
import { getAuth } from '@clerk/express'
import prisma from '../lib/db'
import { postPublishQueue } from '../lib/queue'

// Schedule a post for publishing. Each target (platform) gets its own queue job
// so platforms publish — and can fail — independently.
export const schedulePost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.params;
        const { scheduledAt, targetIds } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' })
        }

        if (!scheduledAt) {
            return res.status(400).json({ error: 'scheduledAt is required' })
        }

        const scheduledDate = new Date(scheduledAt);

        // Fixed: compare the parsed Date, not the raw request string.
        if (scheduledDate <= new Date()) {
            return res.status(400).json({ error: 'Scheduled time must be in the future' })
        }

        const post = await prisma.post.findFirst({
            where: { id: postId, user: { clerkId: userId } },
            include: { targets: true },
        })

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Schedule the requested targets, or all targets that haven't published yet.
        const targetsToSchedule = post.targets.filter((t) => {
            if (t.status === 'PUBLISHED') return false;
            if (Array.isArray(targetIds) && targetIds.length > 0) return targetIds.includes(t.id);
            return true;
        });

        if (targetsToSchedule.length === 0) {
            return res.status(400).json({ error: 'No schedulable targets found for this post' });
        }

        const delay = scheduledDate.getTime() - Date.now();

        await Promise.all(
            targetsToSchedule.map(async (target) => {
                const job = await postPublishQueue.add(
                    'publish-post',
                    {
                        postTargetId: target.id,
                        userId: post.userId,
                        accountId: target.accountId,
                    },
                    {
                        delay,
                        jobId: `target-${target.id}-${scheduledDate.getTime()}`,
                    }
                )

                await prisma.postTarget.update({
                    where: { id: target.id },
                    data: { status: 'SCHEDULED', scheduledAt: scheduledDate },
                })

                await prisma.scheduledJob.create({
                    data: {
                        postTargetId: target.id,
                        jobId: job.id!,
                        scheduledFor: scheduledDate,
                        status: 'PENDING',
                    },
                })
            })
        )

        const updatedPost = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                targets: {
                    include: {
                        account: { select: { id: true, platform: true, username: true, displayName: true } },
                    },
                },
            },
        })

        res.json({
            message: 'Post scheduled successfully',
            post: updatedPost,
            scheduledAt: scheduledDate,
            scheduledTargets: targetsToSchedule.length,
        })
    } catch (error) {
        console.error('Schedule post error:', error);
        res.status(500).json({ error: 'Something went wrong while scheduling post' })
    }
}

// Cancel all pending scheduled targets for a post.
export const cancelScheduledPost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' })
        }

        const post = await prisma.post.findFirst({
            where: { id: postId, user: { clerkId: userId } },
            include: { targets: { where: { status: 'SCHEDULED' } } },
        });

        if (!post || post.targets.length === 0) {
            return res.status(404).json({ error: 'No scheduled targets found for this post' });
        }

        const targetIds = post.targets.map((t) => t.id);

        const scheduledJobs = await prisma.scheduledJob.findMany({
            where: { postTargetId: { in: targetIds }, status: 'PENDING' },
        })

        await Promise.all(
            scheduledJobs.map(async (sj) => {
                const job = await postPublishQueue.getJob(sj.jobId);
                if (job) await job.remove();
                await prisma.scheduledJob.update({
                    where: { id: sj.id },
                    data: { status: 'CANCELLED' },
                })
            })
        )

        await prisma.postTarget.updateMany({
            where: { id: { in: targetIds } },
            data: { status: 'DRAFT', scheduledAt: null },
        })

        const updatedPost = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                targets: {
                    include: {
                        account: { select: { id: true, platform: true, username: true, displayName: true } },
                    },
                },
            },
        })

        res.json({
            message: 'Scheduled post cancelled successfully',
            post: updatedPost,
        })
    } catch (error) {
        console.error('Cancel schedule post error:', error)
        res.status(500).json({ error: 'Something went wrong while cancelling scheduled post' })
    }
}

// Get all posts that have at least one scheduled target.
export const getScheduledPosts = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' })
        }

        const scheduledPosts = await prisma.post.findMany({
            where: {
                user: { clerkId: userId },
                targets: { some: { status: 'SCHEDULED' } },
            },
            include: {
                targets: {
                    include: {
                        account: { select: { id: true, platform: true, username: true, displayName: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        res.json({ posts: scheduledPosts })
    } catch (error) {
        console.error('Get scheduled posts error:', error);
        res.status(500).json({ error: 'Something went wrong while fetching scheduled posts' });
    }
}
