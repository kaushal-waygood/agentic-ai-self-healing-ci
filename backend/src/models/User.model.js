/** @format */

import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import crypto from 'crypto'; // Added for password reset token
import { v4 as uuidv4 } from 'uuid'; // <-- use this
import { link } from 'fs';

const userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
    },
    linkedInUid: {
      type: String,
    },
    authMethod: {
      type: String,
      enum: ['google', 'local', 'firebase', 'linkedin'],
      default: 'local',
    },
    googleAuth: {
      refreshToken: { type: String },
      accessToken: { type: String },
      expiryDate: { type: Number },
    },
    tokens: {
      access_token: String,
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
      default: 'individual',
    },
    fullName: {
      type: String,
      // required: true,
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
        // This function returns true if the authMethod is 'local'
        return this.authMethod === 'local';
      },
    },
    jobRole: {
      type: String,
    },
    role: {
      type: String,
      enum: ['student', 'OrgAdmin', 'super-admin', 'admin'],
      default: 'student',
    },
    credits: { type: Number, default: 0 },

    referralCode: {
      type: String,
      unique: true,
      default: () => uuidv4().slice(0, 8),
    }, // short code
    referredBy: { type: Schema.Types.ObjectId, ref: 'Student', default: null },

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

    // --- Credit & Referral additions ---
    credits: { type: Number, default: 0 }, // current balance
    referralCode: {
      type: String,
      unique: true,
      default: () => uuidv4().slice(0, 8),
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    referredUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Credit transaction log
    creditTransactions: [
      {
        type: {
          type: String,
          enum: ['EARN', 'SPEND', 'ADJUST'],
          required: true,
        },
        amount: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        kind: { type: String }, // e.g., 'signup_referral', 'cv_generation', 'daily_checkin'
        meta: { type: Schema.Types.Mixed },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
    },

    currentPlan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
    },
    currentPurchase: {
      type: Schema.Types.ObjectId,
      ref: 'Purchase',
    },
    usageLimits: {
      cvCreation: { type: Number, default: 0 },
      coverLetter: { type: Number, default: 0 },
      aiApplication: { type: Number, default: 0 },
      autoApply: { type: Number, default: 0 },
      aiAutoApply: { type: Number, default: 0 },
      aiAutoApplyDailyLimit: { type: Number, default: 0 },
      aiMannualApplication: { type: Number, default: 0 },
    },
    usageCounters: {
      cvCreation: { type: Number, default: 0 },
      coverLetter: { type: Number, default: 0 },
      aiApplication: { type: Number, default: 0 },
      autoApply: { type: Number, default: 0 },
      aiAutoApply: { type: Number, default: 0 },
      aiAutoApplyDailyLimit: { type: Number, default: 0 },
      aiMannualApplication: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
    },
    freeCreditsGranted: {
      type: Boolean,
      default: false,
    },

    dailyStreak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastClaimedAt: { type: Date },

      // recovery mechanics
      freezeTokens: { type: Number, default: 0 }, // "protection" items
      lastRecoveryAt: { type: Date }, // last time a recovery was used
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
  if (
    !this.isModified('password') ||
    !this.password ||
    this.authMethod !== 'local'
  )
    return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
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

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
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
