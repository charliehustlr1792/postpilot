import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { getDashboardOverview } from '../controllers/dashboardController';

const router = Router();
router.get('/dashboard/overview', requireAuth(), getDashboardOverview);

export default router;
