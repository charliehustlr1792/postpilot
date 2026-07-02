import {Worker} from 'bullmq'
import {connection, analyticsQueue} from '../lib/queue'
import {processPostPublish} from '../jobs/postPublishProcessor'
import {processAnalyticsSync} from '../jobs/analyticsSyncProcessor'

export const postPublishWorker=new Worker('post-publish',
    processPostPublish,{
        connection,
        concurrency:5//proces upto 5 jobs concurrently
    }
)

export const analyticsWorker=new Worker(
    'analytics-sync',
    processAnalyticsSync,
    {
        connection,
        concurrency:1,
    }
)

// Registers the repeatable analytics-sync job. BullMQ dedupes by the repeat
// options, so calling this on every startup keeps a single schedule.
const ANALYTICS_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000 // every 6 hours
export async function scheduleAnalyticsSync() {
    await analyticsQueue.add(
        'analytics-sync',
        {},
        { repeat: { every: ANALYTICS_SYNC_INTERVAL_MS } }
    )
}

//worker event listeners
postPublishWorker.on('completed',(job)=>{
    console.log(`Post publish job ${job.id} completed`)
})

postPublishWorker.on('failed',(job,err)=>{
    console.log(`Post publish job ${job?.id} failed:`,err.message)
})

postPublishWorker.on('error',(err)=>{
    console.error('Post publish worker error:',err)
})

analyticsWorker.on('completed',(job)=>{
    console.log(`Analytics job ${job.id} completed`)
})

analyticsWorker.on('failed',(job,err)=>{
    console.log(`Analytics job ${job?.id} failed:`,err.message)
})