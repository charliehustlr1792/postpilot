import { Job } from 'bullmq'
import prisma from '../lib/db'
import { publishPostToSocialMedia } from '../services/socialMediaService'
import { PostPublishJobData } from '../types/postPublishJobData'

export const processPostPublish = async (job: Job<PostPublishJobData>) => {
    const { postTargetId } = job.data;
    try {
        console.log(`Processing publish job for target:${postTargetId}`);

        // Get the target along with its post content and account credentials.
        const target = await prisma.postTarget.findUnique({
            where: { id: postTargetId },
            include: {
                post: true,
                account: true,
            },
        })

        if (!target) {
            throw new Error(`Post target not found:${postTargetId}`)
        }

        if (target.status === 'PUBLISHED') {
            console.log('Target already published, skipping');
            return { success: true, message: 'Already published' }
        }

        const result = await publishPostToSocialMedia({
            targetId: target.id,
            content: target.post.content,
            images: target.post.images,
            account: {
                id: target.account.id,
                platform: target.account.platform,
                username: target.account.username,
                accessToken: target.account.accessToken,
                refreshToken: target.account.refreshToken,
            },
        })

        // Mark the target published and store the platform's response.
        await prisma.postTarget.update({
            where: { id: postTargetId },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
                platformPostId: result.platformPostId,
                url: result.url ?? null,
                error: null,
            },
        })

        // Clear the scheduled job record for this target.
        await prisma.scheduledJob.deleteMany({ where: { postTargetId } })

        console.log(`Successfully published target:${postTargetId}`)
        return result
    } catch (error) {
        console.error(`Error publishing target ${postTargetId}:`, error)

        const message = error instanceof Error ? error.message : String(error)

        // Mark this target failed (other targets of the same post are unaffected).
        await prisma.postTarget.update({
            where: { id: postTargetId },
            data: { status: 'FAILED', error: message },
        })

        await prisma.scheduledJob.updateMany({
            where: { postTargetId },
            data: {
                status: 'FAILED',
                error: message,
                attempts: { increment: 1 },
            },
        })

        throw error
    }
}
