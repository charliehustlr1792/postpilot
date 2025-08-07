import prisma from "../lib/db";
import { Prisma } from "../generated/prisma";
import { Request,Response } from "express";
import { getAuth } from "@clerk/express";

//get all connected soical accounts
export const getSocialAccounts=async(req:Request,res:Response)=>{
    try{
        const {userId}=getAuth(req)
        if(!userId){
            return res.status(401).json({error:"User not authenticated"})
        }
        const accounts=await prisma.socialAccount.findMany({
            where:{
                user:{clerkId:userId}
            },
            select:{
                id:true,
                platform:true,
                username:true,
                displayName:true,
                profileImage:true,
                isActive:true,
                createdAt:true,
            }
        })
        res.status(200).json({
            accounts
        })
    }catch(error){
        res.status(500).json({error:"Something went wrong while fetching social accounts of user"})
    }
}

export const connectAccount=async(req:Request,res:Response)=>{
    try{
        const {userId}=getAuth(req)
        if(!userId){
            return res.status(401).json({error:"User not authenticated"})
        }
        const {platform,username,displayName,profileImage,accessToken,refreshToken} = req.body;
        if(!platform || !username || !accessToken){
            res.status(400).json({error:"Platform, username and access token are required"})
        }
        const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const account= await prisma.socialAccount.create({
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
    })
    res.status(201).json({
        account
    })
    }catch(error){
        if(error instanceof Prisma.PrismaClientKnownRequestError && error.code==="P2002"){
            return res.status(400).json({error:"Social account already connected"})
        }
        res.status(500).json({
            error:"Something went wrong while connecting social account"
        })
    }
}

export const deleteAccount=async(req:Request,res:Response)=>{
    try{
        const {userId}=getAuth(req)
        if(!userId){
            return res.status(401).json({error:"User not authenticated"})
        }
        const {accountId} = req.params;
        if(!accountId){
            return res.status(400).json({error:"Account ID is required"})
        }
        const account=await prisma.socialAccount.delete({
            where:{
                id:accountId,
                user:{clerkId:userId}
            }
        })
        if(!account){
            return res.status(404).json({error:"Social account not found"})
        }
        res.status(200).json({
            message:"Social account account disconnected successfully",
            account
        })
    }catch(error){
        res.status(500).json({error:"Something went wrong while deleting social account"})
    }
}
