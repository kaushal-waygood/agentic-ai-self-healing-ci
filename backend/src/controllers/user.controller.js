/** @format */

import { Organization } from '../models/Organization.model.js';
import { User } from '../models/User.model.js';
import { generateReferralCode } from '../utils/generateReferralCode.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import admin from '../config/firebase.js';

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  auth: {
    user: '6ce6c6f68a9242',
    pass: '71ed731eebaf53',
  },
});

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
      // Existing user without firebaseUid - link accounts
      user.firebaseUid = uid;
      user.authMethod = 'firebase';
      await user.save();
    }

    // 4. Generate tokens using your existing methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 5. Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 6. Set secure HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // 7. Send response
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
    // Validation
    if (!accountType || !fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Handle referral
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

    // Update referrer if applicable
    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 },
      });
    }

    // Prepare response (don't send sensitive data)
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

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Remove sensitive data before sending user info
    user.password = undefined;
    user.refreshToken = undefined;

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, cookieOptions)
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

export const signInUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.password = undefined;

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

    res.status(200).json({ accessToken, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Verify returns decoded token directly in modern jwt
    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAccessToken = user.generateAccessToken();

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/', // Explicitly set path
      domain: process.env.COOKIE_DOMAIN || 'localhost', // Set domain
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const signout = async (req, res) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const user = await User.findById(userId).populate(
      'organization',
      '-__v -apiKey',
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { _id } = req.user;

  console.log(req.body);
  console.log(_id);
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as the old password',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    console.log(user.password);

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const emailPermission = async (req, res) => {
  const { _id } = req.user;
  try {
  } catch (error) {}
};
