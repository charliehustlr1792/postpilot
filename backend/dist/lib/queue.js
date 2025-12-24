"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = exports.analyticsQueue = exports.postPublishQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
//making redis connection
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
});
exports.connection = connection;
//create job queues
exports.postPublishQueue = new bullmq_1.Queue('post-publish', {
    connection,
    defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        }
    }
});
exports.analyticsQueue = new bullmq_1.Queue('analytics-sync', {
    connection,
    defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 50,
        attempts: 2,
    }
});
