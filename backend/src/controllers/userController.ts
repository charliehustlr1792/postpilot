import {Request,Response} from 'express'
import prisma from '../lib/db'

export const createUser =async(req:Request,res:Response)=>{
    try{
        const {clerkId,email,firstName,lastName}=req.body;
        if(!clerkId || !email){
            res.status(400).json({error:"Clerk Id and email are required"})
        }
        if(!firstName || !lastName){
            res.status(400).json({error:"First name and last name are required"})
        }
        const user = await prisma.user.create({
                data:{
                    clerkId,
                    email,
                    firstName,
                    lastName    
                }
        })
        res.status(201).json({user})

    }catch(error){
        res.status(500).json({error:"Something went wrong while creating user"})
    }
}