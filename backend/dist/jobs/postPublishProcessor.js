"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPostPublish = void 0;
const db_1 = __importDefault(require("../lib/db"));
const socialMediaService_1 = require("../services/socialMediaService");
const processPostPublish = async (job) => {
    const { postId, userId, socialAccountId } = job.data;
    try {
        console.log(`Processing publish job for post:${postId}`);
        //get the post details
        const post = await db_1.default.post.findUnique({
            where: { id: postId },
            include: {
                account: true,
                user: true
            }
        });
        if (!post) {
            throw new Error(`Post not found:${postId}`);
        }
        if (post.status === 'PUBLISHED') {
            console.log('Post already published,skipping');
            return { sucess: true, message: 'ALready published' };
        }
        const result = await (0, socialMediaService_1.publishPostToSocialMedia)(post); //publishes to social media platform
        //update post status
        await db_1.default.post.update({
            where: { id: postId },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
                //platformPostId:result.platformPostId,
            }
        });
        //remove scheduled job record
        await db_1.default.scheduledJob.deleteMany({
            where: { postId }
        });
        console.log(`Sucessfully published post:${postId}`);
        return result;
    }
    catch (error) {
        console.error(`Error publishing post ${postId}:`, error);
        //update post status to failed 
        await db_1.default.post.update({
            where: { id: postId },
            data: {
                status: 'FAILED',
            }
        });
        //update scheduled job with error
        await db_1.default.scheduledJob.updateMany({
            where: { postId },
            data: {
                status: 'FAILED',
                error: (error instanceof Error ? error.message : String(error)),
                attempts: {
                    increment: 1,
                }
            }
        });
        throw error;
    }
};
exports.processPostPublish = processPostPublish;
