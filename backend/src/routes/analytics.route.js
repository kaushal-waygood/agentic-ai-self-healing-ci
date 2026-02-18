import {
  dashboardAnalytics,
  geminiDashboardAnalytics,
  userDashboardAnalytics,
} from '../controllers/analytics.controller.js';
import {
  createLoginHistory,
  getUserLoginHistory,
  logoutUpdate,
  getAllLoginHistory,
} from '../controllers/analytics.controller.js';

import { Router } from 'express';

const router = Router();

router.get('/dashboard', dashboardAnalytics);
router.get('/user-dashboard', userDashboardAnalytics);
router.get('/gemini-dashboard', geminiDashboardAnalytics);

router.post('/', createLoginHistory);
router.get('/user/:userId', getUserLoginHistory);
router.patch('/logout', logoutUpdate);
router.get('/', getAllLoginHistory);

export default router;
