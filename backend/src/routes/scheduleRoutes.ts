import {Router} from 'express'
import { requireApiAuth } from '../middleware/requireApiAuth'
import { schedulePost,cancelScheduledPost,getScheduledPosts } from '../controllers/scheduleController'
import { validate } from '../middleware/validate'
import { writeLimiter } from '../middleware/rateLimit'
import { postIdParamsSchema } from '../validators/postValidators'
import { schedulePostBodySchema } from '../validators/scheduleValidators'

const router=Router();
router.post('/posts/:postId/schedule',requireApiAuth,writeLimiter,validate({ params: postIdParamsSchema, body: schedulePostBodySchema }),schedulePost);
router.delete('/posts/:postId/schedule',requireApiAuth,validate({ params: postIdParamsSchema }),cancelScheduledPost)
router.get('/scheduled-posts',requireApiAuth,getScheduledPosts)

export default router;
