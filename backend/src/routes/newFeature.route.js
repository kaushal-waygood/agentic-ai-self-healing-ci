import { requestNewFeature } from '../controllers/newFeature.controller.js';
import { Router } from 'express';
import {
  authMiddleware,
  isStudent,
  isUserOrUniStudent,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, isUserOrUniStudent, requestNewFeature);

export default router;
