import { Request, Response } from "express";
import { getAuth } from '@clerk/express'
import prisma from '../lib/db'
import { postPublishQueue } from '../lib/queue'
import { AppError } from '../lib/AppError'

// Schedule a post for publishing. Each target (platform) gets its own queue job
// so platforms publish — and can fail — independently.
export const schedulePost = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    const { scheduledAt, targetIds } = req.body;

    if (!userId) {
        throw new AppError(401, 'Not authenticated')
    }

    const scheduledDate = new Date(scheduledAt);

    // Fixed: compare the parsed Date, not the raw request string.
    if (scheduledDate <= new Date()) {
        throw new AppError(400, 'Scheduled time must be in the future')
    }

    const post = await prisma.post.findFirst({
        where: { id: postId, user: { clerkId: userId } },
        include: { targets: true },
    })

    if (!post) {
        throw new AppError(404, 'Post not found');
    }

    // Schedule the requested targets, or all targets that haven't published yet.
    const targetsToSchedule = post.targets.filter((t) => {
        if (t.status === 'PUBLISHED') return false;
        if (Array.isArray(targetIds) && targetIds.length > 0) return targetIds.includes(t.id);
        return true;
    });

    if (targetsToSchedule.length === 0) {
        throw new AppError(400, 'No schedulable targets found for this post');
    }

    const delay = scheduledDate.getTime() - Date.now();

    await Promise.all(
        targetsToSchedule.map(async (target) => {
            // Rescheduling: remove any existing pending job for this target so a
            // re-schedule doesn't leave a duplicate that also fires.
            const existingJobs = await prisma.scheduledJob.findMany({
                where: { postTargetId: target.id, status: 'PENDING' },
            })
            await Promise.all(
                existingJobs.map(async (sj) => {
                    const oldJob = await postPublishQueue.getJob(sj.jobId)
                    if (oldJob) await oldJob.remove()
                    await prisma.scheduledJob.update({
                        where: { id: sj.id },
                        data: { status: 'CANCELLED' },
                    })
                })
            )

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
}

// Cancel all pending scheduled targets for a post.
export const cancelScheduledPost = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    if (!userId) {
        throw new AppError(401, 'Not authenticated')
    }

    const post = await prisma.post.findFirst({
        where: { id: postId, user: { clerkId: userId } },
        include: { targets: { where: { status: 'SCHEDULED' } } },
    });

    if (!post || post.targets.length === 0) {
        throw new AppError(404, 'No scheduled targets found for this post');
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
}

// Get all posts that have at least one scheduled target.
export const getScheduledPosts = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new AppError(401, 'Not authenticated')
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
}
