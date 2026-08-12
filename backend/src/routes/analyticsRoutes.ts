import { Router } from "express";
import {
  getPostAnalytics,
  getAnalyticsOverview,
  recordAnalytics,
  getAnalyticsTrends
} from "../controllers/analyticsController";
import { validate } from "../middleware/validate";
import { requireApiAuth } from "../middleware/requireApiAuth";
import {
  analyticsOverviewQuerySchema,
  analyticsTrendsQuerySchema,
  recordAnalyticsBodySchema,
  targetIdParamsSchema,
} from "../validators/analyticsValidators";
import { postIdParamsSchema } from "../validators/postValidators";

const router = Router();

router.get('/analytics/overview', requireApiAuth, validate({ query: analyticsOverviewQuerySchema }), getAnalyticsOverview);
router.get('/analytics/trends', requireApiAuth, validate({ query: analyticsTrendsQuerySchema }), getAnalyticsTrends);
router.get('/posts/:postId/analytics', requireApiAuth, validate({ params: postIdParamsSchema }), getPostAnalytics);
router.post('/targets/:targetId/analytics', requireApiAuth, validate({ params: targetIdParamsSchema, body: recordAnalyticsBodySchema }), recordAnalytics);

export default router;
