"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsWorker = exports.postPublishWorker = void 0;
const bullmq_1 = require("bullmq");
const queue_1 = require("../lib/queue");
const postPublishProcessor_1 = require("../jobs/postPublishProcessor");
exports.postPublishWorker = new bullmq_1.Worker('post-publish', postPublishProcessor_1.processPostPublish, {
    connection: queue_1.connection,
    concurrency: 5 //proces upto 5 jobs concurrently
});
//analytics worker(placeholder for later)
exports.analyticsWorker = new bullmq_1.Worker('analytics-sync', async (job) => {
    console.log('Processing analytics job:', job.data);
    //analytics processing logic here
    return { success: true };
}, {
    connection: queue_1.connection,
    concurrency: 3,
});
//worker event listeners
exports.postPublishWorker.on('completed', (job) => {
    console.log(`Post publish job ${job.id} completed`);
});
exports.postPublishWorker.on('failed', (job, err) => {
    console.log(`Post publish job ${job?.id} failed:`, err.message);
});
exports.postPublishWorker.on('error', (err) => {
    console.error('Post publish worker error:', err);
});
exports.analyticsWorker.on('completed', (job) => {
    console.log(`Analytics job ${job.id} completed`);
});
exports.analyticsWorker.on('failed', (job, err) => {
    console.log(`Analytics job ${job?.id} failed:`, err.message);
});
