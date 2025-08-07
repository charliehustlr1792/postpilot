import { Request, Response } from 'express'
import prisma from '../lib/db'
import { getAuth } from '@clerk/express';

export const createUser = async (req: Request, res: Response) => {
    try {
        const { clerkId, email, firstName, lastName } = req.body;
        if (!clerkId || !email) {
            res.status(400).json({ error: "Clerk Id and email are required" })
        }
        if (!firstName || !lastName) {
            res.status(400).json({ error: "First name and last name are required" })
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

    } catch (error) {
        res.status(500).json({ error: "Something went wrong while creating user" })
    }
}

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" })
        }
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                posts: true,
                accounts: true
            }
        })
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while fetching current user" })
    }
}


export const updateUser = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" })
        }
        const { firstName, lastName, avatar } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).json({ error: "First name, last nameare required" })
        }
        const updatedUser = await prisma.user.update({
            where: { clerkId: userId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(avatar && { avatar })
            }
        })
        res.status(200).json({ updatedUser })
    } catch (error) {
        res.status(500).json({ error: "Something went wrong while updating user" })
    }
}


export const deleteUser =async(req:Request,res:Response)=>{
    try{
        const {userId}=getAuth(req);
        if(!userId){
            return res.status(401).json({error:"User not authenticated"})
        }
        const deltedUser =await prisma.user.delete({
            where:{clerkId:userId}
        })
        res.status(200).json({message:"User deleted successfully",user:deltedUser}) 
    }catch(error){
        res.status(500).json({error:"Something went wrong while deleting user"})
    }
}

export const getUserStats =async (req:Request,res:Response)=>{
    try{
        const {userId}=getAuth(req);
        if(!userId){
            return res.status(401).json({error:"User not authenticated"})
        }
        const userStats=await prisma.user.findUnique({
            where:{clerkId:userId},
            include:{
                _count:{
                    select:{
                        posts:true,
                        accounts:true,
                    }
                }
            }
        })
        if(!userStats){
            return res.status(404).json({error:"User stats not found"})
        }   
        res.status(200).json({
            stats:{
                totalPosts:userStats._count.posts,
                totalAccounts:userStats._count.accounts,
                plan:userStats.plan || 'Free',
                memberSince:userStats.createdAt,
            }
        })

    }catch(error){
        res.status(500).json({error:"Something went wrong while fetching user stats"})
    }
}