"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.connectAccount = exports.getSocialAccounts = void 0;
const db_1 = __importDefault(require("../lib/db"));
const prisma_1 = require("../generated/prisma");
const express_1 = require("@clerk/express");
//get all connected soical accounts
const getSocialAccounts = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const accounts = await db_1.default.socialAccount.findMany({
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
        });
        res.status(200).json({
            accounts
        });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching social accounts of user" });
    }
};
exports.getSocialAccounts = getSocialAccounts;
const connectAccount = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const { platform, username, displayName, profileImage, accessToken, refreshToken } = req.body;
        if (!platform || !username || !accessToken) {
            res.status(400).json({ error: "Platform, username and access token are required" });
        }
        const user = await db_1.default.user.findUnique({
            where: { clerkId: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const account = await db_1.default.socialAccount.create({
            data: {
                platform,
                username,
                displayName,
                profileImage,
                accessToken,
                refreshToken,
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
        });
        res.status(201).json({
            account
        });
    }
    catch (error) {
        if (error instanceof prisma_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return res.status(400).json({ error: "Social account already connected" });
        }
        res.status(500).json({
            error: "Something went wrong while connecting social account"
        });
    }
};
exports.connectAccount = connectAccount;
const deleteAccount = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const { accountId } = req.params;
        if (!accountId) {
            return res.status(400).json({ error: "Account ID is required" });
        }
        const account = await db_1.default.socialAccount.delete({
            where: {
                id: accountId,
                user: { clerkId: userId }
            }
        });
        if (!account) {
            return res.status(404).json({ error: "Social account not found" });
        }
        res.status(200).json({
            message: "Social account account disconnected successfully",
            account
        });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while deleting social account" });
    }
};
exports.deleteAccount = deleteAccount;
