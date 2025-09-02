/** @format */

import { Router } from 'express';
import {
  getUserProfile,
  signInUser,
  signout,
  signUpUser,
  // refreshAccessToken,
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
    access_type: 'offline', // Important for getting a refresh token
    prompt: 'consent', // Ensures the user is prompted for consent every time
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

router.post('/send-email', authMiddleware, async (req, res) => {
  // authMiddleware should attach the authenticated user to req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.googleAuth?.refreshToken) {
      return res.status(400).json({
        message: 'Google account not linked or permission not granted.',
      });
    }

    // 1. Set credentials on the OAuth client using the stored refresh token
    oauth2Client.setCredentials({
      refresh_token: user.googleAuth.refreshToken,
    });

    // 2. The googleapis library will automatically use the refresh token
    // to get a new access token if the old one is expired.
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 3. Construct the email message (RFC 2822 format)
    const rawMessage = [
      `From: "Me" <${user.email}>`, // Use the user's actual email address
      'To: thesiddiqui7@gmail.com', // The recipient
      'Subject: Email Sent On Your Behalf via API ✅',
      '',
      'Hello,',
      '',
      'This email was sent programmatically from your account using the permissions you granted in the application.',
    ].join('\n');

    // Base64-url encode the message
    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

    // 4. Send the email
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.status(200).json({ message: 'Email has been sent successfully!' });
  } catch (error) {
    console.error('Failed to send email:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while trying to send the email.' });
  }
});

router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('http://localhost:3000/settings?error=auth_failed');
  }

  try {
    // 1. Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Get user's email address from Google to identify them
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    const userEmail = userInfo.email;

    if (!userEmail) {
      throw new Error('Could not retrieve email from Google.');
    }

    // 3. Find the user in your database
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      // Important: This flow is for existing users to link their Google account.
      // It's not a sign-up flow.
      return res.redirect(
        'http://localhost:3000/settings?error=user_not_found',
      );
    }

    // 4. Securely save the tokens to the user's record in the database
    // Only store the refresh_token, as it's long-lived.
    user.googleAuth = {
      refreshToken: tokens.refresh_token,
    };
    await user.save();

    // 5. Redirect back to the frontend with a success message
    res.redirect('http://localhost:3000/settings?success=google_connected');
  } catch (err) {
    console.error('Error during OAuth callback:', err);
    res.redirect('http://localhost:3000/settings?error=auth_failed');
  }
});

router.post('/google/auth', firebaseAuth);
router.post('/signup', signUpUser);
router.post('/verify', verifyEmail);
router.post('/signin', signInUser);
router.get('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, getUserProfile);
// router.get('/refresh-token', authMiddleware, refreshAccessToken);
router.patch('/me/password/change', authMiddleware, changePassword);
router.post('/resend-otp', authMiddleware, resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
