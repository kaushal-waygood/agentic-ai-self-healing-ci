import { Router } from 'express';
import {
  initiateOnboarding,
  acceptedBringZobs,
  getBringzobs,
  markFreeJobPosted,
  saveOrganizationDetails,
  uploadVerificationDocs,
} from '../controllers/bringZobs.controller.js';

import {
  authMiddleware,
  isGuestOrg,
  isSuperAdmin,
} from '../middlewares/auth.middleware.js';

import { upload } from '../middlewares/multer.js';

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
router.post(
  '/onboard/initiate',
  authMiddleware,
  isGuestOrg,
  initiateOnboarding,
);

router.put(
  '/onboard/:bringId/details',
  authMiddleware,
  isGuestOrg,
  saveOrganizationDetails,
);
router.post(
  '/onboard/job-callback',
  authMiddleware,
  isGuestOrg,
  markFreeJobPosted,
);
router.post(
  '/onboard/:bringId/verify',
  authMiddleware,
  isGuestOrg,
  upload.single('attachment'),
  uploadVerificationDocs,
);

export default router;
