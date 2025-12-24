"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScheduledPosts = exports.cancelScheduledPost = exports.schedulePost = void 0;
const express_1 = require("@clerk/express");
const db_1 = __importDefault(require("../lib/db"));
const queue_1 = require("../lib/queue");
//schedule a post for publishing 
const schedulePost = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { postId } = req.params;
        const { scheduledAt } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!scheduledAt) {
            return res.status(400).json({ error: 'scheduledAt is required' });
        }
        const scheduledDate = new Date(scheduledAt);
        if (scheduledAt <= new Date()) {
            return res.status(400).json({ error: 'Scheduled time must be in the future' });
        }
        const post = await db_1.default.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId },
            },
            include: {
                account: true,
            },
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        //adding job to bullmq queue
        const job = await queue_1.postPublishQueue.add('publish-post', {
            postId: post.id,
            userId: post.userId,
            socialAccountId: post.accountId,
        }, {
            delay: scheduledDate.getTime() - Date.now(),
            jobId: `post-${postId}-${scheduledDate.getTime()}`
        });
        //update post status and scheduled time
        const updatedPost = await db_1.default.post.update({
            where: { id: postId },
            data: {
                status: 'SCHEDULED',
                scheduledAt: scheduledDate,
            }
        });
        //create scheduled job record
        await db_1.default.scheduledJob.create({
            data: {
                postId,
                jobId: job.id, //bull mq job id
                scheduledFor: scheduledDate,
                status: 'PENDING',
            }
        });
        res.json({
            messge: 'Post schedule successfully',
            post: updatedPost,
            scheduledAt: scheduledDate,
            jobId: job.id,
        });
    }
    catch (error) {
        console.error('Schedule post error:', error);
        res.status(500).json({
            error: 'Something went wrong while scheduling post'
        });
    }
};
exports.schedulePost = schedulePost;
//cancel a scheduled post
const cancelScheduledPost = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { postId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const post = await db_1.default.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId },
                status: 'SCHEDULED',
            },
        });
        if (!post) {
            return res.status(404).json({ error: 'Scheduled post not found' });
        }
        const scheduledJob = await db_1.default.scheduledJob.findFirst({
            where: { postId, status: 'PENDING' }
        });
        if (scheduledJob) {
            //removing job from bullmq queue
            const job = await queue_1.postPublishQueue.getJob(scheduledJob.jobId);
            if (job) {
                await job.remove();
            }
            await db_1.default.scheduledJob.update({
                where: { id: scheduledJob.id },
                data: { status: 'CANCELLED' }
            });
            //update post status back to draft
            const updatedPost = await db_1.default.post.update({
                where: { id: postId },
                data: {
                    status: 'DRAFT',
                    scheduledAt: null
                }
            });
            res.json({
                message: 'Schedule post cancelled successfully',
                post: updatedPost,
            });
        }
    }
    catch (error) {
        console.error('Cancel schedule post error:', error);
        res.status(500).json({ error: 'Something went wrong while cancelling scheduled post' });
    }
};
exports.cancelScheduledPost = cancelScheduledPost;
//get all scheduled posts for user
const getScheduledPosts = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const scheduledPosts = await db_1.default.post.findMany({
            where: {
                user: { clerkId: userId },
                status: 'SCHEDULED'
            },
            include: {
                account: {
                    select: {
                        platform: true,
                        username: true,
                        displayName: true
                    }
                }
            },
            orderBy: {
                scheduledAt: 'asc'
            }
        });
        res.json({ posts: scheduledPosts });
    }
    catch (error) {
        console.error('Get scheduled posts error:', error);
        res.status(500).json({ error: 'Something went wrong while fetching scheduled posts' });
    }
};
exports.getScheduledPosts = getScheduledPosts;
