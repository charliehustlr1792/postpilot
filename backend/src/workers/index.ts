import {Worker} from 'bullmq'
import {connection} from '../lib/queue'
import {processPostPublish} from '../jobs/postPublishProcessor'

export const postPublishWorker=new Worker('post-publish',
    processPostPublish,{
        connection,
        concurrency:5//proces upto 5 jobs concurrently
    }
)

//analytics worker(placeholder for later)
export const analyticsWorker=new Worker(
    'analytics-sync',
    async(job)=>{
        console.log('Processing analytics job:',job.data)

        //analytics processing logic here
        return {success:true}
    },{
        connection,
        concurrency:3,
    }
)

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