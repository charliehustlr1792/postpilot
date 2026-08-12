import { Router } from "express";
import { requireApiAuth } from "../middleware/requireApiAuth";
import {
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    getPost,
    duplicatePost
} from "../controllers/postController";
import { validate } from "../middleware/validate";
import { writeLimiter } from "../middleware/rateLimit";
import {
    createPostBodySchema,
    duplicatePostBodySchema,
    listPostsQuerySchema,
    postIdParamsSchema,
    updatePostBodySchema,
} from "../validators/postValidators";

const router=Router();
router.get('/posts', requireApiAuth, validate({ query: listPostsQuerySchema }), getAllPosts);
router.post('/posts', requireApiAuth, writeLimiter, validate({ body: createPostBodySchema }), createPost);
router.patch('/posts/:postId', requireApiAuth, validate({ params: postIdParamsSchema, body: updatePostBodySchema }), updatePost);
router.delete('/posts/:postId', requireApiAuth, validate({ params: postIdParamsSchema }), deletePost);
router.get('/posts/:postId', requireApiAuth, validate({ params: postIdParamsSchema }), getPost);
router.post('/posts/:postId/duplicate', requireApiAuth, writeLimiter, validate({ params: postIdParamsSchema, body: duplicatePostBodySchema }), duplicatePost);

export default router;
