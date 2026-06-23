import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { getSocialAccounts,connectAccount,deleteAccount } from "../controllers/socialAccountsController";
import { startOAuth, oauthCallback } from "../controllers/oauthController";
import { validate } from "../middleware/validate";
import { accountIdParamsSchema, connectAccountBodySchema } from "../validators/accountValidators";

const router=Router();
router.get('/accounts', requireAuth(), getSocialAccounts);
router.post('/accounts/connect', requireAuth(), validate({ body: connectAccountBodySchema }), connectAccount);

// OAuth: /auth starts the flow (authenticated); /callback is hit by the platform
// as a top-level redirect, so it relies on the signed state cookie, not Clerk.
router.get('/accounts/:platform/auth', requireAuth(), startOAuth);
router.get('/accounts/:platform/callback', oauthCallback);

router.delete('/accounts/:accountId', requireAuth(), validate({ params: accountIdParamsSchema }), deleteAccount);

export default router;
