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
// import { SCOPES, oauth2Client } from '../config/googleConsole.js';

export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
];

// Use environment variables instead of hardcoded values
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/v1/user/oauth2callback`,
);

const originUrl = process.env.FRONTEND_URL;

export const firebaseAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
      });
    }

    // 1. Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 2. Check if user exists (by Firebase UID or email)
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
    });

    // 3. Handle new user or existing user
    if (!user) {
      // New user - create with default values
      user = await User.create({
        firebaseUid: uid,
        authMethod: 'firebase',
        email: email.toLowerCase(),
        fullName: name || 'Anonymous',
        avatar: picture || '',
        isEmailVerified: true,
        role: 'student', // Default role
        accountType: 'individual', // Default account type
      });
    } else if (!user.firebaseUid) {
      user.firebaseUid = uid;
      user.authMethod = 'firebase';
      await user.save();
    }

    const accessToken = user.generateAccessToken();

    const cookieOptions = {
      // httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', accessToken, cookieOptions);

    res.status(200).json({
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

    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please sign in again.',
      });
    }

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
    referredBy,
  } = req.body;

  try {
    if (!accountType || !fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    const referralCode = generateReferralCode(email);
    let referrer = null;
    if (referredBy) {
      referrer = await User.findOne({ referralCode: referredBy });
      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // Handle organization
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

    // Create user (unverified)
    const user = new User({
      accountType,
      fullName,
      email,
      password,
      jobRole,
      role: accountType === 'institution' ? 'OrgAdmin' : 'student',
      organization:
        accountType === 'institution' ? organization._id : undefined,
      referralCode,
      referredBy: referredBy || undefined,
      otp,
      otpExpires,
      isVerified: false,
    });

    const savedUser = await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Welcome to Our Platform, ${fullName}!</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 },
      });
    }

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

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email }).select(
      '+otp +otpExpires +isEmailVerified',
    );

    // Validation checks
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate access token only
    const accessToken = user.generateAccessToken();

    // Set cookies
    const cookieOptions = {
      // httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (change from 30 days)
    };

    // Remove sensitive data before sending user info
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
    // 1. Validate email input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // 2. Find the user by email, including OTP fields
    const user = await User.findOne({ email }).select(
      '+otp +otpExpires +isEmailVerified',
    );

    // 3. Handle user not found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 4. Check if the email is already verified
    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: 'Email is already verified. No need to resend OTP.' });
    }

    // 5. Generate a new OTP and set a new expiry time
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const newOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // 6. Update the user document with the new OTP and expiry
    user.otp = newOtp;
    user.otpExpires = newOtpExpires;
    await user.save();

    // 7. Send the new OTP email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Resend: Verify Your Email Address',
      html: `
        <h2>Hello ${user.fullName || 'User'},</h2>
        <p>You requested to resend your verification code.</p>
        <p>Your new verification code is: <strong>${newOtp}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 8. Respond with success message
    res
      .status(200)
      .json({ message: 'New verification OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const signInUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // 2. Find the user and include the password for comparison
    const user = await User.findOne({ email }).select('+password');

    // 3. Check if user exists and password is correct
    // Note: This assumes you have a method like 'isPasswordCorrect' on your User schema.
    // If not, you would use: const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4. Check if the user's email is verified
    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ message: 'Please verify your email before signing in.' });
    }

    // 5. Generate the access token
    const accessToken = user.generateAccessToken(); // Assumes you have this method on your User model

    // 6. Prepare user object for the response (without sensitive data)
    const userObject = user.toObject();
    delete userObject.password;

    // 7. Define cookie options with production settings
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Apply secure settings ONLY in production
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'Lax'; // 'Lax' is suitable for subdomains
      cookieOptions.domain = 'api.zobsai.com'; // CRITICAL: Sets cookie for all subdomains of zobsai.com
    }

    // 8. Send the response with the cookie
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
    // 1. Validate email input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // 2. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if the email doesn't exist
      return res.status(200).json({
        message:
          'If an account with that email exists, a password reset link has been sent',
      });
    }

    // 3. Generate a password reset token with expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 4. Save the token and expiry to the user document
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    // 5. Create reset URL
    const resetUrl = `${originUrl}/reset-password?token=${resetToken}&email=${email}`;

    // 6. Send email with reset link
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 7. Respond with success message
    res.status(200).json({
      message:
        'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Failed to process password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword, email } = req.body;

  try {
    // 1. Validate inputs
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Verify the reset token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (hashedToken !== user.passwordResetToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // 4. Check if token has expired
    if (user.resetPasswordTokenExpires < new Date()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // 5. Update password and clear reset token fields
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    // 6. Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Changed Successfully',
      html: `
        <h2>Password Update Confirmation</h2>
        <p>Your password has been successfully updated.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 7. Respond with success
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
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

      if (!userData) {
        throw new Error('User not found');
      }

      return userData;
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { _id } = req.user;

  try {
    // *** FIX: Use .select('+password') to retrieve the hashed password ***
    const user = await User.findById(_id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // This check will now work correctly
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as the old password',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- This function is correct, no changes needed ---
const convertHtmlToPdf = async (html, title = 'document', options = {}) => {
  if (!html) {
    throw new Error('HTML content is required.');
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

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
    ...options, // allow overriding via options
  });

  await browser.close();
  return pdfBuffer;
};

export const sendEmails = async (req, res) => {
  const {
    subject,
    bodyHtml,
    htmlResume: resumeHtml,
    htmlCoverLetter: coverLetterHtml,
  } = req.body;

  const userEmail = await User.findById(req.user._id).select('email');

  const receiverEmails = [
    userEmail.email,
    'infozobsai@gmail.com',
    'prakhar@zobsai.com',
    'shadab@zobsai.com',
    'rahul@zobsai.com',
  ];

  // 1. Validation and User Authorization
  if (!req.user) {
    return res
      .status(401)
      .json({ message: 'Unauthorized. No user session found.' });
  }

  // ✨ Updated validation to check for a non-empty array
  if (
    !receiverEmails ||
    !Array.isArray(receiverEmails) ||
    receiverEmails.length === 0 ||
    !subject ||
    !bodyHtml
  ) {
    return res.status(400).json({
      message:
        'Missing required fields: receiverEmails (must be a non-empty array), subject, and bodyHtml.',
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.googleAuth?.refreshToken) {
      return res.status(400).json({
        message: 'Google account not linked or permission not granted.',
      });
    }

    // 2. Set up OAuth2 client for the user
    const userOAuthClient = oauth2Client;
    userOAuthClient.setCredentials({
      refresh_token: user.googleAuth.refreshToken,
    });
    await userOAuthClient.refreshAccessToken(); // Ensures access token is fresh

    const gmail = google.gmail({ version: 'v1', auth: userOAuthClient });

    // 3. Prepare attachments by converting HTML to PDF (no changes here)
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

    // 4. Use Nodemailer's MailComposer to build the MIME message
    const mailOptions = {
      from: `"${user.name || 'User'}" <${user.email}>`,
      to: receiverEmails, // ✨ Pass the array of emails directly here
      subject: subject,
      html: bodyHtml,
      attachments: attachments,
    };

    const mail = new MailComposer(mailOptions);
    const rawMessageBuffer = await mail.compile().build();

    // 5. Encode the message for the Gmail API (no changes here)
    const encodedMessage = rawMessageBuffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // 6. Send the email via Gmail API (no changes here)
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    res
      .status(200)
      .json({ message: 'Email has been sent successfully to all recipients!' });
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error.response?.data?.error === 'invalid_grant') {
      return res
        .status(401)
        .json({ message: 'Authentication failed. Please re-authenticate.' });
    }
    res
      .status(500)
      .json({ message: 'An error occurred while trying to send the email.' });
  }
};

export const oAuth2Callback = async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code) {
    console.error('No authorization code received from Google.');
    return res.redirect(
      `${originUrl}/dashboard/settings?error=auth_failed_no_code`,
    );
  }

  if (!userId) {
    console.error('No state (userId) received from Google.');
    return res.redirect(
      `${originUrl}/dashboard/settings?error=auth_failed_no_state`,
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

    const oauth2 = google.oauth2({
      version: 'v2',
      auth: oauth2Client,
    });
    const { data: userInfo } = await oauth2.userinfo.get();

    const userEmail = userInfo.email;
    if (!userEmail) {
      throw new Error('Could not retrieve email from Google user profile.');
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.redirect(
        `${originUrl}/dashboard/settings?error=user_not_found`,
      );
    }

    if (user.email !== userEmail) {
      console.warn(
        `Mismatched emails. DB: ${user.email}, Google: ${userEmail}. Proceeding with user ID.`,
      );
    }

    user.googleAuth = {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
    };
    await user.save();

    res.redirect(`${originUrl}/dashboard/settings?success=google_connected`);
  } catch (err) {
    console.error(
      'Error during OAuth callback process:',
      err.message,
      err.stack,
    );
    res.redirect(`${originUrl}/dashboard/settings?error=auth_failed_internal`);
  }
};

export const authGoogle = async (req, res) => {
  const userId = req.params.id;

  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      state: userId,
      redirect_uri: oauth2Client.redirect_uri, // Add this line
    });
    console.log('Generated Google auth URL:', url);
    res.redirect(url);
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ message: 'An error occurred during Google OAuth.' });
  }
};

export const disconnectGoogle = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Find the user in your database
    const user = await User.findById(req.user._id);

    // 2. Check if they have a refresh token to revoke
    const refreshToken = user?.googleAuth?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: 'Google account is not connected or already disconnected.',
      });
    }

    // 3. Tell Google to revoke the token
    // We wrap this in a try/catch because it might fail if the user already
    // revoked it from their Google account, but we still want to clean up our DB.
    try {
      await oauth2Client.revokeToken(refreshToken);
    } catch (revokeError) {
      console.warn(
        `Failed to revoke token for ${user.email}, but proceeding with DB cleanup. Error:`,
        revokeError.message,
      );
    }

    // 4. Remove the googleAuth details from the user's record
    user.googleAuth = undefined; // Or user.googleAuth = null;
    await user.save();

    res.status(200).json({
      message: 'Google account has been successfully disconnected.',
    });
  } catch (error) {
    console.error('Error during Google account disconnection:', error);
    res.status(500).json({
      message: 'An error occurred while trying to disconnect the account.',
    });
  }
};

export const testSendEmail = async (req, res) => {
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

  if (!req.user) {
    return res
      .status(401)
      .json({ message: 'Unauthorized. No user session found.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.googleAuth?.refreshToken) {
      return res.status(400).json({
        message: 'Google account not linked or permission not granted.',
      });
    }

    const userOAuthClient = oauth2Client;
    userOAuthClient.setCredentials({
      refresh_token: user.googleAuth.refreshToken,
    });
    await userOAuthClient.refreshAccessToken(); // Ensures access token is fresh

    const gmail = google.gmail({ version: 'v1', auth: userOAuthClient });

    const mailOptions = {
      from: `"${user.name || 'Test User'}" <${user.email}>`,
      to: receiverEmails,
      subject: subject,
      html: bodyHtml,
    };

    const mail = new MailComposer(mailOptions);
    const rawMessageBuffer = await mail.compile().build();

    // 4. Encode the message for the Gmail API
    const encodedMessage = rawMessageBuffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // 5. Send the email via Gmail API
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.status(200).json({ message: 'Test email has been sent successfully!' });
  } catch (error) {
    console.error('Failed to send test email:', error);
    if (error.response?.data?.error === 'invalid_grant') {
      return res
        .status(401)
        .json({ message: 'Authentication failed. Please re-authenticate.' });
    }
    res.status(500).json({
      message: 'An error occurred while trying to send the test email.',
    });
  }
};

export const redirectToGoogle = async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
    res.redirect(url);
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).redirect(`${originUrl}/login?error=google_redirect_failed`);
  }
};

export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res
      .status(400)
      .redirect(`${originUrl}/login?error=missing_auth_code`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Get user profile information from Google
    const { data } = await google.oauth2('v2').userinfo.get({
      auth: oauth2Client,
    });

    // 3. Find or create a user in your database
    let user = await User.findOne({ email: data.email });

    if (!user) {
      user = new User({
        googleId: data.id,
        name: data.name,
        email: data.email,
        profilePicture: data.picture,
      });
      await user.save();
    }

    // 4. Create a JWT for the user session
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // 5. IMPORTANT CHANGE: Redirect to a dedicated frontend callback URL with the token
    res.redirect(`${originUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Error handling Google callback:', error);
    res.status(500).redirect(`${originUrl}/login?error=auth_failed`);
  }
};
