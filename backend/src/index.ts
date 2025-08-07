import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/db'
import userRoutes from './routes/userRoutes';
import socialAccountRoutes from './routes/socialAccountsRoutes';
import { clerkClient,clerkMiddleware,requireAuth,getAuth } from '@clerk/express';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.get('/', (req, res) => {
  res.send('PostPilot API running...');
});
app.use('/api',userRoutes);
app.use('/api', socialAccountRoutes);

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


//test route to check if database is working or not
app.get('/api/test-db',async(req,res)=>{
  try{
    const countUser=await prisma.user.count();
    res.json({count:countUser});
  }catch(error){
    console.error('Error connecting to the database:',error);
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));