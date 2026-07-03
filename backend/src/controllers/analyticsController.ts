import { Request, Response } from 'express'
import { getAuth } from '@clerk/express'
import prisma from '../lib/db'
import { AppError } from '../lib/AppError'

// Gets analytics for all targets of a specific post.
export const getPostAnalytics = async (req: Request, res: Response) => {
    const { userId } = getAuth(req)
    const { postId } = req.params
    if (!userId) {
        throw new AppError(401, 'Unauthorized')
    }
    const post = await prisma.post.findFirst({
        where: { id: postId, user: { clerkId: userId } },
    })
    if (!post) {
        throw new AppError(404, 'Post not found')
    }
    const analytics = await prisma.analytics.findMany({
        where: { postTarget: { postId } },
        orderBy: { recordedAt: 'desc' },
    })
    res.json({ analytics })
}

// Gets an aggregated analytics overview for the user.
export const getAnalyticsOverview = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { days = 30 } = req.query;
    if (!userId) {
        throw new AppError(401, 'Unauthorized')
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
        throw new AppError(404, 'User not found')
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

    // Per-platform breakdown: sum every analytics row in the window grouped by
    // the target's platform, so the pieces add up to the totals above.
    // Engagement = likes + shares + comments; posts = distinct targets seen.
    const platformRows = await prisma.analytics.findMany({
        where: { userId: user.id, recordedAt: { gte: startDate } },
        select: {
            postTargetId: true,
            impressions: true,
            likes: true,
            shares: true,
            comments: true,
            clicks: true,
            reach: true,
            saves: true,
            postTarget: { select: { platform: true } },
        },
    })

    const breakdownMap = new Map<
        string,
        {
            platform: string;
            impressions: number;
            likes: number;
            shares: number;
            comments: number;
            clicks: number;
            reach: number;
            saves: number;
            engagement: number;
            targetIds: Set<string>;
        }
    >()

    for (const row of platformRows) {
        const platform = row.postTarget.platform
        let entry = breakdownMap.get(platform)
        if (!entry) {
            entry = {
                platform,
                impressions: 0,
                likes: 0,
                shares: 0,
                comments: 0,
                clicks: 0,
                reach: 0,
                saves: 0,
                engagement: 0,
                targetIds: new Set<string>(),
            }
            breakdownMap.set(platform, entry)
        }
        entry.impressions += row.impressions
        entry.likes += row.likes
        entry.shares += row.shares
        entry.comments += row.comments
        entry.clicks += row.clicks
        entry.reach += row.reach
        entry.saves += row.saves
        entry.engagement += row.likes + row.shares + row.comments
        entry.targetIds.add(row.postTargetId)
    }

    const platformBreakdown = Array.from(breakdownMap.values()).map(
        ({ targetIds, ...rest }) => ({ ...rest, posts: targetIds.size })
    )

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
        platformBreakdown,
        dateRange: {
            startDate,
            endDate: new Date(),
            days: Number(days),
        },
    });
}

// Record analytics for a single target (called by background sync jobs).
export const recordAnalytics = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { targetId } = req.params
    const { impressions, likes, shares, comments, clicks, reach, saves } = req.body;
    if (!userId) {
        throw new AppError(401, 'Unauthorized')
    }

    const target = await prisma.postTarget.findFirst({
        where: { id: targetId, post: { user: { clerkId: userId } } },
        include: { post: { select: { userId: true } } },
    })

    if (!target) {
        throw new AppError(404, 'Post target not found')
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
}

// Get analytics trends grouped by date.
export const getAnalyticsTrends = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { period = 'daily', days = 30 } = req.query;

    if (!userId) {
        throw new AppError(401, 'Not authenticated');
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
        throw new AppError(404, 'User not found');
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
}
