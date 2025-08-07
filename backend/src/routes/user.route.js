/** @format */

import { Router } from 'express';
import {
  getUserProfile,
  signInUser,
  signout,
  signUpUser,
  refreshAccessToken,
  changePassword,
  verifyEmail,
  firebaseAuth,
  resendOtp,
  forgotPassword,
  resetPassword,
} from '../controllers/user.controller.js';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';
import { google } from 'googleapis';
import { User } from '../models/User.model.js';
import { sendJobApplicationViaEmail } from '../controllers/student.controller.js';

const router = Router();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  '584491493872-k4r3sueu3m2j7fm5ancngm9i1018qp2j.apps.googleusercontent.com',
  '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',
  'http://localhost:8080/api/v1/user/oauth2callback',
);

// Start the OAuth flow
router.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  res.redirect(url);
});

// Gmail Send Email Helper
const sendTestEmail = async (auth) => {
  const gmail = google.gmail({ version: 'v1', auth });

  const rawMessage = [
    'From: "Me" <me>',
    'To: thesiddiqui7@gmail.com',
    'Subject: Gmail API Test ✅',
    '',
    'Hello, this is a test email sent using the Gmail API via OAuth2.',
  ].join('\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
};

router.post('/send-email', sendJobApplicationViaEmail);

router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  try {
    // 1. Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Get user profile from Google
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    // 3. Check if user exists in your database
    const existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      // User doesn't exist - handle accordingly
      return res.redirect('http://localhost:3000/login?error=user_not_found');
    }

    // 4. Update only the email (and tokens) for existing user
    await User.updateOne(
      { _id: existingUser._id }, // Use the user's ID for precise update
      {
        $set: {
          email: userEmail, // Update email
          tokens: tokens, // Update tokens
        },
      },
    );

    // 5. Redirect to frontend
    res.redirect(`http://localhost:3000/settings?email=${userEmail}`);
  } catch (err) {
    console.error('OAuth error:', err);
    res.redirect('http://localhost:3000/login?error=auth_failed');
  }
});

router.post('/google/auth', firebaseAuth);
router.post('/signup', signUpUser);
router.post('/verify', verifyEmail);
router.post('/signin', signInUser);
router.get('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, getUserProfile);
router.get('/refresh-token', authMiddleware, refreshAccessToken);
router.patch('/me/password/change', authMiddleware, changePassword);
router.post('/resend-otp', authMiddleware, resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
