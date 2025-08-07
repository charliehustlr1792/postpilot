import { Request, Response } from "express";
import prisma from "../lib/db";
import { PostStatus, Platform } from "../types/enums";
import { getAuth } from "@clerk/express";
import { Prisma } from "../generated/prisma";

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" })
        }
        const { status, platform, page = 1, limit = 10 } = req.query;
        const where: Prisma.PostWhereInput = {
            user: {
                clerkId: userId
            }
        }
        if (typeof status === "string" && status in PostStatus) {
            where.status = status as PostStatus;
        }

        if (typeof platform === "string" && platform in Platform) {
            where.platform = platform as Platform;
        }

        const posts = await prisma.post.findMany({
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
        })
        const total = await prisma.post.count({ where });
        res.json({
            posts,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        })

    } catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching posts" })
    }
}

export const createPost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { content, images, socialAccountId, scheduledAt, mentions } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" })
        }
        if (!content || !socialAccountId) {
            return res.status(400).json({ error: "Content and socialAccountId" })
        }
        const socialAccount = await prisma.socialAccount.findFirst({
            where: {
                id: socialAccountId,
                user: { clerkId: userId }
            }
        });

        if (!socialAccount) {
            return res.status(404).json({ error: 'Social account not found' });
        }
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });
        const post = await prisma.post.create({
            data: {
                content,
                images: images || [],
                platform: socialAccount.platform,
                status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                userId: user!.id,
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
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while creating post" })
    }
}

export const getPost = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const post = await prisma.post.findFirst({
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
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while fetching post" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    const { content, images, scheduledAt, mentions } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify post belongs to user
    const existingPost = await prisma.post.findFirst({
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

    const updateData: any = {
      ...(content && { content }),
      ...(images && { images }),
      //...(mentions && { mentions })
    };

    if (scheduledAt) {
      updateData.scheduledAt = new Date(scheduledAt);
      updateData.status = 'SCHEDULED';
    } else if (scheduledAt === null) {
      updateData.scheduledAt = null;
      updateData.status = 'DRAFT';
    }

    const post = await prisma.post.update({
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
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while updating post" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify post belongs to user
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        user: { clerkId: userId }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while deleting post" });
  }
};

//duplicate post to post to same or different platforms
export const duplicatePost = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    const { platform, socialAccountId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const originalPost = await prisma.post.findFirst({
      where: {
        id: postId,
        user: { clerkId: userId }
      }
    });

    if (!originalPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const duplicatedPost = await prisma.post.create({
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
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while duplicating post" });
  }
};
