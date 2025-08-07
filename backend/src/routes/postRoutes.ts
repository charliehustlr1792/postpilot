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

const router=Router();
router.get('/posts', requireAuth(), getAllPosts);
router.post('/posts', requireAuth(), createPost);
router.patch('/posts/:postId', requireAuth(), updatePost);
router.delete('/posts/:postId', requireAuth(), deletePost);
router.get('/posts/:postId', requireAuth(), getPost);
router.post('/posts/:postId/duplicate', requireAuth(), duplicatePost);

export default router;