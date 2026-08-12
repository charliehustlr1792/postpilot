import { Router } from 'express';
import { requireApiAuth } from '../middleware/requireApiAuth';
import { getDashboardOverview } from '../controllers/dashboardController';

const router = Router();
router.get('/dashboard/overview', requireApiAuth, getDashboardOverview);

export default router;
