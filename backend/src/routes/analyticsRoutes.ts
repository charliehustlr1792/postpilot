import { Router } from "express";
import { requireAuth } from "@clerk/express";
import {
  getPostAnalytics,
  getAnalyticsOverview,
  recordAnalytics,
  getAnalyticsTrends
} from "../controllers/analyticsController";
import { validate } from "../middleware/validate";
import {
  analyticsOverviewQuerySchema,
  analyticsTrendsQuerySchema,
  recordAnalyticsBodySchema,
  targetIdParamsSchema,
} from "../validators/analyticsValidators";
import { postIdParamsSchema } from "../validators/postValidators";

const router = Router();

router.get('/analytics/overview', requireAuth(), validate({ query: analyticsOverviewQuerySchema }), getAnalyticsOverview);
router.get('/analytics/trends', requireAuth(), validate({ query: analyticsTrendsQuerySchema }), getAnalyticsTrends);
router.get('/posts/:postId/analytics', requireAuth(), validate({ params: postIdParamsSchema }), getPostAnalytics);
router.post('/targets/:targetId/analytics', requireAuth(), validate({ params: targetIdParamsSchema, body: recordAnalyticsBodySchema }), recordAnalytics);

export default router;
