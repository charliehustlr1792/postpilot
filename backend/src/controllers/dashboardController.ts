import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import prisma from '../lib/db';
import { AppError } from '../lib/AppError';

// Reach/engagement are measured over this trailing window (matches what the
// analytics overview used before consolidation).
const DASHBOARD_WINDOW_DAYS = 30;

// Single endpoint backing the dashboard stat cards: total posts, trailing reach
// and engagement rate, and the count of posts with a scheduled target — all in
// one round-trip instead of three.
export const getDashboardOverview = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new AppError(401, 'User not authenticated');
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DASHBOARD_WINDOW_DAYS);

    const [totalPosts, scheduledPosts, metrics] = await Promise.all([
        prisma.post.count({ where: { userId: user.id } }),
        prisma.post.count({
            where: { userId: user.id, targets: { some: { status: 'SCHEDULED' } } },
        }),
        prisma.analytics.aggregate({
            where: { userId: user.id, recordedAt: { gte: startDate } },
            _sum: { reach: true },
            _avg: { engagementRate: true },
        }),
    ]);

    res.json({
        stats: {
            totalPosts,
            totalReach: metrics._sum?.reach || 0,
            engagementRate: metrics._avg?.engagementRate || 0,
            scheduledPosts,
        },
    });
};
