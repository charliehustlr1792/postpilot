import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { getSocialAccounts,connectAccount,deleteAccount } from "../controllers/socialAccountsController";
import { validate } from "../middleware/validate";
import { accountIdParamsSchema, connectAccountBodySchema } from "../validators/accountValidators";

const router=Router();
router.get('/accounts', requireAuth(), getSocialAccounts);
router.post('/accounts/connect', requireAuth(), validate({ body: connectAccountBodySchema }), connectAccount);
router.delete('/accounts/:accountId', requireAuth(), validate({ params: accountIdParamsSchema }), deleteAccount);

export default router;
