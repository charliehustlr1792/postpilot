import { Router } from "express";
import { createUser,getCurrentUser } from "../controllers/userController";
const router =Router();
router.post('/users', createUser);
router.get('/users/me', getCurrentUser);
export default router