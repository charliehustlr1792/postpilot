"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsTrends = exports.recordAnalytics = exports.getAnalyticsOverview = exports.getPostAnalytics = void 0;
const express_1 = require("@clerk/express");
const db_1 = __importDefault(require("../lib/db"));
//gets analytics for a specific post
const getPostAnalytics = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { postId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const post = await db_1.default.post.findFirst({
            where: {
                id: postId,
                user: {
                    clerkId: userId
                }
            }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const analytics = await db_1.default.analytics.findMany({
            where: { postId },
            orderBy: { recordedAt: 'desc' },
        });
        res.json({ analytics });
    }
    catch (error) {
        console.error('Error fetching post analytics:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPostAnalytics = getPostAnalytics;
//gets analytics overview for user
const getAnalyticsOverview = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { days = 30 } = req.query;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        const user = await db_1.default.user.findUnique({
            where: { clerkId: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const totalMetrics = await db_1.default.analytics.aggregate({
            where: {
                userId: user.id,
                recordedAt: {
                    gte: startDate
                }
            },
            _sum: {
                impressions: true,
                likes: true,
                shares: true,
                comments: true,
                clicks: true,
                reach: true,
                saves: true
            },
            _avg: {
                engagementRate: true,
                ctr: true
            }
        });
        const topPosts = await db_1.default.post.findMany({
            where: {
                userId: user.id,
                publishedAt: {
                    gte: startDate
                }
            },
            include: {
                analytics: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1 // Get the latest analytics for each post
                },
                account: {
                    select: {
                        platform: true,
                        username: true
                    }
                },
            },
            take: 10
        });
        const topPostsWithEngagement = topPosts.map(post => ({
            ...post,
            totalEngagement: post.analytics[0] ? post.analytics[0].likes + post.analytics[0].shares + post.analytics[0].comments : 0,
        })).sort((a, b) => b.totalEngagement - a.totalEngagement).slice(0, 5);
        const platformStats = await db_1.default.analytics.groupBy({
            by: ['postId'],
            where: {
                userId: user.id,
                recordedAt: {
                    gte: startDate
                }
            },
            _sum: {
                impressions: true,
                likes: true,
                shares: true,
                comments: true
            }
        });
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
                avgCTR: totalMetrics._avg?.ctr || 0
            },
            topPosts: topPostsWithEngagement,
            dateRange: {
                startDate,
                endDate: new Date(),
                days: Number(days)
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "something went wrong while fetching overview" });
    }
};
exports.getAnalyticsOverview = getAnalyticsOverview;
//record analytics for a post(this would be called by background jobs)
const recordAnalytics = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { postId } = req.params;
        const { impressions, likes, shares, comments, clicks, reach, saves } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const post = await db_1.default.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId }
            }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // Calculate engagement rate and CTR
        const totalEngagement = (likes || 0) + (comments || 0) + (shares || 0);
        const engagementRate = impressions ? (totalEngagement / impressions) * 100 : 0;
        const ctr = impressions ? ((clicks || 0) / impressions) * 100 : 0;
        const user = await db_1.default.user.findUnique({
            where: { clerkId: userId }
        });
        const analytics = await db_1.default.analytics.create({
            data: {
                postId,
                userId: user.id,
                impressions: impressions || 0,
                likes: likes || 0,
                shares: shares || 0,
                comments: comments || 0,
                clicks: clicks || 0,
                reach: reach || 0,
                saves: saves || 0,
                engagementRate,
                ctr
            }
        });
        res.status(201).json({ analytics });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error recording analytics' });
    }
};
exports.recordAnalytics = recordAnalytics;
//get analytics trends (daily/weekl/monthly)
const getAnalyticsTrends = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { period = 'daily', days = 30 } = req.query;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await db_1.default.user.findUnique({
            where: { clerkId: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        // Get analytics grouped by date
        const trends = await db_1.default.analytics.findMany({
            where: {
                userId: user.id,
                recordedAt: {
                    gte: startDate
                }
            },
            orderBy: {
                recordedAt: 'asc'
            },
            select: {
                impressions: true,
                likes: true,
                shares: true,
                comments: true,
                clicks: true,
                reach: true,
                engagementRate: true,
                ctr: true,
                recordedAt: true
            }
        });
        // Group by date (simplified - you might want more sophisticated grouping)
        const trendData = trends.reduce((acc, item) => {
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
                    count: 0
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
        // Calculate averages for rates
        Object.values(trendData).forEach((day) => {
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
                days: Number(days)
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "something went wrong while fetching trends" });
    }
};
exports.getAnalyticsTrends = getAnalyticsTrends;
