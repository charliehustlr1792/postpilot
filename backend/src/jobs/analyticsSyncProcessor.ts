import { Job } from 'bullmq'
import prisma from '../lib/db'
import { decrypt } from '../lib/crypto'
import { fetchPostInsights } from '../services/socialMediaService'

// Only sync recently-published targets — older posts rarely change and this
// bounds the work per run.
const SYNC_WINDOW_DAYS = 90

// Pulls fresh metrics for every published target and records a new Analytics
// snapshot per target. One target failing (revoked token, deleted post) doesn't
// stop the rest.
export const processAnalyticsSync = async (_job: Job) => {
    const since = new Date()
    since.setDate(since.getDate() - SYNC_WINDOW_DAYS)

    const targets = await prisma.postTarget.findMany({
        where: {
            status: 'PUBLISHED',
            platformPostId: { not: null },
            publishedAt: { gte: since },
            account: { isActive: true },
        },
        include: {
            account: true,
            post: { select: { userId: true } },
        },
    })

    let synced = 0
    let failed = 0

    for (const target of targets) {
        try {
            const metrics = await fetchPostInsights(
                target.platform,
                target.platformPostId!,
                decrypt(target.account.accessToken)
            )

            const impressions = metrics.impressions ?? 0
            const likes = metrics.likes ?? 0
            const shares = metrics.shares ?? 0
            const comments = metrics.comments ?? 0
            const clicks = metrics.clicks ?? 0
            const reach = metrics.reach ?? 0
            const saves = metrics.saves ?? 0

            const totalEngagement = likes + comments + shares
            const engagementRate = impressions ? (totalEngagement / impressions) * 100 : 0
            const ctr = impressions ? (clicks / impressions) * 100 : 0

            await prisma.analytics.create({
                data: {
                    postTargetId: target.id,
                    userId: target.post.userId,
                    impressions,
                    likes,
                    shares,
                    comments,
                    clicks,
                    reach,
                    saves,
                    engagementRate,
                    ctr,
                },
            })
            synced++
        } catch (error) {
            failed++
            console.error(
                `Analytics sync failed for target ${target.id}:`,
                error instanceof Error ? error.message : error
            )
        }
    }

    console.log(`Analytics sync complete: ${synced} synced, ${failed} failed, ${targets.length} total`)
    return { synced, failed, total: targets.length }
}
