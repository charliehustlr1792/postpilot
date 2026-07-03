import prisma from "../lib/db";
import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { encrypt } from "../lib/crypto";
import { AppError } from "../lib/AppError";

//get all connected soical accounts
export const getSocialAccounts = async (req: Request, res: Response) => {
    const { userId } = getAuth(req)
    if (!userId) {
        throw new AppError(401, "User not authenticated")
    }
    const accounts = await prisma.socialAccount.findMany({
        where: {
            user: { clerkId: userId }
        },
        select: {
            id: true,
            platform: true,
            username: true,
            displayName: true,
            profileImage: true,
            isActive: true,
            createdAt: true,
        }
    })
    res.status(200).json({ accounts })
}

export const connectAccount = async (req: Request, res: Response) => {
    const { userId } = getAuth(req)
    if (!userId) {
        throw new AppError(401, "User not authenticated")
    }
    const { platform, username, displayName, profileImage, accessToken, refreshToken } = req.body;
    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    });

    if (!user) {
        throw new AppError(404, 'User not found');
    }
    // A duplicate (userId, platform) hits the unique constraint (P2002), which
    // the central error handler maps to 409.
    const account = await prisma.socialAccount.create({
        data: {
            platform,
            username,
            displayName,
            profileImage,
            // Stored encrypted at rest, matching the OAuth connect path.
            accessToken: encrypt(accessToken),
            refreshToken: refreshToken ? encrypt(refreshToken) : null,
            userId: user.id
        },
        select: {
            id: true,
            platform: true,
            username: true,
            displayName: true,
            profileImage: true,
            isActive: true,
            createdAt: true
        }
    })
    res.status(201).json({ account })
}

export const deleteAccount = async (req: Request, res: Response) => {
    const { userId } = getAuth(req)
    if (!userId) {
        throw new AppError(401, "User not authenticated")
    }
    const { accountId } = req.params;
    const account = await prisma.socialAccount.delete({
        where: {
            id: accountId,
            user: { clerkId: userId }
        }
    })
    res.status(200).json({
        message: "Social account account disconnected successfully",
        account
    })
}
