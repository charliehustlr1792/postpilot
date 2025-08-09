import {Router} from 'express'
import {requireAuth} from '@clerk/express'
import { schedulePost,cancelScheduledPost,getScheduledPosts } from '../controllers/scheduleController'

const router=Router();
router.post('/posts/:postId/schedule',requireAuth(),schedulePost);
router.delete('/posts/:postId/schedule',requireAuth(),cancelScheduledPost)
router.get('/scheduled-posts',requireAuth(),getScheduledPosts)

export default router;