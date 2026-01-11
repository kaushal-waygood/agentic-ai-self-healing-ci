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
  testSendEmail,
  redirectToGoogle,
  handleGoogleCallback,
  getMe,
  notifyUserForAutopilot,
  isEmailSentForNotify,
  verifyUpdateEmail,
  linkedInCallback,
  resendVerificationEmail,
  firebaseGoogleSignup,
  getVerifiedUser,
  firebaseGoogleLogin,
  feedback,
} from '../controllers/user.controller.js';
import {
  authMiddleware,
  isGuestOrg,
  isStudent,
  isSuperAdmin,
  isUserOrUniStudent,
} from '../middlewares/auth.middleware.js';
import {
  acceptedBringZobs,
  getBringzobs,
  initiateOnboarding,
  markFreeJobPosted,
  saveOrganizationDetails,
} from '../controllers/bringZobs.controller.js';
import { upload } from '../middlewares/multer.js';
import { getVerifiedUsers } from '../controllers/student.controller.js';
import { subscribeToNewsletter } from '../controllers/newsletter.controller.js';

const router = Router();

// Start the OAuth flow
router.get('/auth/google/:id', authGoogle);
router.post('/send-test-email', authMiddleware, testSendEmail);
router.get('/oauth2callback', oAuth2Callback);
router.post('/google/disconnect', authMiddleware, disconnectGoogle);

router.get('/linkedin/callback', linkedInCallback);

router.get('/google/auth/redirect', redirectToGoogle);
router.get('/google/auth/redirect/callback', handleGoogleCallback);
router.get('/getme', authMiddleware, getMe);

// Other routes remain the same
router.post('/google/auth', firebaseAuth);

router.post('/google/auth/signup', firebaseGoogleSignup);
router.post('/google/auth/login', firebaseGoogleLogin);

router.post('/signup', signUpUser);
router.post('/verify', verifyEmail);
router.post('/change-email', authMiddleware, resendVerificationEmail);
router.patch('/verify-email-otp', authMiddleware, isStudent, verifyUpdateEmail);
router.post('/signin', signInUser);
router.post('/send-email', authMiddleware, sendEmails);
router.get('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, isUserOrUniStudent, getUserProfile);
router.patch('/me/password/change', authMiddleware, changePassword);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/get-verified-user', getVerifiedUser);

router.post('/notify-autopilot', authMiddleware, notifyUserForAutopilot);
router.post(
  '/notify-autopilot-email',
  authMiddleware,
  isStudent,
  isEmailSentForNotify,
);

router.post(
  '/onboard/initiate',
  authMiddleware,
  isUserOrUniStudent,
  upload.single('attachment'),
  initiateOnboarding,
);

router.post('/newsletter', subscribeToNewsletter);
router.post('/feedback', authMiddleware, feedback);

export default router;
