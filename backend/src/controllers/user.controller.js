import { Organization } from '../models/Organization.model.js';
import { User } from '../models/User.model.js';
import { generateReferralCode } from '../utils/generateReferralCode.js';
import crypto from 'crypto';
import admin from '../config/firebase.js';
import { transporter } from '../utils/transporter.js';
import bcrypt from 'bcryptjs';
import redisClient from '../config/redis.js';
import { google } from 'googleapis';
import puppeteer from 'puppeteer';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { Notify } from '../models/notify.js';
import TemplateManager from '../email-templates/lib/templateLoader.js';
import path from 'path';
import { __dirname } from '../utils/fileUploadingManaging.js';
import axios from 'axios';
import qs from 'querystring';
import { addCredits, CREDIT_EARN } from '../utils/credits.js';
import { Feedback } from '../models/feedback.model.js';

import { v4 as uuidv4 } from 'uuid';
import { LoginHistory } from '../models/analyics/loginHistory.model.js';
import {
  prefetchRecommendedJobsForUser,
} from '../utils/prefetchRecommendedJobs.js';

/* -------------------------
   Initialization
   ------------------------- */
const tm = new TemplateManager({
  baseDir: path.join(__dirname, '..', 'email-templates', 'templates'),
});
await tm.init();

/* -------------------------
   Constants & Configuration
   ------------------------- */
const DEFAULT_OTP_EXP_MS = 15 * 60 * 1000; // 15 minutes
const EMAIL_CHANGE_OTP_EXP_MS = 10 * 60 * 1000; // 10 minutes
const DEFAULT_RESET_EXP_MS = 60 * 60 * 1000; // 1 hour

const BACKEND_API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.zobsai.com'
    : process.env.NODE_ENV === 'development'
      ? 'https://api.dev.zobsai.com'
      : 'http://127.0.0.1:8080';

const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://zobsai.com'
    : process.env.NODE_ENV === 'development'
      ? 'https://dev.zobsai.com'
      : 'http://127.0.0.1:3000';

/* -------------------------
   Helper Utilities
   ------------------------- */

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const setAccessTokenCookie = (res, token) => {
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
  return res.cookie('accessToken', token, cookieOptions);
};

const sendTemplatedEmail = async ({
  to,
  templateName,
  templateVars,
  subjectOverride,
}) => {
  const { html, text } = await tm.compileWithTextFallback(
    templateName,
    templateVars,
  );
  await transporter.sendMail({
    from: config.emailUser,
    to,
    subject: subjectOverride || templateVars.subject || 'ZobsAI Notification',
    html,
    text,
  });
};

const sendRawEmail = async ({ to, subject, html }) =>
  transporter.sendMail({
    from: config.emailUser,
    to,
    subject,
    html,
  });

/**
 * Common Logic to handle Referrals for both Google and Local Signups
 */
const processReferral = async (newUserId, referralCode) => {
  if (!referralCode) return;

  try {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return;

    // Prevent self-referral
    if (referrer._id.toString() === newUserId.toString()) return;

    // Update Referrer Stats
    await User.findByIdAndUpdate(referrer._id, {
      $inc: { referralCount: 1 },
      $addToSet: { referredUsers: newUserId },
    });

    // Award Credits to Referrer
    await addCredits(
      referrer._id,
      CREDIT_EARN.SIGNUP_WITH_REFERRAL_REFERRED,
      'Referral Signup Bonus',
    );

    // Link new user to referrer
    await User.findByIdAndUpdate(newUserId, {
      referredBy: referrer._id,
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    // We swallow the error so it doesn't fail the signup process
  }
};

const convertHtmlToPdf = async (html, title = 'document', options = {}) => {
  if (!html) throw new Error('HTML content is required.');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      ...options,
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

/* -------------------------
   Google OAuth Configuration
   ------------------------- */

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BACKEND_API_BASE_URL}/api/v1/user/oauth2callback`,
);

const redirectURI = '/api/v1/user/google/auth/redirect/callback';
const oauth2ClientRedirect = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID_REDIRECT || process.env.GOOGLE_AUTH_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET_REDIRECT ||
    process.env.GOOGLE_AUTH_CLIENT_SECRET,
  `${BACKEND_API_BASE_URL}${redirectURI}`,
);

const handleFirebaseError = (error, res) => {
  console.error('Firebase auth error:', error);

  if (error.code === 'auth/id-token-expired') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please sign in again.',
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Authentication failed',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

const sendEmailViaGmailApi = async ({
  user,
  subject,
  bodyHtml,
  attachments = [],
  to = [],
}) => {
  const userOAuthClient = oauth2Client;
  userOAuthClient.setCredentials({
    refresh_token: user.googleAuth.refreshToken,
  });

  // Refresh token if needed
  if (typeof userOAuthClient.refreshAccessToken === 'function') {
    await userOAuthClient.refreshAccessToken();
  } else {
    await userOAuthClient.getAccessToken();
  }

  const gmail = google.gmail({ version: 'v1', auth: userOAuthClient });

  const mailOptions = {
    from: `"${user.name || user.fullName || 'User'}" <${user.email}>`,
    to,
    subject,
    html: bodyHtml,
    attachments,
  };

  const mail = new MailComposer(mailOptions);
  const rawMessageBuffer = await mail.compile().build();
  const encodedMessage = rawMessageBuffer
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

/* -------------------------
   LinkedIn Helpers
   ------------------------- */
const getAccessToken = async (code) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: `${BACKEND_API_BASE_URL}/api/v1/user/linkedin/callback`,
  });

  const response = await fetch(
    'https://www.linkedin.com/oauth/v2/accessToken',
    {
      method: 'post',
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    },
  );

  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
};

const getUserData = async (accessToken) => {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    method: 'get',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
};

/* -------------------------
   CONTROLLERS
   ------------------------- */

export const firebaseAuth = async (req, res) => {
  // Legacy / Generic Firebase Auth handler
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res
        .status(400)
        .json({ success: false, message: 'ID token is required' });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
    });

    if (user && !user.firebaseUid && user.email === email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message:
          'Email already registered. Please sign in with your existing method.',
      });
    }

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        authMethod: 'google',
        email: email.toLowerCase(),
        fullName: name || 'Anonymous',
        avatar: picture || '',
        isEmailVerified: true,
        role: 'user',
        accountType: 'user',
        referralCode: generateReferralCode(email.toLowerCase()),
        usageLimits: {
          cvCreation: 1,
          coverLetter: 1,
          aiApplication: 1,
          aiAutoApply: 1,
          aiAutoApplyDailyLimit: 5,
          aiMannualApplication: -1,
          atsScore: 1,
          jobMatching: 1,
        },
      });
    } else if (user.firebaseUid && user.firebaseUid !== uid) {
      return res.status(400).json({
        success: false,
        message: 'Account conflict. Please sign in with your original method.',
      });
    }

    const accessToken = user.generateAccessToken();
    // setAccessTokenCookie(res, accessToken);

    return res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    return handleFirebaseError(error, res);
  }
};

export const firebaseGoogleSignup = async (req, res) => {
  try {
    const { idToken, referralCode } = req.body;
    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: 'ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    const emailLower = email.toLowerCase();

    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: emailLower }],
    });

    // 1. User exists without Firebase UID (e.g. Local auth) -> Error
    if (user && !user.firebaseUid && user.email === emailLower) {
      return res.status(400).json({
        success: false,
        message:
          'Email already registered. Please login with password or link accounts.',
      });
    }

    // 2. User exists with Firebase UID -> Already signed up -> Error
    if (user && user.firebaseUid) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists. Please log in.',
      });
    }

    // 3. Create New User
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        authMethod: 'google',
        email: emailLower,
        fullName: name || 'Anonymous',
        avatar: picture || '',
        isEmailVerified: true,
        role: 'user',
        accountType: 'individual',
        referralCode: generateReferralCode(emailLower),
        usageLimits: {
          cvCreation: 1,
          coverLetter: 1,
          aiApplication: 1,
          aiAutoApply: 1,
          aiAutoApplyDailyLimit: 5,
          aiMannualApplication: -1,
          atsScore: 1,
          jobMatching: 1,
        },
      });

      // Handle Referral Logic
      if (referralCode) {
        await processReferral(user._id, referralCode);
      }
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // setAccessTokenCookie(res, accessToken);

    return res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    return handleFirebaseError(error, res);
  }
};

export const firebaseGoogleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: 'ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;
    const emailLower = email.toLowerCase();

    const user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: emailLower }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found. Please sign up first.',
      });
    }

    if (!user.firebaseUid && user.email === emailLower) {
      return res.status(400).json({
        success: false,
        message: 'Email registered with password. Please login normally.',
      });
    }

    if (user.firebaseUid && user.firebaseUid !== uid) {
      return res.status(400).json({
        success: false,
        message: 'Account conflict. Please sign in with original provider.',
      });
    }

    // Success
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // setAccessTokenCookie(res, accessToken);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    return handleFirebaseError(error, res);
  }
};

export const linkedInCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const accessTokenData = await getAccessToken(code);
    const userData = await getUserData(accessTokenData.access_token);

    if (!userData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get user data from LinkedIn',
      });
    }

    const { sub: uid, email, name, picture } = userData;

    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        firebaseUid: uid,
        linkedInUid: uid,
        authMethod: 'linkedin',
        email: email.toLowerCase(),
        fullName: name || 'Anonymous',
        avatar: picture || '',
        isEmailVerified: true,
        role: 'user',
        accountType: 'individual',
        referralCode: generateReferralCode(email.toLowerCase()),
        usageLimits: {
          cvCreation: 1,
          coverLetter: 1,
          aiApplication: 1,
          aiAutoApply: 1,
          aiAutoApplyDailyLimit: 5,
          aiMannualApplication: -1,
          atsScore: 1,
          jobMatching: 1,
        },
        freeCreditsGranted: true,
      });

      await sendTemplatedEmail({
        to: user.email,
        templateName: 'welcome_zobsai',
        templateVars: {
          name: user.fullName,
          dashboardUrl: process.env.DASHBOARD_URL,
        },
      });
    } else if (!user.linkedInUid) {
      user.linkedInUid = uid;
      await user.save();
    }

    const sessionId = uuidv4();
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await LoginHistory.create({
      userId: user._id,
      sessionId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      loginMethod: 'linkedin',
      status: 'SUCCESS',
    });

    const params = new URLSearchParams({
      token: accessToken,
      refreshToken,
      new: isNewUser,
    });
    return res.redirect(
      `${FRONTEND_URL}/auth/google/callback?${params.toString()}`,
    );
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return res.status(500).redirect(`${FRONTEND_URL}/login?error=auth_failed`);
  }
};

export const signUpUser = async (req, res) => {
  const {
    fullName,
    email,
    password,
    confirmPassword,
    jobRole,
    referredBy: providedReferralCode, // Referral Code string from frontend
  } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedEmail = String(email).toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Prepare OTP and Referral
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + DEFAULT_OTP_EXP_MS);
    const userReferralCode = generateReferralCode(normalizedEmail);

    const user = new User({
      accountType: 'user',
      fullName,
      email: normalizedEmail,
      password,
      jobRole,
      role: 'user',
      referralCode: userReferralCode,
      otp,
      otpExpires,
      isEmailVerified: false,
    });

    const savedUser = await user.save();

    // Handle Referral logic centralized
    if (providedReferralCode) {
      await processReferral(savedUser._id, providedReferralCode);
    }

    // Send Verification Email
    await sendTemplatedEmail({
      to: normalizedEmail,
      templateName: 'verify',
      templateVars: {
        name: savedUser.fullName,
        dashboardUrl: process.env.DASHBOARD_URL,
        supportEmail: 'support@zobsai.com',
        brandName: 'ZobsAI',
        companyUrl: 'https://zobsai.com',
        companyAddress: 'ZobsAI Pvt Ltd',
        unsubscribeUrl: 'https://zobsai.com/unsubscribe',
        otp,
      },
      subjectOverride:
        'Welcome to ZobsAI – Your AI Job Application Assistant is Here!',
    });

    return res.status(201).json({
      _id: savedUser._id,
      accountType: savedUser.accountType,
      email: savedUser.email,
      fullName: savedUser.fullName,
      message: 'Verification OTP sent to your email',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      '+otp +otpExpires +isEmailVerified',
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified)
      return res.status(400).json({ message: 'Email already verified' });
    if (Number(user.otp) !== Number(otp))
      return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpires < new Date())
      return res.status(400).json({ message: 'OTP expired' });

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    if (!user.freeCreditsGranted) {
      user.usageLimits = {
        cvCreation: 1,
        coverLetter: 1,
        aiApplication: 1,
        aiAutoApply: 1,
        aiAutoApplyDailyLimit: 5,
        aiMannualApplication: -1,
        atsScore: 1,
        jobMatching: 1,
      };
      user.freeCreditsGranted = true;
    }

    await user.save();

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // setAccessTokenCookie(res, accessToken);

    // Send Welcome Email
    await sendTemplatedEmail({
      to: user.email,
      templateName: 'welcome_zobsai',
      templateVars: {
        name: user.fullName,
        dashboardUrl: process.env.DASHBOARD_URL,
        supportEmail: 'support@zobsai.com',
        brandName: 'ZobsAI',
        companyUrl: 'https://zobsai.com',
        companyAddress: 'ZobsAI Pvt Ltd, City, Country',
        unsubscribeUrl: 'https://zobsai.com/unsubscribe',
      },
      subjectOverride: 'Welcome to ZobsAI – Your AI Job Assistant',
    });

    user.password = undefined;
    return res.status(200).json({
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      message: 'Verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/* -------------------------
   Change Email Flow (Secure)
   ------------------------- */

export const resendVerificationEmail = async (req, res) => {
  // ROUTE: /change-email
  // This initiates an email change by sending an OTP to the NEW email
  const { email: newEmail } = req.body;
  const { _id } = req.user;

  try {
    const user = await User.findById(_id).select('+otp +otpExpires +tempEmail');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!newEmail)
      return res.status(400).json({ message: 'New email is required' });

    // Rate limit / Spam check
    if (
      user.otpExpires > new Date() &&
      user.tempEmail === newEmail.toLowerCase()
    ) {
      return res
        .status(400)
        .json({ message: 'OTP already sent to this email. Please wait.' });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.tempEmail = newEmail.toLowerCase();
    user.otpExpires = new Date(Date.now() + EMAIL_CHANGE_OTP_EXP_MS);
    await user.save();

    await sendTemplatedEmail({
      to: newEmail,
      templateName: 'verify',
      templateVars: {
        name: user.fullName,
        otp,
        // ... standard vars
      },
      subjectOverride: 'Verify your new email address',
    });

    return res
      .status(200)
      .json({ message: 'Verification OTP sent to your new email' });
  } catch (error) {
    console.error('Change email request error:', error);
    return res.status(500).json({
      message: 'Failed to process request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const verifyUpdateEmail = async (req, res) => {
  // ROUTE: /verify-email-otp
  // Verifies the OTP and commits the email change
  const { _id } = req.user;
  const { otp } = req.body;

  try {
    const user = await User.findById(_id).select('+otp +otpExpires +tempEmail');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.tempEmail) {
      return res
        .status(400)
        .json({ message: 'No pending email change request found.' });
    }

    if (user.otpExpires < new Date()) {
      user.tempEmail = undefined;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({
        message: 'OTP expired. Please request a new email change.',
      });
    }

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    // Commit Change
    user.email = user.tempEmail;
    user.tempEmail = undefined;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const accessToken = user.generateAccessToken();
    // setAccessTokenCookie(res, accessToken);

    return res.status(200).json({
      message: 'Email updated successfully',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
      },
    });
  } catch (error) {
    console.error('Email update verification error:', error);
    return res.status(500).json({
      message: 'Verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const resendOtp = async (req, res) => {
  // Used for initial signup verification if user lost OTP
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email }).select(
      '+otp +otpExpires +isEmailVerified',
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified)
      return res
        .status(400)
        .json({ message: 'Email is already verified. No need to resend OTP.' });

    const newOtp = generateOtp();
    user.otp = newOtp;
    user.otpExpires = new Date(Date.now() + DEFAULT_OTP_EXP_MS);
    await user.save();

    await sendTemplatedEmail({
      to: email,
      templateName: 'verify',
      templateVars: {
        name: user.fullName,
        otp: newOtp,
        // ... standard vars
      },
      subjectOverride: 'Your Verification OTP',
    });

    return res
      .status(200)
      .json({ message: 'New verification OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const signInUser = async (req, res) => {
  const { email, password, deviceInfo } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    // 🔴 Log failed attempt (user not found)
    if (!user) {
      await LoginHistory.create({
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        loginMethod: 'local',
        status: 'FAILED',
      });

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // 🔴 Log failed password
    if (!isMatch) {
      await LoginHistory.create({
        userId: user._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        loginMethod: user.authMethod,
        status: 'FAILED',
      });

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in.',
      });
    }

    // ✅ Generate session
    const sessionId = uuidv4();

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const userObject = user.toObject();
    delete userObject.password;

    // ✅ Log successful login
    await LoginHistory.create({
      userId: user._id,
      sessionId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      device: deviceInfo?.device,
      browser: deviceInfo?.browser,
      os: deviceInfo?.os,
      loginMethod: user.authMethod,
      status: 'SUCCESS',
    });

    // Prefetch recommended jobs in background for instant load on jobs-search
    void prefetchRecommendedJobsForUser(user._id);

    return res.status(200).json({
      message: 'Signed in successfully',
      user: userObject,
      accessToken,
      refreshToken,
      sessionId,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({
        message:
          'If an account with that email exists, a password reset link has been sent',
      });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const passwordResetExpires = new Date(Date.now() + DEFAULT_RESET_EXP_MS);

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    const resetUrl = `${
      FRONTEND_URL || 'http://127.0.0.1:3000'
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailHtml = `
      <h2>Password Reset Request</h2>
      <p>Click below to reset password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Link expires in 1 hour.</p>
    `;

    await sendRawEmail({
      to: email,
      subject: 'Password Reset Request',
      html: mailHtml,
    });

    return res.status(200).json({
      message:
        'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res
      .status(500)
      .json({ message: 'Failed to process password reset request' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword, email } = req.body;
  try {
    if (!token || !newPassword || !confirmPassword || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    const user = await User.findOne({ email }).select(
      '+passwordResetToken +passwordResetExpires',
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (hashedToken !== user.passwordResetToken)
      return res.status(400).json({ message: 'Invalid or expired token' });
    if (user.passwordResetExpires < new Date())
      return res.status(400).json({ message: 'Token has expired' });

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await sendRawEmail({
      to: email,
      subject: 'Password Changed Successfully',
      html: '<p>Your password has been successfully updated.</p>',
    });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};

export const refreshTokens = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
    );
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Refresh token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    console.error('Refresh token error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const signout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
    };
    res.clearCookie('accessToken', cookieOptions);
    return res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const cacheKey = `user:profile:${userId}`;

    const userData = await User.findById(userId).populate(
      'organization',
      '-__v -apiKey',
    );
    if (!userData) throw new Error('User not found');
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { _id } = req.user;

  try {
    const user = await User.findById(_id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: 'Invalid credentials' });

    if (currentPassword === newPassword)
      return res.status(400).json({ message: 'New password cannot be same' });
    if (newPassword !== confirmNewPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    user.password = newPassword;
    await user.save();

    await sendTemplatedEmail({
      to: user.email,
      templateName: 'password_updated',
      templateVars: {
        name: user.fullName,
        dateTime: new Date().toISOString(),
        loginUrl: process.env.DASHBOARD_URL,
      },
      subjectOverride: 'Password Updated',
    });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendEmails = async (req, res) => {
  const {
    subject,
    bodyHtml,
    htmlResume: resumeHtml,
    htmlCoverLetter: coverLetterHtml,
  } = req.body;

  if (!req.user)
    return res.status(401).json({ message: 'Unauthorized session.' });

  const receiverEmails = [
    req.user.email,
    'infozobsai@gmail.com',
    'prakhar@zobsai.com',
    'shadab@zobsai.com',
    'rahul@zobsai.com',
  ];

  if (!subject || !bodyHtml) {
    return res.status(400).json({ message: 'Subject and Body required.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.googleAuth?.refreshToken) {
      return res
        .status(400)
        .json({ message: 'Google account not linked or permission missing.' });
    }

    const attachments = [];
    if (resumeHtml) {
      const buffer = await convertHtmlToPdf(resumeHtml);
      attachments.push({
        filename: 'resume.pdf',
        content: buffer,
        contentType: 'application/pdf',
      });
    }
    if (coverLetterHtml) {
      const buffer = await convertHtmlToPdf(coverLetterHtml);
      attachments.push({
        filename: 'cover_letter.pdf',
        content: buffer,
        contentType: 'application/pdf',
      });
    }

    await sendEmailViaGmailApi({
      user,
      subject,
      bodyHtml,
      attachments,
      to: receiverEmails,
    });

    return res.status(200).json({ message: 'Emails sent successfully!' });
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error.response?.data?.error === 'invalid_grant') {
      return res
        .status(401)
        .json({ message: 'Please re-authenticate Google.' });
    }
    return res.status(500).json({ message: 'Error sending email.' });
  }
};

/* -------------------------
   OAuth Flow Endpoints
   ------------------------- */

export const oAuth2Callback = async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code || !userId) {
    return res.redirect(
      `${FRONTEND_URL}/dashboard/settings?error=auth_failed_param`,
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) throw new Error('No email in Google profile.');

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(
        `${FRONTEND_URL}/dashboard/settings?error=user_not_found`,
      );
    }

    user.googleAuth = {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
    };
    await user.save();

    return res.redirect(
      `${FRONTEND_URL}/dashboard/settings?success=google_connected`,
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    return res.redirect(
      `${FRONTEND_URL}/dashboard/settings?error=auth_failed_internal`,
    );
  }
};

export const authGoogle = async (req, res) => {
  const userId = req.params.id;
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.send',
      ],
      state: userId,
      redirect_uri: oauth2Client.redirect_uri,
    });
    return res.redirect(url);
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return res.status(500).json({ message: 'OAuth Error' });
  }
};

export const disconnectGoogle = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const user = await User.findById(req.user._id);
    const refreshToken = user?.googleAuth?.refreshToken;

    if (refreshToken) {
      try {
        await oauth2Client.revokeToken(refreshToken);
      } catch (e) {
        console.warn('Revoke token failed, continuing cleanup:', e.message);
      }
    }

    user.googleAuth = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: 'Google account disconnected successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error disconnecting account.' });
  }
};

export const testSendEmail = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });

  const receiverEmails = [req.user.email];
  const subject = 'Test Email from ZobsAI';
  const bodyHtml = '<h1>Works!</h1><p>Gmail API integration active.</p>';

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.googleAuth?.refreshToken) {
      return res.status(400).json({ message: 'Google account not linked.' });
    }

    await sendEmailViaGmailApi({
      user,
      subject,
      bodyHtml,
      to: receiverEmails,
    });

    return res.status(200).json({ message: 'Test email sent.' });
  } catch (error) {
    console.error('Test email failed:', error);
    return res.status(500).json({ message: 'Error sending test email.' });
  }
};

/* -------------------------
   Redirect / Legacy OAuth
   ------------------------- */
export const redirectToGoogle = async (req, res) => {
  try {
    const url = oauth2ClientRedirect.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });

    return res.redirect(url);
  } catch (error) {
    return res
      .status(500)
      .redirect(`${FRONTEND_URL}/login?error=redirect_fail`);
  }
};

export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  if (!code)
    return res.status(400).redirect(`${FRONTEND_URL}/login?error=missing_code`);

  try {
    const { tokens } = await oauth2ClientRedirect.getToken(code);
    oauth2ClientRedirect.setCredentials(tokens);

    const { data } = await google
      .oauth2('v2')
      .userinfo.get({ auth: oauth2ClientRedirect });

    let user = await User.findOne({ email: data.email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        fullName: data.name,
        email: data.email,
        googleId: data.id,
        avatar: data.picture,
        authMethod: 'google',
        isEmailVerified: true,
        referralCode: generateReferralCode(data.email),
        usageLimits: {
          cvCreation: 1,
          coverLetter: 1,
          aiApplication: 1,
          aiAutoApply: 1,
          aiAutoApplyDailyLimit: 5,
          aiMannualApplication: -1,
          atsScore: 1,
          jobMatching: 1,
        },
        freeCreditsGranted: true,
      });
      await user.save();

      // Welcome Email
      await sendTemplatedEmail({
        to: user.email,
        templateName: 'welcome_zobsai',
        templateVars: {
          name: user.fullName,
          dashboardUrl: process.env.DASHBOARD_URL,
        },
      });
    }

    const sessionId = uuidv4();
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await LoginHistory.create({
      userId: user._id,
      sessionId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      loginMethod: 'google',
      status: 'SUCCESS',
    });

    // Prefetch recommended jobs in background for instant load on jobs-search
    void prefetchRecommendedJobsForUser(user._id);

    const params = new URLSearchParams({
      token: accessToken,
      refreshToken,
      new: isNewUser,
    });
    return res.redirect(
      `${FRONTEND_URL}/auth/google/callback?${params.toString()}`,
    );
  } catch (error) {
    console.error('Google callback error:', error);
    return res.status(500).redirect(`${FRONTEND_URL}/login?error=auth_failed`);
  }
};

export const getMe = async (req, res, next) => {
  const userId = req.user?.id || req.user?._id;
  let token = req.headers.authorization;
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }
  if (!userId) return res.status(401).json({ message: 'Auth error: No ID.' });

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({ user, token });
  } catch (error) {
    return next(error);
  }
};

export const notifyUserForAutopilot = async (req, res, next) => {
  const { email } = req.body;
  const userId = req.user?._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const notify = await Notify.create({
      name: userId,
      email,
      isNotifyMailSend: true,
    });
    return res.status(200).json({ notify, message: 'Notification scheduled' });
  } catch (error) {
    return next(error);
  }
};

export const isEmailSentForNotify = async (req, res, next) => {
  const { email } = req.body;
  try {
    const notify = await Notify.findOne({ email });
    if (!notify || !notify.isNotifyMailSend)
      return res.status(404).json({ message: 'Email not found.' });
    return res.status(200).json({ sent: true, message: 'Email was sent.' });
  } catch (error) {
    return next(error);
  }
};

export const getVerifiedUser = async (req, res) => {
  try {
    const user = await User.find({
      isEmailVerified: true,
      authMethod: 'local',
    }).select('email');
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { category, feedback, path } = req.body;
    const { _id: userId } = req.user;

    const user = await User.findById(userId).select('email').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let attachment = null;

    if (req.file) {
      // Replace this with S3 / Cloudinary later
      attachment = {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: 'TEMP_URL_OR_UPLOAD_RESULT',
      };
    }

    await Feedback.create({
      userId,
      email: user.email,
      category,
      feedback,
      path,
      attachment,
      meta: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted',
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().lean();
    return res.status(200).json(feedbacks);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRatings = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().select('rating');
    return res.status(200).json(feedbacks);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
