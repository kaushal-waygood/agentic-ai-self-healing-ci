import {
  reportAutofillIssue,
  requestNewFeature,
} from '../controllers/newFeature.controller.js';
import { Router } from 'express';
import {
  authMiddleware,
  isStudent,
  isUserOrUniStudent,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, isUserOrUniStudent, requestNewFeature);
router.post(
  '/report-autofill-issue',
  authMiddleware,
  isUserOrUniStudent,
  reportAutofillIssue,
);

export default router;
