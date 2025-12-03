import express from 'express';
import { upload } from '../middlewares/multer.js'; // <-- your existing file
import { authMiddleware, isUser } from '../middlewares/auth.middleware.js'; // or whatever you use
import {
  initiateOnboarding,
  markFreeJobPosted,
  saveOrganizationDetails,
  uploadVerificationDocs,
} from '../controllers/bringZobs.controller.js';

const router = express.Router();

router.post('/onboard/initiate', authMiddleware, isUser, initiateOnboarding);

router.put(
  '/onboard/:bringId/details',
  authMiddleware,
  isUser,
  saveOrganizationDetails,
);
router.post('/onboard/job-callback', authMiddleware, isUser, markFreeJobPosted);
router.post(
  '/onboard/:bringId/verify',
  authMiddleware,
  isUser,
  upload.single('attachment'),
  uploadVerificationDocs,
);

export default router;
