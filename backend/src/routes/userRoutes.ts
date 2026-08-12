import { Router } from "express";
import { getCurrentUser,updateUser,deleteUser,getUserStats } from "../controllers/userController";
import { requireApiAuth } from "../middleware/requireApiAuth";
import { validate } from "../middleware/validate";
import { updateUserBodySchema } from "../validators/userValidators";
const router =Router();
// User creation is handled by the Clerk webhook (POST /api/webhooks/clerk),
// not by a public endpoint. See webhookController.ts.
router.get('/users/me',requireApiAuth, getCurrentUser);
router.patch('/users/me',requireApiAuth,validate({ body: updateUserBodySchema }),updateUser);
router.delete('/users/me',requireApiAuth,deleteUser)
router.get('/users/me/stats',requireApiAuth,getUserStats);
export default router
