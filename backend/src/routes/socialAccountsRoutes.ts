import { Router } from "express";
import { requireApiAuth } from "../middleware/requireApiAuth";
import { getSocialAccounts,connectAccount,deleteAccount } from "../controllers/socialAccountsController";
import { startOAuth, oauthCallback } from "../controllers/oauthController";
import { validate } from "../middleware/validate";
import { writeLimiter } from "../middleware/rateLimit";
import { accountIdParamsSchema, connectAccountBodySchema } from "../validators/accountValidators";

const router=Router();
router.get('/accounts', requireApiAuth, getSocialAccounts);
router.post('/accounts/connect', requireApiAuth, writeLimiter, validate({ body: connectAccountBodySchema }), connectAccount);

// OAuth: /auth starts the flow (authenticated); /callback is hit by the platform
// as a top-level redirect, so it relies on the signed state cookie, not Clerk.
router.get('/accounts/:platform/auth', requireApiAuth, writeLimiter, startOAuth);
router.get('/accounts/:platform/callback', oauthCallback);

router.delete('/accounts/:accountId', requireApiAuth, validate({ params: accountIdParamsSchema }), deleteAccount);

export default router;
