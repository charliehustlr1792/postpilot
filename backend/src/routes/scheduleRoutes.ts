import {Router} from 'express'
import {requireAuth} from '@clerk/express'
import { schedulePost,cancelScheduledPost,getScheduledPosts } from '../controllers/scheduleController'
import { validate } from '../middleware/validate'
import { writeLimiter } from '../middleware/rateLimit'
import { postIdParamsSchema } from '../validators/postValidators'
import { schedulePostBodySchema } from '../validators/scheduleValidators'

const router=Router();
router.post('/posts/:postId/schedule',requireAuth(),writeLimiter,validate({ params: postIdParamsSchema, body: schedulePostBodySchema }),schedulePost);
router.delete('/posts/:postId/schedule',requireAuth(),validate({ params: postIdParamsSchema }),cancelScheduledPost)
router.get('/scheduled-posts',requireAuth(),getScheduledPosts)

export default router;
