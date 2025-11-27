// controllers/user.controller.js
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

const tm = new TemplateManager({
  baseDir: path.join(__dirname, '..', 'email-templates', 'templates'),
});
await tm.init();

/* -------------------------
   Helper utilities
   ------------------------- */

const DEFAULT_OTP_EXP_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_RESET_EXP_MS = 60 * 60 * 1000; // 1 hour

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

// Non-template fallback send
const sendRawEmail = async ({ to, subject, html }) =>
  transporter.sendMail({
    from: config.emailUser,
    to,
    subject,
    html,
  });

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const setAccessTokenCookie = (res, token) => {
  const cookieOptions = {
    // httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
  return res.cookie('accessToken', token, cookieOptions);
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

/* OAuth2 client used for user-level Gmail actions */
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

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BACKEND_API_BASE_URL}/api/v1/user/oauth2callback`,
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

/* Helper to send email using Gmail API (user must have refresh token stored) */
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

  // refreshAccessToken is deprecated in newer clients; use getAccessToken / refreshCredentials pattern
  // but to keep compatibility with existing code we call refreshAccessToken if present
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
   Controllers (refactored)
   ------------------------- */

export const firebaseAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res
        .status(400)
        .json({ success: false, message: 'ID token is required' });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Find by firebaseUid OR email
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
    });

    // If an existing user is found by email but does not have firebaseUid,
    // do NOT automatically attach firebaseUid or change authMethod.
    // Instead, return an error telling the client the email is already registered.
    if (user && !user.firebaseUid && user.email === email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message:
          'Email already registered. Please sign in with your existing method or link accounts from your profile settings.',
      });
    }

    // If no user found, create as before
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        authMethod: 'google',
        email: email.toLowerCase(),
        fullName: name || 'Anonymous',
        avatar: picture || '',
        isEmailVerified: true,
        role: 'student',
        accountType: 'individual',
        usageLimits: {
          cvCreation: 1,
          coverLetter: 1,
          aiApplication: 1,
          autoApply: 0,
          aiAutoApply: 0,
          aiAutoApplyDailyLimit: 0,
          aiMannualApplication: -1,
        },
      });
    } else if (user.firebaseUid && user.firebaseUid === uid) {
      // existing, matches firebaseUid — proceed
    } else if (user.firebaseUid && user.firebaseUid !== uid) {
      // user exists and has a different firebaseUid — don't mutate, return error
      return res.status(400).json({
        success: false,
        message:
          'Account exists with this email but linked to a different provider. Please sign in with your original method.',
      });
    }

    const accessToken = user.generateAccessToken();
    setAccessTokenCookie(res, accessToken);

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
  }
};

export const firebaseGoogleSignup = async (req, res) => {
  try {
    const { idToken } = req.body;
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

    // Case 1: user exists WITHOUT firebaseUid but same email
    if (user && !user.firebaseUid && user.email === emailLower) {
      return res.status(400).json({
        success: false,
        message:
          'Email already registered. Please sign in with your existing method or link accounts from your profile settings.',
      });
    }

    // Case 2: user exists WITH firebaseUid matching this uid → already registered
    if (user && user.firebaseUid && user.firebaseUid === uid) {
      return res.status(400).json({
        success: false,
        message:
          'Account already exists with Google. Please log in instead of signing up.',
      });
    }

    // Case 3: user exists WITH firebaseUid but different uid → conflict
    if (user && user.firebaseUid && user.firebaseUid !== uid) {
      return res.status(400).json({
        success: false,
        message:
          'Account exists with this email but linked to a different provider. Please sign in with your original method.',
      });
    }

    // Case 4: no user → create new
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        authMethod: 'google',
        email: emailLower,
        fullName: name || 'Anonymous',
        avatar: picture || '',
        isEmailVerified: true,
        role: 'student',
        accountType: 'individual',
        usageLimits: {
          cvCreation: 1,
          coverLetter: 1,
          aiApplication: 1,
          autoApply: 0,
          aiAutoApply: 0,
          aiAutoApplyDailyLimit: 0,
          aiMannualApplication: -1,
        },
      });
    }

    const accessToken = user.generateAccessToken();
    setAccessTokenCookie(res, accessToken);

    return res.status(201).json({
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

    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: emailLower }],
    });

    // Case 1: no user at all
    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'No account found for this Google account. Please sign up first.',
      });
    }

    // Case 2: user exists WITHOUT firebaseUid but same email
    if (!user.firebaseUid && user.email === emailLower) {
      return res.status(400).json({
        success: false,
        message:
          'Email already registered with a different sign-in method. Please use your original method or link accounts from your profile settings.',
      });
    }

    // Case 3: user has firebaseUid but different uid → conflict
    if (user.firebaseUid && user.firebaseUid !== uid) {
      return res.status(400).json({
        success: false,
        message:
          'Account exists with this email but linked to a different provider. Please sign in with your original method.',
      });
    }

    // Case 4: valid login: firebaseUid matches uid
    if (user.firebaseUid && user.firebaseUid === uid) {
      const accessToken = user.generateAccessToken();
      setAccessTokenCookie(res, accessToken);

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
    }

    // Fallback, should not really hit this if cases above are correct
    return res.status(400).json({
      success: false,
      message: 'Unable to authenticate with Google using this account.',
    });
  } catch (error) {
    return handleFirebaseError(error, res);
  }
};

const getAccessToken = async (code) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: `${BACKEND_API_BASE_URL}/api/v1/user/linkedin/callback`,
  });

  console.log(body);

  const response = await fetch(
    'https://www.linkedin.com/oauth/v2/accessToken',
    {
      method: 'post',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    },
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const accessToken = await response.json();
  return accessToken;
};

const getUserData = async (accessToken) => {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    method: 'get',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const userData = await response.json();
  return userData;
};

export const linkedInCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // get access token
    const accessToken = await getAccessToken(code);

    // get user data using access token
    const userData = await getUserData(accessToken.access_token);

    if (!userData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get user data from LinkedIn',
      });
    }

    // Extract user data from LinkedIn response
    const { sub: uid, email, name, picture } = userData;

    // check if user registered
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user && !user.linkedInUid && user.email === email.toLowerCase()) {
      return res.redirect(
        `${FRONTEND_URL}/login?token=failed&error=account_exists&email=${email}`,
      );
    }

    if (!user) {
      user = await User.create({
        firebaseUid: uid, // Using LinkedIn UID as firebaseUid for consistency
        authMethod: 'linkedin',
        email: email.toLowerCase(),
        fullName: name || 'Anonymous',
        avatar: picture || '',
        isEmailVerified: true,
        role: 'student',
        accountType: 'individual',
        usageLimits: {
          cvCreation: 1,
          coverLetter: 1,
          aiApplication: 1,
          autoApply: 0,
          aiAutoApply: 0,
          aiAutoApplyDailyLimit: 0,
          aiMannualApplication: -1,
        },
      });
    } else if (!user.linkedInUid) {
      user.linkedInUid = uid;
      user.authMethod = 'linkedin';
      await user.save();
    }

    const accessTokens = user.generateAccessToken();

    res.redirect(`${FRONTEND_URL}/auth/google/callback?token=${accessTokens}`);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const signUpUser = async (req, res) => {
  const {
    accountType,
    fullName,
    email,
    password,
    confirmPassword,
    jobRole,
    organizationName,
    referredBy: providedReferralCode, // this is actually referralCode from client
  } = req.body;

  try {
    // Basic validation
    if (!accountType || !fullName || !email || !password) {
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

    // OTP
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + DEFAULT_OTP_EXP_MS);

    // Handle referral: only validate if client actually provided one
    let referrer = null;
    let referredBy = null;

    console.log('providedReferralCode:', providedReferralCode);

    if (providedReferralCode) {
      // Find referrer by their referralCode
      referrer = await User.findOne({ referralCode: providedReferralCode });

      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }

      // store referrer _id on the new user
      referredBy = referrer._id;
    }

    // Organization creation for institutional accounts
    let organization = null;
    if (accountType === 'institution') {
      if (!organizationName) {
        return res.status(400).json({
          message: 'Organization name is required for institutional accounts',
        });
      }

      organization = await Organization.findOne({ name: organizationName });

      if (!organization) {
        const apiKey = `org_${Math.random().toString(36).substring(2, 15)}`;
        organization = new Organization({
          name: organizationName,
          apiKey,
          status: 'pending_verification',
        });
        await organization.save();
      }
    }

    // Generate a referral code FOR THE NEW USER (do not overwrite providedReferralCode)
    const userReferralCode = generateReferralCode(normalizedEmail);

    // Create user
    const user = new User({
      accountType,
      fullName,
      email: normalizedEmail,
      password,
      jobRole,
      role: accountType === 'institution' ? 'OrgAdmin' : 'student',
      organization:
        accountType === 'institution' && organization
          ? organization._id
          : undefined,
      referralCode: userReferralCode, // their own code
      referredBy: referredBy || null, // who referred them
      otp,
      otpExpires,
      isEmailVerified: false,
    });

    const savedUser = await user.save();

    // If there was a valid referrer, update their stats & referredUsers list
    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 },
        $addToSet: { referredUsers: savedUser._id }, // push new user id (no duplicates)
      });
      addCredits(
        referrer._id,
        CREDIT_EARN.SIGNUP_WITH_REFERRAL_REFERRED,
        'Referral signup',
      );
    }

    // Send OTP email
    await sendTemplatedEmail({
      to: normalizedEmail,
      templateName: 'verify',
      templateVars: {
        name: savedUser.fullName,
        dashboardUrl: process.env.DASHBOARD_URL,
        supportEmail: 'support@zobsai.com',
        brandName: 'ZobsAI',
        companyUrl: 'https://zobsai.com',
        companyAddress: 'ZobsAI Pvt Ltd, City, Country',
        unsubscribeUrl: 'https://zobsai.com/unsubscribe',
        otp,
      },
      subjectOverride:
        'Welcome to ZobsAI – Your AI Job Application Assistant is Here!',
    });

    // Response: do not return password or sensitive info
    const response = {
      _id: savedUser._id,
      accountType: savedUser.accountType,
      email: savedUser.email,
      fullName: savedUser.fullName,
      message: 'Verification OTP sent to your email',
    };

    if (accountType === 'institution') {
      response.organization = organization;
    }

    return res.status(201).json(response);
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
    if (user.otp !== otp)
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
        autoApply: 0,
        aiAutoApply: 0,
        aiAutoApplyDailyLimit: 0,
        aiMannualApplication: -1,
      };
      user.usageCounters = {
        cvCreation: 0,
        coverLetter: 0,
        aiApplication: 0,
        autoApply: 0,
        aiAutoApply: 0,
        aiAutoApplyDailyLimit: 0,
        aiMannualApplication: 0,
      };
      currentPlan: '68e8fdbbf242c0ff967f20fe';

      user.freeCreditsGranted = true;
    }

    await user.save();

    const accessToken = user.generateAccessToken();

    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };

    const { html, text } = await tm.compileWithTextFallback('welcome_zobsai', {
      name: user.fullName,
      dashboardUrl: process.env.DASHBOARD_URL,
      supportEmail: 'support@zobsai.com',
      brandName: 'ZobsAI',
      companyUrl: 'https://zobsai.com',
      companyAddress: 'ZobsAI Pvt Ltd, City, Country',
      unsubscribeUrl: 'https://zobsai.com/unsubscribe',
    });

    await transporter.sendMail({
      from: config.emailUser,
      to: user.email,
      subject: 'Welcome to ZobsAI – Your AI Job Assistant',
      html,
      text,
    });

    user.password = undefined;
    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .json({
        message: 'Email verified successfully',
        accessToken,
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

export const resendVerificationEmail = async (req, res) => {
  // Keeps old behavior: expects logged-in user and uses req.user._id
  const { email } = req.body;
  const { _id } = req.user;

  try {
    const user = await User.findById(_id).select('+otp +otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otpExpires > new Date())
      return res.status(400).json({ message: 'OTP already sent' });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + DEFAULT_OTP_EXP_MS);
    await user.save();

    await sendTemplatedEmail({
      to: email,
      templateName: 'verify',
      templateVars: {
        name: user.fullName,
        dashboardUrl: process.env.DASHBOARD_URL,
        supportEmail: 'support@zobsai.com',
        brandName: 'ZobsAI',
        companyUrl: 'https://zobsai.com',
        companyAddress: 'ZobsAI Pvt Ltd, City, Country',
        unsubscribeUrl: 'https://zobsai.com/unsubscribe',
        otp,
      },
      subjectOverride: 'Change your email address',
    });

    return res
      .status(200)
      .json({ message: 'Verification OTP sent to your email' });
  } catch (error) {
    console.error('Resend verification email error:', error);
    return res.status(500).json({
      message: 'Resend verification email failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const verifyUpdateEmail = async (req, res) => {
  const { _id } = req.user;
  const { email, otp } = req.body;

  try {
    // Update email first then validate otp on saved data
    const user = await User.findById(_id).select('+otp +otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // if the flow expects the email to be already set during OTP generation, check email param matches (optional)
    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpires < new Date())
      return res.status(400).json({ message: 'OTP expired' });

    user.email = email;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const accessToken = user.generateAccessToken();
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };

    user.password = undefined;
    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .json({
        message: 'Email verified successfully',
        accessToken,
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

export const resendOtp = async (req, res) => {
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
        dashboardUrl: process.env.DASHBOARD_URL,
        supportEmail: 'support@zobsai.com',
        brandName: 'ZobsAI',
        companyUrl: 'https://zobsai.com',
        companyAddress: 'ZobsAI Pvt Ltd, City, Country',
        unsubscribeUrl: 'https://zobsai.com/unsubscribe',
        otp: newOtp,
      },
      subjectOverride: 'Welcome to ZobsAI – Your Verification Email OTP!',
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
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified)
      return res
        .status(403)
        .json({ message: 'Please verify your email before signing in.' });

    const accessToken = user.generateAccessToken();

    const userObject = user.toObject();
    delete userObject.password;

    const cookieOptions = {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'Lax';
      cookieOptions.domain = 'api.zobsai.com';
    }

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .json({
        message: 'Signed in successfully',
        user: userObject,
        accessToken,
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
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
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
    return res.status(500).json({
      message: 'Failed to process password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
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

    const mailHtml = `
      <h2>Password Update Confirmation</h2>
      <p>Your password has been successfully updated.</p>
      <p>If you didn't make this change, please contact our support team immediately.</p>
    `;

    await sendRawEmail({
      to: email,
      subject: 'Password Changed Successfully',
      html: mailHtml,
    });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
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
    console.error('Sign out error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const cacheKey = `user:profile:${userId}`;

    const user = await redisClient.withCache(cacheKey, 3600, async () => {
      const userData = await User.findById(userId).populate(
        'organization',
        '-__v -apiKey',
      );
      if (!userData) throw new Error('User not found');
      return userData;
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
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
      return res.status(400).json({
        message: 'New password cannot be the same as the old password',
      });
    if (newPassword !== confirmNewPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    user.password = newPassword;
    await user.save();

    // Send notification email using template
    const { html, text } = await tm.compileWithTextFallback(
      'password_updated',
      {
        subject: 'Your ZobsAI Password Has Been Updated',
        name: user.fullName,
        dateTime: new Date().toISOString(),
        ipInfo: req.ip || 'Unknown device',
        loginUrl: process.env.DASHBOARD_URL || 'https://zobsai.com/login',
        companyUrl: 'https://zobsai.com',
      },
    );

    await transporter.sendMail({
      from: config.emailUser,
      to: user.email,
      subject: 'Your ZobsAI Password Has Been Updated',
      html,
      text,
    });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
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
    return res
      .status(401)
      .json({ message: 'Unauthorized. No user session found.' });

  // receiverEmails includes user email and team addresses
  const userEmailObj = await User.findById(req.user._id).select('email');
  const receiverEmails = [
    userEmailObj?.email,
    'infozobsai@gmail.com',
    'prakhar@zobsai.com',
    'shadab@zobsai.com',
    'rahul@zobsai.com',
  ];

  if (
    !Array.isArray(receiverEmails) ||
    receiverEmails.length === 0 ||
    !subject ||
    !bodyHtml
  ) {
    return res.status(400).json({
      message:
        'Missing required fields: receiverEmails, subject, and bodyHtml.',
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.googleAuth?.refreshToken) {
      return res.status(400).json({
        message: 'Google account not linked or permission not granted.',
      });
    }

    // build attachments from HTML
    const attachments = [];
    if (resumeHtml) {
      const resumePdfBuffer = await convertHtmlToPdf(resumeHtml);
      attachments.push({
        filename: 'resume.pdf',
        content: resumePdfBuffer,
        contentType: 'application/pdf',
      });
    }
    if (coverLetterHtml) {
      const coverLetterPdfBuffer = await convertHtmlToPdf(coverLetterHtml);
      attachments.push({
        filename: 'cover_letter.pdf',
        content: coverLetterPdfBuffer,
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

    return res
      .status(200)
      .json({ message: 'Email has been sent successfully to all recipients!' });
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error.response?.data?.error === 'invalid_grant') {
      return res
        .status(401)
        .json({ message: 'Authentication failed. Please re-authenticate.' });
    }
    return res
      .status(500)
      .json({ message: 'An error occurred while trying to send the email.' });
  }
};

export const oAuth2Callback = async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code) {
    console.error('No authorization code received from Google.');
    return res.redirect(
      `${
        FRONTEND_URL || 'http://127.0.0.1:3000'
      }/dashboard/settings?error=auth_failed_no_code`,
    );
  }
  if (!userId) {
    console.error('No state (userId) received from Google.');
    return res.redirect(
      `${
        FRONTEND_URL || 'http://127.0.0.1:3000'
      }/dashboard/settings?error=auth_failed_no_state`,
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('Incomplete tokens received from Google:', tokens);
      throw new Error(
        'Access token or refresh token was not received from Google.',
      );
    }

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const userEmail = userInfo.email;
    if (!userEmail)
      throw new Error('Could not retrieve email from Google user profile.');

    const user = await User.findById(userId);
    if (!user)
      return res.redirect(
        `${
          FRONTEND_URL || 'http://127.0.0.1:3000'
        }/dashboard/settings?error=user_not_found`,
      );

    user.googleAuth = {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
    };
    await user.save();

    return res.redirect(
      `${
        FRONTEND_URL || 'http://127.0.0.1:3000'
      }/dashboard/settings?success=google_connected`,
    );
  } catch (err) {
    console.error(
      'Error during OAuth callback process:',
      err.message,
      err.stack,
    );
    return res.redirect(
      `${
        FRONTEND_URL || 'http://127.0.0.1:3000'
      }/dashboard/settings?error=auth_failed_internal`,
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
    return res
      .status(500)
      .json({ message: 'An error occurred during Google OAuth.' });
  }
};

export const disconnectGoogle = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const user = await User.findById(req.user._id);
    const refreshToken = user?.googleAuth?.refreshToken;
    if (!refreshToken)
      return res.status(400).json({
        message: 'Google account is not connected or already disconnected.',
      });

    try {
      await oauth2Client.revokeToken(refreshToken);
    } catch (revokeError) {
      console.warn(
        `Failed to revoke token for ${user.email}, but proceeding with DB cleanup. Error:`,
        revokeError.message,
      );
    }

    user.googleAuth = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: 'Google account has been successfully disconnected.' });
  } catch (error) {
    console.error('Error during Google account disconnection:', error);
    return res.status(500).json({
      message: 'An error occurred while trying to disconnect the account.',
    });
  }
};

export const testSendEmail = async (req, res) => {
  if (!req.user)
    return res
      .status(401)
      .json({ message: 'Unauthorized. No user session found.' });

  const receiverEmails = [
    req.user.email,
    'infozobsai@gmail.com',
    'prakhar@zobsai.com',
    'shadab@zobsai.com',
    'rahul@zobsai.com',
  ];
  const subject = 'Test Email from the Application';
  const bodyHtml =
    '<h1>Hello!</h1><p>This is a test email to confirm that the Gmail API integration is working correctly. No action is required.</p>';

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.googleAuth?.refreshToken)
      return res.status(400).json({
        message: 'Google account not linked or permission not granted.',
      });

    await sendEmailViaGmailApi({
      user,
      subject,
      bodyHtml,
      attachments: [],
      to: receiverEmails,
    });

    return res
      .status(200)
      .json({ message: 'Test email has been sent successfully!' });
  } catch (error) {
    console.error('Failed to send test email:', error);
    if (error.response?.data?.error === 'invalid_grant')
      return res
        .status(401)
        .json({ message: 'Authentication failed. Please re-authenticate.' });
    return res.status(500).json({
      message: 'An error occurred while trying to send the test email.',
    });
  }
};

/* redirectToGoogle & handleGoogleCallback kept as-is but cleaned */
const redirectURI = '/api/v1/user/google/auth/redirect/callback';
const oauth2ClientRedirect = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID_REDIRECT ||
    '433624775795-fjule3uk4anaebdvvacrgura5j6m5e5n.apps.googleusercontent.com',
  process.env.GOOGLE_CLIENT_SECRET_REDIRECT ||
    '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',
  `${BACKEND_API_BASE_URL}${redirectURI}`,
);

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
    console.error('Error generating Google auth URL:', error);
    return res
      .status(500)
      .redirect(
        `${
          FRONTEND_URL || 'http://127.0.0.1:3000'
        }/login?error=google_redirect_failed`,
      );
  }
};

export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  console.log('calling', code);
  if (!code)
    return res
      .status(400)
      .redirect(
        `${
          FRONTEND_URL || 'http://127.0.0.1:3000'
        }/login?error=missing_auth_code`,
      );

  try {
    const { tokens } = await oauth2ClientRedirect.getToken(code);
    oauth2ClientRedirect.setCredentials(tokens);

    const { data } = await google
      .oauth2('v2')
      .userinfo.get({ auth: oauth2ClientRedirect });

    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = new User({
        fullName: data.name,
        email: data.email,
        googleId: data.id,
        avatar: data.picture,
        authMethod: 'google',
        isEmailVerified: true,
      });
      await user.save();

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
      });

      const token = jwt.sign(
        { id: user._id, email: user.email },
        config.accessTokenSecret,
        { expiresIn: '7d' },
      );

      return res.redirect(
        `${
          FRONTEND_URL || 'http://127.0.0.1:3000'
        }/auth/google/callback?token=${token}&new=true`,
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.accessTokenSecret,
      { expiresIn: '7d' },
    );

    return res.redirect(
      `${
        FRONTEND_URL || 'http://127.0.0.1:3000'
      }/auth/google/callback?token=${token}&new=false`,
    );
  } catch (error) {
    console.error('Error handling Google callback:', error);
    return res
      .status(500)
      .redirect(
        `${FRONTEND_URL || 'http://127.0.0.1:3000'}/login?error=auth_failed`,
      );
  }
};

export const getMe = async (req, res, next) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId)
    return res
      .status(401)
      .json({ message: 'Authentication error: User ID not found.' });

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json(user);
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

    return res
      .status(200)
      .json({ notify, message: 'Email has been sent successfully' });
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
    return res
      .status(200)
      .json({ sent: true, message: 'Email has been sent successfully' });
  } catch (error) {
    return next(error);
  }
};
