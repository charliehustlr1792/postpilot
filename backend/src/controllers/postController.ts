import { Request, Response } from "express";
import prisma from "../lib/db";
import { PostStatus, Platform } from "../types/enums";
import { getAuth } from "@clerk/express";
import { Prisma } from "../generated/prisma";

// Shared include shape so every Post response carries its targets + account info.
const postInclude = {
    targets: {
        include: {
            account: {
                select: {
                    id: true,
                    platform: true,
                    username: true,
                    displayName: true,
                },
            },
        },
    },
} satisfies Prisma.PostInclude;

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const { status, platform, page = 1, limit = 10 } = req.query;

        // Filters apply at the target level: a post matches if it has at least
        // one target with the requested status / platform.
        const targetFilter: Prisma.PostTargetWhereInput = {};
        if (typeof status === "string" && status in PostStatus) {
            targetFilter.status = status as PostStatus;
        }
        if (typeof platform === "string" && platform in Platform) {
            targetFilter.platform = platform as Platform;
        }

        const where: Prisma.PostWhereInput = {
            user: { clerkId: userId },
            ...(Object.keys(targetFilter).length > 0 && { targets: { some: targetFilter } }),
        };

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: postInclude,
                orderBy: { createdAt: "desc" },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.post.count({ where }),
        ]);

        res.json({
            posts,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching posts" });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const { content, images, socialAccountIds, scheduledAt } = req.body;

        if (!content || !Array.isArray(socialAccountIds) || socialAccountIds.length === 0) {
            return res.status(400).json({ error: "content and a non-empty socialAccountIds array are required" });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify every account belongs to the authenticated user.
        const accounts = await prisma.socialAccount.findMany({
            where: { id: { in: socialAccountIds }, userId: user.id },
        });
        if (accounts.length !== socialAccountIds.length) {
            return res.status(404).json({ error: "One or more social accounts not found" });
        }

        const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
        const targetStatus = scheduledDate ? "SCHEDULED" : "DRAFT";

        const post = await prisma.post.create({
            data: {
                content,
                images: images || [],
                userId: user.id,
                targets: {
                    create: accounts.map((account) => ({
                        platform: account.platform,
                        accountId: account.id,
                        status: targetStatus,
                        scheduledAt: scheduledDate,
                    })),
                },
            },
            include: postInclude,
        });

        res.status(201).json({ post });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while creating post" });
    }
};

export const getPost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const post = await prisma.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId },
            },
            include: {
                targets: {
                    include: {
                        account: {
                            select: { id: true, platform: true, username: true, displayName: true },
                        },
                        analytics: {
                            orderBy: { recordedAt: "desc" },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.json({ post });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching post" });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.params;
        const { content, images, scheduledAt } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const existingPost = await prisma.post.findFirst({
            where: { id: postId, user: { clerkId: userId } },
            include: { targets: true },
        });

        if (!existingPost) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Update the shared content on the Post itself.
        const postData: Prisma.PostUpdateInput = {
            ...(content && { content }),
            ...(images && { images }),
        };

        // Scheduling changes apply to every target that hasn't published yet.
        // Published targets are immutable.
        await prisma.$transaction(async (tx) => {
            await tx.post.update({ where: { id: postId }, data: postData });

            if (scheduledAt !== undefined) {
                const editableTargetIds = existingPost.targets
                    .filter((t) => t.status !== "PUBLISHED")
                    .map((t) => t.id);

                if (editableTargetIds.length > 0) {
                    if (scheduledAt === null) {
                        await tx.postTarget.updateMany({
                            where: { id: { in: editableTargetIds } },
                            data: { scheduledAt: null, status: "DRAFT" },
                        });
                    } else {
                        await tx.postTarget.updateMany({
                            where: { id: { in: editableTargetIds } },
                            data: { scheduledAt: new Date(scheduledAt), status: "SCHEDULED" },
                        });
                    }
                }
            }
        });

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: postInclude,
        });

        res.json({ post });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while updating post" });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const post = await prisma.post.findFirst({
            where: { id: postId, user: { clerkId: userId } },
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Targets (and their analytics) cascade-delete via the schema.
        await prisma.post.delete({ where: { id: postId } });

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while deleting post" });
    }
};

// Duplicate a post and all of its targets as a fresh DRAFT.
export const duplicatePost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.params;
        const { socialAccountIds } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const originalPost = await prisma.post.findFirst({
            where: { id: postId, user: { clerkId: userId } },
            include: { targets: true },
        });

        if (!originalPost) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Optionally retarget the duplicate to a different set of accounts;
        // otherwise reuse the original post's accounts.
        let accounts;
        if (Array.isArray(socialAccountIds) && socialAccountIds.length > 0) {
            accounts = await prisma.socialAccount.findMany({
                where: { id: { in: socialAccountIds }, user: { clerkId: userId } },
            });
            if (accounts.length !== socialAccountIds.length) {
                return res.status(404).json({ error: "One or more social accounts not found" });
            }
        }

        const targetData = accounts
            ? accounts.map((a) => ({ platform: a.platform, accountId: a.id, status: "DRAFT" as const }))
            : originalPost.targets.map((t) => ({ platform: t.platform, accountId: t.accountId, status: "DRAFT" as const }));

        const duplicatedPost = await prisma.post.create({
            data: {
                content: originalPost.content,
                images: originalPost.images,
                userId: originalPost.userId,
                targets: { create: targetData },
            },
            include: postInclude,
        });

        res.status(201).json({ post: duplicatedPost });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while duplicating post" });
    }
};
