import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getOrganizationSummaryAnalytics } from '../controllers/orgAnalytics.controller.js';

const router = Router();

router.get(
  '/organization/jobs',
  authMiddleware,
  getOrganizationSummaryAnalytics,
);

export default router;
