/** @format */

import { Router } from 'express';
import {
  getUserProfile,
  signInUser,
  signout,
  signUpUser,
  refreshAccessToken,
  changePassword,
} from '../controllers/user.controller.js';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';
import { Job } from '../models/jobs.model.js'; // Import Application model
import { User } from '../models/User.model.js'; // Import User model
import { google } from 'googleapis';
import { sendApplicationEmail } from '../utils/sendApplicationEmail.js';
import { authMiddlewares } from '../middlewares/authMiddleware.js';

const router = Router();

// OAuth2 Client for Google API
// const oauth2Client = new google.auth.OAuth2(
//   '584491493872-d7rbt5f23i4va2eu8r2s3m3kjdhiv4as.apps.googleusercontent.com',
//   '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',
//   'http://localhost:3001/api/user/google/callback',
// );

// router.post('/google', authMiddlewares, async (req, res) => {
//   try {
//     const { code } = req.body;

//     // Verify all required parameters exist
//     if (
//       !code ||
//       !process.env.GOOGLE_CLIENT_ID ||
//       !process.env.GOOGLE_CLIENT_SECRET
//     ) {
//       throw new Error('Missing required OAuth parameters');
//     }

//     // Create fresh OAuth2 client for each request
//     const oauth2Client = new google.auth.OAuth2(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URI,
//     );

//     // Get tokens with all parameters explicitly passed
//     const { tokens } = await oauth2Client.getToken({
//       code,
//       redirect_uri: process.env.GOOGLE_REDIRECT_URI,
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//     });

//     // Store tokens and respond
//     await User.findOneAndUpdate(
//       { email: req.user.email },
//       { googleRefreshToken: tokens.refresh_token },
//       { upsert: true },
//     );

//     res.json({
//       message: 'Google authentication successful',
//       accessToken: tokens.access_token,
//     });
//   } catch (error) {
//     console.error('Complete OAuth error:', {
//       timestamp: new Date().toISOString(),
//       error: error.message,
//       request: {
//         code: req.body.code ? 'received' : 'missing',
//         client_id: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
//         client_secret: process.env.GOOGLE_CLIENT_SECRET
//           ? 'configured'
//           : 'missing',
//         redirect_uri: process.env.GOOGLE_REDIRECT_URI,
//       },
//       response: error.response?.data,
//     });
//     res.status(500).json({
//       error: 'Authentication failed',
//       details: error.response?.data || error.message,
//     });
//   }
// });

// // Apply for a job
// router.post('/apply', async (req, res) => {
//   const { recruiterEmail, jobTitle, coverLetter, jobId } = req.body;
//   console.log(req.body);
//   const studentEmail = req.body.email; // Get email from authenticated user

//   try {
//     const application = new Job({
//       studentEmail,
//       recruiterEmail,
//       jobTitle,
//       coverLetter,
//       status: 'pending',
//     });

//     console.log(application);
//     await application.save();

//     // Send email
//     await sendApplicationEmail(studentEmail, recruiterEmail, {
//       jobTitle,
//       coverLetter,
//     });

//     // Update application status
//     application.status = 'sent';
//     await application.save();

//     res.json({ message: 'Application sent successfully' });
//   } catch (error) {
//     console.error('Error sending application:', error);
//     await Application.findOneAndUpdate(
//       { studentEmail, jobTitle, status: 'pending' },
//       { status: 'failed' },
//     );
//     res.status(500).json({ error: 'Failed to send application' });
//   }
// });

// Existing routes
router.post('/signup', signUpUser);
router.post('/signin', signInUser);
router.get('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, getUserProfile);
router.get('/refresh-token', authMiddleware, refreshAccessToken);
router.patch('/me/password/change', authMiddleware, changePassword);

export default router;
