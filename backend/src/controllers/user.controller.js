import { Organization } from '../models/Organization.model.js';
import { User } from '../models/User.model.js';
import { generateReferralCode } from '../utils/generateReferralCode.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import crypto from 'crypto';
import admin from '../config/firebase.js';
import { transporter } from '../utils/transporter.js';

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
      // httpOnly: true,
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

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Set cookies
    const cookieOptions = {
      // httpOnly: true,
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
        // httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .cookie('refreshToken', refreshToken, {
        // httpOnly: true,
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
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

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
  console.log(req.body);

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

    console.log(user);
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
      // httpOnly: true,
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
