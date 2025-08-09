import {Job} from 'bullmq'
import prisma from '../lib/db'
import {publishPostToSocialMedia} from '../services/socialMediaService'
import { PostPublishJobData } from '../types/postPublishJobData'

export const processPostPublish=async(job:Job<PostPublishJobData>)=>{
    const {postId,userId,socialAccountId}=job.data;
    try{
        console.log(`Processing publish job for post:${postId}`);

        //get the post details
        const post=await prisma.post.findUnique({
            where:{id:postId},
            include:{
                account:true,
                user:true
            }
        })

        if(!post){
            throw new Error(`Post not found:${postId}`)
        }

        if(post.status==='PUBLISHED'){
            console.log('Post already published,skipping');
            return {sucess:true,message:'ALready published'}
        }

        const result=await publishPostToSocialMedia(post);//publishes to social media platform

        //update post status
        await prisma.post.update({
            where:{id:postId},
            data:{
                status:'PUBLISHED',
                publishedAt:new Date(),
                //platformPostId:result.platformPostId,
            }
        })

        //remove scheduled job record
        await prisma.scheduledJob.deleteMany({
            where:{postId}
        })

        console.log(`Sucessfully published post:${postId}`)
        return result

    }catch(error){
        console.error(`Error publishing post ${postId}:`,error)

        //update post status to failed 
        await prisma.post.update({
            where:{id:postId},
            data:{
                status:'FAILED',
            }
        })

        //update scheduled job with error
        await prisma.scheduledJob.updateMany({
            where:{postId},
            data:{
                status:'FAILED',
                error: (error instanceof Error ? error.message : String(error)),
                attempts:{
                    increment:1,
                }
            }
        })

        throw error
    }
}