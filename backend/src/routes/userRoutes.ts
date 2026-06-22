import { Router } from "express";
import { getCurrentUser,updateUser,deleteUser,getUserStats } from "../controllers/userController";
import { requireAuth } from "@clerk/express";
import { validate } from "../middleware/validate";
import { updateUserBodySchema } from "../validators/userValidators";
const router =Router();
// User creation is handled by the Clerk webhook (POST /api/webhooks/clerk),
// not by a public endpoint. See webhookController.ts.
router.get('/users/me',requireAuth(), getCurrentUser);
router.patch('/users/me',requireAuth(),validate({ body: updateUserBodySchema }),updateUser);
router.delete('/users/me',requireAuth(),deleteUser)
router.get('/users/me/stats',requireAuth(),getUserStats);
export default router
