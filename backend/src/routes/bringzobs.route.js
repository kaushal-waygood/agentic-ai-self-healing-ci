import { Router } from 'express';
import {
  acceptedBringZobs,
  getBringzobs,
  markFreeJobPosted,
  saveOrganizationDetails,
} from '../controllers/bringZobs.controller.js';

import {
  authMiddleware,
  isGuestOrg,
  isSuperAdmin,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/onboard/org-info/:bringId/organization',
  authMiddleware,
  isGuestOrg,
  saveOrganizationDetails,
);

router.post(
  '/onboarding/mark-free-job',
  authMiddleware,
  isGuestOrg,
  markFreeJobPosted,
);
router.post(
  '/accepted/:bringId',
  authMiddleware,
  isSuperAdmin,
  acceptedBringZobs,
);

router.get('/', authMiddleware, isSuperAdmin, getBringzobs);

export default router;
