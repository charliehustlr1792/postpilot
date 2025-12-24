"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deleteUser = exports.updateUser = exports.getCurrentUser = exports.createUser = void 0;
const db_1 = __importDefault(require("../lib/db"));
const express_1 = require("@clerk/express");
const createUser = async (req, res) => {
    try {
        const { clerkId, email, firstName, lastName } = req.body;
        if (!clerkId || !email) {
            res.status(400).json({ error: "Clerk Id and email are required" });
        }
        if (!firstName || !lastName) {
            res.status(400).json({ error: "First name and last name are required" });
        }
        const user = await db_1.default.user.create({
            data: {
                clerkId,
                email,
                firstName,
                lastName
            }
        });
        res.status(201).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while creating user" });
    }
};
exports.createUser = createUser;
const getCurrentUser = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const user = await db_1.default.user.findUnique({
            where: { clerkId: userId },
            include: {
                posts: true,
                accounts: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching current user" });
    }
};
exports.getCurrentUser = getCurrentUser;
const updateUser = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const { firstName, lastName, avatar } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).json({ error: "First name, last nameare required" });
        }
        const updatedUser = await db_1.default.user.update({
            where: { clerkId: userId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(avatar && { avatar })
            }
        });
        res.status(200).json({ updatedUser });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while updating user" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const deltedUser = await db_1.default.user.delete({
            where: { clerkId: userId }
        });
        res.status(200).json({ message: "User deleted successfully", user: deltedUser });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while deleting user" });
    }
};
exports.deleteUser = deleteUser;
const getUserStats = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const userStats = await db_1.default.user.findUnique({
            where: { clerkId: userId },
            include: {
                _count: {
                    select: {
                        posts: true,
                        accounts: true,
                    }
                }
            }
        });
        if (!userStats) {
            return res.status(404).json({ error: "User stats not found" });
        }
        res.status(200).json({
            stats: {
                totalPosts: userStats._count.posts,
                totalAccounts: userStats._count.accounts,
                plan: userStats.plan || 'Free',
                memberSince: userStats.createdAt,
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching user stats" });
    }
};
exports.getUserStats = getUserStats;
