import { Request, Response } from "express";
import { getAuth } from '@clerk/express'
import prisma from '../lib/db'
import { postPublishQueue } from '../lib/queue'

//schedule a post for publishing 
export const schedulePost = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { postId } = req.params;
        const { scheduledAt } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' })
        }

        if (!scheduledAt) {
            return res.status(400).json({ error: 'scheduledAt is required' })
        }

        const scheduledDate = new Date(scheduledAt);

        if (scheduledAt <= new Date()) {
            return res.status(400).json({ error: 'Scheduled time must be in the future' })
        }

        const post = await prisma.post.findFirst({
            where: {
                id: postId,
                user: { clerkId: userId },
            },
            include: {
                account: true,
            },
        })

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        //adding job to bullmq queue
        const job=await postPublishQueue.add(
            'publish-post',{
                postId:post.id,
                userId:post.userId,
                socialAccountId:post.accountId,
            },{
                delay:scheduledDate.getTime()-Date.now(),
                jobId:`post-${postId}-${scheduledDate.getTime()}`
            }
        )

        //update post status and scheduled time
        const updatedPost =await prisma.post.update({
            where:{id:postId},
            data:{
                status:'SCHEDULED',
                scheduledAt:scheduledDate,
            }
        })
        

        //create scheduled job record
        await prisma.scheduledJob.create({
            data:{
                postId,
                jobId:job.id!,//bull mq job id
                scheduledFor:scheduledDate,
                status:'PENDING',
            }
        })

        res.json({
            messge:'Post schedule successfully',
            post:updatedPost,
            scheduledAt:scheduledDate,
            jobId:job.id,
        })
    } catch (error) {
        console.error('Schedule post error:', error);
        res.status(500).json({
            error: 'Something went wrong while scheduling post'
        })
    }
}

//cancel a scheduled post
export const cancelScheduledPost=async(req:Request,res:Response)=>{
    try{
        const {userId}=getAuth(req);
        const {postId}=req.params;
        if(!userId){
            return res.status(401).json({error:'Not authenticated'})
        }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        user: { clerkId: userId },
        status: 'SCHEDULED',
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Scheduled post not found' });
    }


    const scheduledJob=await prisma.scheduledJob.findFirst({
        where:{postId,status:'PENDING'}
    })

    if(scheduledJob){
        //removing job from bullmq queue
        const job =await postPublishQueue.getJob(scheduledJob.jobId);
        if(job){
            await job.remove()
        }

        await prisma.scheduledJob.update({
            where:{id:scheduledJob.id},
            data:{status:'CANCELLED'}
        })

        //update post status back to draft
        const updatedPost=await prisma.post.update({
            where:{id:postId},
            data:{
                status:'DRAFT',
                scheduledAt:null
            }
        })

        res.json({
            message:'Schedule post cancelled successfully',
            post:updatedPost,
        })
    }
    }catch(error){
        console.error('Cancel schedule post error:',error)
        res.status(500).json({error:'Something went wrong while cancelling scheduled post'})
    }
}

//get all scheduled posts for user
export const getScheduledPosts=async(req:Request,res:Response)=>{
    try{
        const {userId}=getAuth(req);
        if(!userId){
            return res.status(401).json({error:'Not authenticated'})
        }

        const scheduledPosts=await prisma.post.findMany({
            where:{
                user:{clerkId:userId},
                status:'SCHEDULED'
            },
            include:{
                account:{
                    select:{
                        platform:true,
                        username:true,
                        displayName:true
                    }
                }
            },
            orderBy:{
                scheduledAt:'asc'
            }
        })
        
        res.json({posts:scheduledPosts})
    }catch(error){
         console.error('Get scheduled posts error:', error);
    res.status(500).json({ error: 'Something went wrong while fetching scheduled posts' });
    }
}
