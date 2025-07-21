/** @format */

import { Router } from 'express';
import {
  getUserProfile,
  signInUser,
  signout,
  signUpUser,
  refreshAccessToken,
} from '../controllers/user.controller.js';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signup', signUpUser);
router.post('/signin', signInUser);
router.get('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, getUserProfile);
router.get('/refresh-token', authMiddleware, refreshAccessToken);

export default router;
