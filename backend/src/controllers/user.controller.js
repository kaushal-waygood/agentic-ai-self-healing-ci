/** @format */

import { Organization } from '../models/Organization.model.js';
import { User } from '../models/user.model.js';
import { generateReferralCode } from '../utils/generateReferralCode.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const referralCode = generateReferralCode(email);

    let referrer = null;
    if (referredBy) {
      referrer = await User.findOne({ referralCode: referredBy });
      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

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
          apiKey: apiKey,
          status: 'pending_verification',
        });
        await organization.save();
      }
    }

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
    });

    const savedUser = await user.save();

    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 },
      });
    }

    const response = {
      ...savedUser.toObject(),
      organization: accountType === 'institution' ? organization : undefined,
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
