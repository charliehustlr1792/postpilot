import { Router } from "express";
import { requireAuth } from "@clerk/express";
import {
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    getPost,
    duplicatePost
} from "../controllers/postController";
import { validate } from "../middleware/validate";
import {
    createPostBodySchema,
    duplicatePostBodySchema,
    listPostsQuerySchema,
    postIdParamsSchema,
    updatePostBodySchema,
} from "../validators/postValidators";

const router=Router();
router.get('/posts', requireAuth(), validate({ query: listPostsQuerySchema }), getAllPosts);
router.post('/posts', requireAuth(), validate({ body: createPostBodySchema }), createPost);
router.patch('/posts/:postId', requireAuth(), validate({ params: postIdParamsSchema, body: updatePostBodySchema }), updatePost);
router.delete('/posts/:postId', requireAuth(), validate({ params: postIdParamsSchema }), deletePost);
router.get('/posts/:postId', requireAuth(), validate({ params: postIdParamsSchema }), getPost);
router.post('/posts/:postId/duplicate', requireAuth(), validate({ params: postIdParamsSchema, body: duplicatePostBodySchema }), duplicatePost);

export default router;
