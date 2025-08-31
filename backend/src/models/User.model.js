/** @format */

import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

const userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
    },
    authMethod: {
      type: String,
      enum: ['firebase', 'local'],
      default: 'local',
    },
    tokens: {
      access_token: String,
      refresh_token: String,
      scope: String,
      token_type: String,
      expiry_date: Number,
    },
    avatar: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ['individual', 'institution'],
      required: function () {
        return this.authMethod === 'local'; // Only required for local auth
      },
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authMethod === 'local'; // Only required for local auth
      },
      select: false, // Exclude by default from queries
    },
    jobRole: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false, // It's good practice to hide this from default queries
    },
    role: {
      type: String,
      enum: ['student', 'OrgAdmin', 'super-admin', 'admin'],
      default: 'student',
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password; // Always remove password when converting to JSON
        return ret;
      },
    },
  },
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.authMethod !== 'local')
    return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', async function (next) {
  // Hash the token only if it has been modified (or is new) and is not null
  if (!this.isModified('refreshToken') || !this.refreshToken) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.refreshToken = await bcrypt.hash(this.refreshToken, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Access token generation
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      accountType: this.accountType,
    },
    config.accessTokenSecret,
    {
      expiresIn: config.accessTokenExpiry || '7d',
    },
  );
};

userSchema.methods.isRefreshTokenCorrect = async function (token) {
  return await bcrypt.compare(token, this.refreshToken);
};

// Refresh token generation
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiry || '30d',
    },
  );
};

// Password reset token generation
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export const User = model('User', userSchema);
