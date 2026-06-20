import {Queue,Worker,Job} from 'bullmq';
import IORedis from 'ioredis'

//making redis connection
// BullMQ requires maxRetriesPerRequest to be null on the shared connection,
// otherwise Workers throw on startup (they rely on blocking commands).
// Managed providers (Upstash, Railway) hand you a rediss:// URL; ioredis
// negotiates TLS automatically from the scheme, so no extra config is needed.
const connection=new IORedis(process.env.REDIS_URL || 'redis://localhost:6379',{
    maxRetriesPerRequest:null,
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