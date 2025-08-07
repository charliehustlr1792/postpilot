import prisma from "../lib/db";
import { Request,Response } from "express";
import { getAuth } from "@clerk/express";

//get all connected soical accounts
export const getSocialAccounts=async(req:Request,res:Response)=>{
    try{
        

    }catch(error){
        res.status(500).json({error:"Something went wrong while fetching social accounts of user"})
    }
}