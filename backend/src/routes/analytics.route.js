import {
  dashboardAnalytics,
  geminiDashboardAnalytics,
  userDashboardAnalytics,
} from '../controllers/analytics.controller.js';

import { Router } from 'express';

const router = Router();

router.get('/dashboard', dashboardAnalytics);

router.get('/user-dashboard', userDashboardAnalytics);

router.get('/gemini-dashboard', geminiDashboardAnalytics);

export default router;
