import { Router } from 'express';

import {
  getToursForUser,
  updateTourProgress,
  resetTour,
} from '../controllers/tourguide.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/tours', authMiddleware, getToursForUser);
router.post('/tours/:page/progress', authMiddleware, updateTourProgress);
router.post('/tours/:page/reset', authMiddleware, resetTour);

export default router;
