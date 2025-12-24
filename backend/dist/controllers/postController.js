"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicatePost = exports.deletePost = exports.updatePost = exports.getPost = exports.createPost = exports.getAllPosts = void 0;
const db_1 = __importDefault(require("../lib/db"));
const enums_1 = require("../types/enums");
const express_1 = require("@clerk/express");
const getAllPosts = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const { status, platform, page = 1, limit = 10 } = req.query;
        const where = {
            user: {
                clerkId: userId
            }
        };
        if (typeof status === "string" && status in enums_1.PostStatus) {
            where.status = status;
        }
        if (typeof platform === "string" && platform in enums_1.Platform) {
            where.platform = platform;
        }
        const posts = await db_1.default.post.findMany({
            where,
            include: {
                account: {
                    select: {
                        platform: true,
                        username: true,
                        displayName: true
                    }
                }
            }
        });
        const total = await db_1.default.post.count({ where });
        res.json({
            posts,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching posts" });
    }
};
exports.getAllPosts = getAllPosts;
const createPost = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { content, images, socialAccountId, scheduledAt, mentions } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        if (!content || !socialAccountId) {
            return res.status(400).json({ error: "Content and socialAccountId" });
        }
        const socialAccount = await db_1.default.socialAccount.findFirst({
            where: {
                id: socialAccountId,
                user: { clerkId: userId }
            }
        });
        if (!socialAccount) {
            return res.status(404).json({ error: 'Social account not found' });
        }
        const user = await db_1.default.user.findUnique({
            where: { clerkId: userId }
        });
        const post = await db_1.default.post.create({
            data: {
                content,
                images: images || [],
                platform: socialAccount.platform,
                status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                userId: user.id,
                accountId: socialAccountId
            },
            include: {
                account: {
                    select: {
                        platform: true,
                        username: true,
                        displayName: true
                    }
                }
            }
        });
        res.status(201).json({ post });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while creating post" });
    }
};
exports.createPost = createPost;
const getPost = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { postId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const post = await db_1.default.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId }
            },
            include: {
                account: {
                    select: {
                        platform: true,
                        username: true,
                        displayName: true
                    }
                },
                analytics: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1
                }
            }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ post });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching post" });
    }
};
exports.getPost = getPost;
const updatePost = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { postId } = req.params;
        const { content, images, scheduledAt, mentions } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Verify post belongs to user
        const existingPost = await db_1.default.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId }
            }
        });
        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // Don't allow editing published posts
        if (existingPost.status === 'PUBLISHED') {
            return res.status(400).json({ error: 'Cannot edit published posts' });
        }
        const updateData = {
            ...(content && { content }),
            ...(images && { images }),
            //...(mentions && { mentions })
        };
        if (scheduledAt) {
            updateData.scheduledAt = new Date(scheduledAt);
            updateData.status = 'SCHEDULED';
        }
        else if (scheduledAt === null) {
            updateData.scheduledAt = null;
            updateData.status = 'DRAFT';
        }
        const post = await db_1.default.post.update({
            where: { id: postId },
            data: updateData,
            include: {
                account: {
                    select: {
                        platform: true,
                        username: true,
                        displayName: true
                    }
                }
            }
        });
        res.json({ post });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while updating post" });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { postId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Verify post belongs to user
        const post = await db_1.default.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId }
            }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await db_1.default.post.delete({
            where: { id: postId }
        });
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while deleting post" });
    }
};
exports.deletePost = deletePost;
//duplicate post to post to same or different platforms
const duplicatePost = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { postId } = req.params;
        const { platform, socialAccountId } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const originalPost = await db_1.default.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId }
            }
        });
        if (!originalPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const duplicatedPost = await db_1.default.post.create({
            data: {
                content: originalPost.content,
                images: originalPost.images,
                //mentions: originalPost.mentions,
                platform: platform || originalPost.platform,
                status: 'DRAFT',
                userId: originalPost.userId,
                accountId: socialAccountId || originalPost.accountId
            },
            include: {
                account: {
                    select: {
                        platform: true,
                        username: true,
                        displayName: true
                    }
                }
            }
        });
        res.status(201).json({ post: duplicatedPost });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while duplicating post" });
    }
};
exports.duplicatePost = duplicatePost;
