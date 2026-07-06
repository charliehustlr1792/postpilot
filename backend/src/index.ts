// Load env vars before any other import runs (queue.ts opens a Redis
// connection at import time and needs REDIS_URL to be set).
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './lib/db'
import userRoutes from './routes/userRoutes';
import socialAccountRoutes from './routes/socialAccountsRoutes';
import postRoutes from './routes/postRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import scheduleRoutes from './routes/scheduleRoutes'
import uploadRoutes from './routes/uploadRoutes'
import dashboardRoutes from './routes/dashboardRoutes'
import teamRoutes from './routes/teamRoutes'
import webhookRoutes from './routes/webhookRoutes'
import {postPublishQueue} from './lib/queue'
import {processPostPublish} from './jobs/postPublishProcessor'
import { clerkClient,clerkMiddleware,requireAuth,getAuth } from '@clerk/express';
import { scheduleAnalyticsSync } from './workers'
import { notFound, errorHandler } from './middleware/errorHandler'

dotenv.config();
const app = express();

// The app runs behind the frontend reverse proxy (one hop); trust it so req.ip
// and rate-limit keys resolve correctly.
app.set('trust proxy', 1);

// Security headers.
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

// Webhooks need the raw request body for signature verification, so they must
// be registered BEFORE the global JSON body parser.
app.use('/api', webhookRoutes);

app.use(express.json());
app.get('/', (req, res) => {
  res.send('PostPilot API running...');
});
app.use('/api',userRoutes);
app.use('/api', socialAccountRoutes);
app.use('/api', postRoutes);
app.use('/api', analyticsRoutes);
app.use('/api',scheduleRoutes);
app.use('/api', uploadRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', teamRoutes);

// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})


process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  // Workers will be cleaned up automatically
  process.exit(0);
});


//test route to check if database is working or not
app.get('/api/test-db',async(req,res)=>{
  try{
    const countUser=await prisma.user.count();
    res.json({count:countUser});
  }catch(error){
    console.error('Error connecting to the database:',error);
  }
})

// Unmatched routes → 404, then the central error handler (must be last).
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Register the recurring analytics-sync job (idempotent across restarts).
scheduleAnalyticsSync().catch((err) =>
  console.error('Failed to schedule analytics sync:', err)
);