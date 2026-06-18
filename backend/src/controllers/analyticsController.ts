import { Request, Response } from 'express'
import { getAuth } from '@clerk/express'
import prisma from '../lib/db'

// Gets analytics for all targets of a specific post.
export const getPostAnalytics = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req)
        const { postId } = req.params
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
        const post = await prisma.post.findFirst({
            where: { id: postId, user: { clerkId: userId } },
        })
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }
        const analytics = await prisma.analytics.findMany({
            where: { postTarget: { postId } },
            orderBy: { recordedAt: 'desc' },
        })
        res.json({ analytics })
    } catch (error) {
        console.error('Error fetching post analytics:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

// Gets an aggregated analytics overview for the user.
export const getAnalyticsOverview = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { days = 30 } = req.query;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));

        const user = await prisma.user.findUnique({ where: { clerkId: userId } })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const totalMetrics = await prisma.analytics.aggregate({
            where: {
                userId: user.id,
                recordedAt: { gte: startDate },
            },
            _sum: {
                impressions: true,
                likes: true,
                shares: true,
                comments: true,
                clicks: true,
                reach: true,
                saves: true,
            },
            _avg: {
                engagementRate: true,
                ctr: true,
            },
        })

        // Top posts = posts with at least one target published in the window,
        // ranked by total engagement across their targets' latest analytics.
        const posts = await prisma.post.findMany({
            where: {
                userId: user.id,
                targets: { some: { publishedAt: { gte: startDate } } },
            },
            include: {
                targets: {
                    include: {
                        account: { select: { platform: true, username: true } },
                        analytics: { orderBy: { recordedAt: 'desc' }, take: 1 },
                    },
                },
            },
            take: 20,
        })

        const topPosts = posts
            .map((post) => {
                const totalEngagement = post.targets.reduce((sum, target) => {
                    const a = target.analytics[0]
                    return sum + (a ? a.likes + a.shares + a.comments : 0)
                }, 0)
                return { ...post, totalEngagement }
            })
            .sort((a, b) => b.totalEngagement - a.totalEngagement)
            .slice(0, 5)

        res.json({
            overview: {
                totalImpressions: totalMetrics._sum?.impressions || 0,
                totalLikes: totalMetrics._sum?.likes || 0,
                totalShares: totalMetrics._sum?.shares || 0,
                totalComments: totalMetrics._sum?.comments || 0,
                totalClicks: totalMetrics._sum?.clicks || 0,
                totalReach: totalMetrics._sum?.reach || 0,
                totalSaves: totalMetrics._sum?.saves || 0,
                avgEngagementRate: totalMetrics._avg?.engagementRate || 0,
                avgCTR: totalMetrics._avg?.ctr || 0,
            },
            topPosts,
            dateRange: {
                startDate,
                endDate: new Date(),
                days: Number(days),
            },
        });
    } catch (error) {
        res.status(500).json({ error: "something went wrong while fetching overview" })
    }
}

// Record analytics for a single target (called by background sync jobs).
export const recordAnalytics = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { targetId } = req.params
        const { impressions, likes, shares, comments, clicks, reach, saves } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const target = await prisma.postTarget.findFirst({
            where: { id: targetId, post: { user: { clerkId: userId } } },
            include: { post: { select: { userId: true } } },
        })

        if (!target) {
            return res.status(404).json({ error: 'Post target not found' })
        }

        const totalEngagement = (likes || 0) + (comments || 0) + (shares || 0);
        const engagementRate = impressions ? (totalEngagement / impressions) * 100 : 0;
        const ctr = impressions ? ((clicks || 0) / impressions) * 100 : 0;

        const analytics = await prisma.analytics.create({
            data: {
                postTargetId: target.id,
                userId: target.post.userId,
                impressions: impressions || 0,
                likes: likes || 0,
                shares: shares || 0,
                comments: comments || 0,
                clicks: clicks || 0,
                reach: reach || 0,
                saves: saves || 0,
                engagementRate,
                ctr,
            },
        });

        res.status(201).json({ analytics });
    } catch (error) {
        return res.status(500).json({ error: 'Error recording analytics' })
    }
}

// Get analytics trends grouped by date.
export const getAnalyticsTrends = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { period = 'daily', days = 30 } = req.query;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));

        const trends = await prisma.analytics.findMany({
            where: {
                userId: user.id,
                recordedAt: { gte: startDate },
            },
            orderBy: { recordedAt: 'asc' },
            select: {
                impressions: true,
                likes: true,
                shares: true,
                comments: true,
                clicks: true,
                reach: true,
                engagementRate: true,
                ctr: true,
                recordedAt: true,
            },
        });

        const trendData = trends.reduce((acc: any, item) => {
            const date = item.recordedAt.toISOString().split('T')[0];

            if (!acc[date]) {
                acc[date] = {
                    date,
                    impressions: 0,
                    likes: 0,
                    shares: 0,
                    comments: 0,
                    clicks: 0,
                    reach: 0,
                    engagementRate: 0,
                    ctr: 0,
                    count: 0,
                };
            }

            acc[date].impressions += item.impressions;
            acc[date].likes += item.likes;
            acc[date].shares += item.shares;
            acc[date].comments += item.comments;
            acc[date].clicks += item.clicks;
            acc[date].reach += item.reach;
            acc[date].engagementRate += item.engagementRate;
            acc[date].ctr += item.ctr;
            acc[date].count += 1;

            return acc;
        }, {});

        Object.values(trendData).forEach((day: any) => {
            day.engagementRate = day.engagementRate / day.count;
            day.ctr = day.ctr / day.count;
            delete day.count;
        });

        res.json({
            trends: Object.values(trendData),
            period,
            dateRange: {
                startDate,
                endDate: new Date(),
                days: Number(days),
            },
        });
    } catch (error) {
        res.status(500).json({ error: "something went wrong while fetching trends" })
    }
}
