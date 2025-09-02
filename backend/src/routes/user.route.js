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
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { google } from 'googleapis';
import { User } from '../models/User.model.js';

const router = Router();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID ||
    '584491493872-k4r3sueu3m2j7fm5ancngm9i1018qp2j.apps.googleusercontent.com',
  process.env.GOOGLE_CLIENT_SECRET || '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',
  process.env.GOOGLE_REDIRECT_URI ||
    'http://localhost:8080/api/v1/user/oauth2callback',
);

// Start the OAuth flow
router.get('/auth/google', authMiddleware, (req, res) => {
  // <-- Add authMiddleware
  // Get user ID from the authenticated request
  const userId = req.user._id.toString();

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: userId,
  });
  console.log('Redirecting to Google OAuth:', url);
  res.redirect(url);
});

router.post('/send-email', authMiddleware, async (req, res) => {
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

    // Create a new OAuth2 client instance for this request
    const userOAuthClient = new google.auth.OAuth2(
      oauth2Client._clientId,
      oauth2Client._clientSecret,
      oauth2Client.redirectUri,
    );

    // Set credentials using the stored refresh token
    userOAuthClient.setCredentials({
      refresh_token: user.googleAuth.refreshToken,
    });

    // Get a new access token
    const { credentials } = await userOAuthClient.refreshAccessToken();
    userOAuthClient.setCredentials(credentials);

    const gmail = google.gmail({ version: 'v1', auth: userOAuthClient });

    const rawMessage = [
      `From: "Me" <${user.email}>`,
      'To: thesiddiqui7@gmail.com',
      'Subject: Email Sent On Your Behalf via API ✅',
      '',
      'Hello,',
      '',
      'This email was sent programmatically from your account using the permissions you granted in the application.',
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

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
  console.log('OAuth callback received with code:', code ? 'Yes' : 'No');

  if (!code) {
    console.error('No authorization code received');
    return res.redirect('http://localhost:3000/settings?error=auth_failed');
  }

  try {
    // Exchange the authorization code for tokens
    console.log('Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', tokens ? 'Yes' : 'No');

    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    // Set the credentials on the main client
    oauth2Client.setCredentials(tokens);

    // Get user info using the access token
    console.log('Fetching user info from Google...');
    const oauth2 = google.oauth2({
      version: 'v2',
      auth: oauth2Client, // Use the client with set credentials
    });

    const { data: userInfo } = await oauth2.userinfo.get();
    console.log('User info received:', userInfo);

    const userEmail = userInfo.email;

    if (!userEmail) {
      throw new Error('Could not retrieve email from Google.');
    }

    // Find the user in your database
    console.log('Looking for user with email:', userEmail);
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.error('User not found in database with email:', userEmail);
      return res.redirect(
        'http://localhost:3000/settings?error=user_not_found',
      );
    }

    // Save the refresh token
    console.log('Saving refresh token for user:', userEmail);
    user.googleAuth = {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
    };
    await user.save();

    console.log('OAuth flow completed successfully for user:', userEmail);
    res.redirect('http://localhost:3000/settings?success=google_connected');
  } catch (err) {
    console.error('Error during OAuth callback:', err.message, err.stack);
    res.redirect('http://localhost:3000/settings?error=auth_failed');
  }
});

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
