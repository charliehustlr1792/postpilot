import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { getSocialAccounts,connectAccount,deleteAccount } from "../controllers/socialAccountsController";
const router=Router();
router.get('/accounts', requireAuth(), getSocialAccounts);
router.post('/accounts/connect', requireAuth(), connectAccount);
router.delete('/accounts/:accountId', requireAuth(), deleteAccount);

export default router;