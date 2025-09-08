/** @format */

import { Router } from 'express';
import {
  getUserProfile,
  signInUser,
  signout,
  signUpUser,
  changePassword,
  verifyEmail,
  firebaseAuth,
  resendOtp,
  forgotPassword,
  resetPassword,
  authGoogle,
  sendEmails,
  oAuth2Callback,
  disconnectGoogle,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Start the OAuth flow
router.get('/auth/google', authMiddleware, authGoogle);
router.post('/send-email', authMiddleware, sendEmails);
router.get('/oauth2callback', oAuth2Callback);
router.post('/google/disconnect', authMiddleware, disconnectGoogle);

// Other routes remain the same
router.post('/google/auth', firebaseAuth);
router.post('/signup', signUpUser);
router.post('/verify', verifyEmail);
router.post('/signin', signInUser);
router.get('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, getUserProfile);
router.patch('/me/password/change', authMiddleware, changePassword);
router.post('/resend-otp', authMiddleware, resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
