import { Request, Response } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
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
        const clerkUser = await clerkClient.users.getUser(userId);
        const email =
            clerkUser.emailAddresses.find((entry) => entry.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
            clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            throw new AppError(400, 'No email address found for Clerk user');
        }

        await prisma.user.create({
            data: {
                clerkId: clerkUser.id,
                email,
                firstName: clerkUser.firstName ?? null,
                lastName: clerkUser.lastName ?? null,
                avatar: clerkUser.imageUrl ?? null,
            },
        });
    }

    const resolvedUser = user ?? (await prisma.user.findUnique({ where: { clerkId: userId } }));
    if (!resolvedUser) {
        throw new AppError(404, 'User not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DASHBOARD_WINDOW_DAYS);

    const [totalPosts, scheduledPosts, metrics] = await Promise.all([
        prisma.post.count({ where: { userId: resolvedUser.id } }),
        prisma.post.count({
            where: { userId: resolvedUser.id, targets: { some: { status: 'SCHEDULED' } } },
        }),
        prisma.analytics.aggregate({
            where: { userId: resolvedUser.id, recordedAt: { gte: startDate } },
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
