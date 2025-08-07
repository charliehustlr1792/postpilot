import { Router } from "express";
import { createUser,getCurrentUser,updateUser,deleteUser,getUserStats } from "../controllers/userController";
import { requireAuth } from "@clerk/express";
const router =Router();
router.post('/users', createUser);
router.get('/users/me',requireAuth(), getCurrentUser);
router.patch('/users/me',requireAuth(),updateUser);
router.delete('/users/me',requireAuth(),deleteUser)
router.get('/users/me/stats',requireAuth(),getUserStats);
export default router