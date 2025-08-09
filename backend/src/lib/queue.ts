import {Queue,Worker,Job} from 'bullmq';
import IORedis from 'ioredis'

//making redis connection
const connection=new IORedis(process.env.REDIS_URL || 'redis://localhost:6379',{
    maxRetriesPerRequest:3,
})

//create job queues
export const postPublishQueue=new Queue('post-publish',{
    connection,
    defaultJobOptions:{
        removeOnComplete:50,
        removeOnFail:100,
        attempts:3,
        backoff:{
            type:'exponential',
            delay:2000,
        }
    }
})

export const analyticsQueue=new Queue('analytics-sync',{
    connection,
    defaultJobOptions:{
        removeOnComplete:20,
        removeOnFail:50,
        attempts:2,
    }
})

export {connection}