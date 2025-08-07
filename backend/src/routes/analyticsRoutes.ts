import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { 
  getPostAnalytics,
  getAnalyticsOverview,
  recordAnalytics,
  getAnalyticsTrends
} from "../controllers/analyticsController";

const router = Router();

router.get('/analytics/overview', requireAuth(), getAnalyticsOverview);
router.get('/analytics/trends', requireAuth(), getAnalyticsTrends);
router.get('/posts/:postId/analytics', requireAuth(), getPostAnalytics);
router.post('/posts/:postId/analytics', requireAuth(), recordAnalytics);

export default router;