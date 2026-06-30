import { Job } from 'bullmq'
import prisma from '../lib/db'
import { publishPostToSocialMedia, refreshAccessToken } from '../services/socialMediaService'
import { PostPublishJobData } from '../types/postPublishJobData'
import { PublishablePost } from '../types/post'
import { PlatformPublishError } from '../types/publishError'
import { decrypt } from '../lib/crypto'
import { getOAuthProvider } from '../services/oauth'
import { Platform } from '../types/enums'
import { SocialAccount } from '../generated/prisma'

// Refresh the token proactively if it expires within this window.
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000

// Refreshes the account's token and returns the updated row.
async function refreshAccount(account: SocialAccount): Promise<SocialAccount> {
    await refreshAccessToken(account.id)
    const updated = await prisma.socialAccount.findUnique({ where: { id: account.id } })
    return updated ?? account
}

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

        let account = target.account
        const provider = getOAuthProvider(account.platform as Platform)
        const canRefresh = Boolean(provider.refresh && account.refreshToken)

        // Proactive refresh when the token is expired or about to expire. A
        // failure here isn't fatal — the current token may still work.
        if (
            canRefresh &&
            account.tokenExpiry &&
            account.tokenExpiry.getTime() - Date.now() < TOKEN_REFRESH_THRESHOLD_MS
        ) {
            try {
                account = await refreshAccount(account)
            } catch (err) {
                console.warn(`Proactive token refresh failed for account ${account.id}:`, err)
            }
        }

        // Tokens are encrypted at rest; hand the platform services plaintext.
        const buildPost = (acc: SocialAccount): PublishablePost => ({
            targetId: target.id,
            content: target.post.content,
            images: target.post.images,
            account: {
                id: acc.id,
                platform: acc.platform,
                username: acc.username,
                platformAccountId: acc.platformAccountId,
                accessToken: decrypt(acc.accessToken),
                refreshToken: acc.refreshToken ? decrypt(acc.refreshToken) : null,
            },
        })

        let result
        try {
            result = await publishPostToSocialMedia(buildPost(account))
        } catch (error) {
            // Reactive refresh + single retry if the platform rejected the token.
            if (canRefresh && error instanceof PlatformPublishError && error.isAuthError) {
                console.log(`Auth error on target ${postTargetId}; refreshing token and retrying`)
                account = await refreshAccount(account)
                result = await publishPostToSocialMedia(buildPost(account))
            } else {
                throw error
            }
        }

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
