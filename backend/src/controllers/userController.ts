import { Request, Response } from 'express'
import prisma from '../lib/db'
import { getAuth } from '@clerk/express';
import { AppError } from '../lib/AppError';

export const createUser = async (req: Request, res: Response) => {
    const { clerkId, email, firstName, lastName } = req.body;
    if (!clerkId || !email) {
        throw new AppError(400, "Clerk Id and email are required");
    }
    if (!firstName || !lastName) {
        throw new AppError(400, "First name and last name are required");
    }
    const user = await prisma.user.create({
        data: {
            clerkId,
            email,
            firstName,
            lastName
        }
    })
    res.status(201).json({ user })
}

export const getCurrentUser = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new AppError(401, "User not authenticated");
    }
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
            posts: true,
            accounts: true
        }
    })
    if (!user) {
        throw new AppError(404, "User not found");
    }
    res.status(200).json({ user })
}


export const updateUser = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new AppError(401, "User not authenticated");
    }
    const { firstName, lastName, avatar } = req.body;
    const updatedUser = await prisma.user.update({
        where: { clerkId: userId },
        data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(avatar && { avatar })
        }
    })
    res.status(200).json({ updatedUser })
}


export const deleteUser = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new AppError(401, "User not authenticated");
    }
    const deltedUser = await prisma.user.delete({
        where: { clerkId: userId }
    })
    res.status(200).json({ message: "User deleted successfully", user: deltedUser })
}

export const getUserStats = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new AppError(401, "User not authenticated");
    }
    const userStats = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
            _count: {
                select: {
                    posts: true,
                    accounts: true,
                }
            }
        }
    })
    if (!userStats) {
        throw new AppError(404, "User stats not found");
    }
    res.status(200).json({
        stats: {
            totalPosts: userStats._count.posts,
            totalAccounts: userStats._count.accounts,
            plan: userStats.plan || 'Free',
            memberSince: userStats.createdAt,
        }
    })
}
