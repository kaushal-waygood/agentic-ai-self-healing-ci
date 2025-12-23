import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';

const userSchema = new Schema(
  {
    /* ============================
       AUTH PROVIDERS
    ============================ */
    firebaseUid: String,
    linkedInUid: String,

    authMethod: {
      type: String,
      enum: ['google', 'local', 'firebase', 'linkedin'],
      default: 'local',
    },

    googleAuth: {
      refreshToken: { type: String, select: false },
      accessToken: String,
      expiryDate: Number,
    },

    tokens: {
      access_token: String,
      scope: String,
      token_type: String,
      expiry_date: Number,
    },

    /* ============================
       CORE IDENTITY
    ============================ */
    fullName: String,

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function () {
        return this.authMethod === 'local';
      },
      select: false,
    },

    avatar: String,
    jobRole: String,

    role: {
      type: String,
      enum: [
        'super-admin',
        'admin',
        'guest-org',
        'employer-admin',
        'uni-admin',
        'hr',
        'uni-tpo',
        'uni-student',
        'team-member',
        'team-lead',
        'team-management',
        'user',
      ],
      default: 'user',
    },

    accountType: {
      type: String,
      enum: [
        'user',
        'guest-org',
        'employer-admin',
        'student',
        'tpo',
        'hr',
        'university_staff',
        'employer',
        'OrgAdmin',
        'admin',
        'super-admin',
        'individual',
      ],
      default: 'user',
    },

    /* ============================
       EMAIL / OTP SECURITY
    ============================ */
    otp: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
      select: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    /* ============================
       ORGANIZATION
    ============================ */
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },

    /* ============================
       REFERRAL SYSTEM
    ============================ */
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

    referralCount: {
      type: Number,
      default: 0,
    },

    referredUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    /* ============================
       CREDITS & TRANSACTIONS
    ============================ */
    credits: {
      type: Number,
      default: 0,
    },

    creditTransactions: [
      {
        type: {
          type: String,
          enum: ['EARN', 'SPEND', 'ADJUST'],
          required: true,
        },
        amount: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        kind: String,
        meta: Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    freeCreditsGranted: {
      type: Boolean,
      default: false,
    },

    /* ============================
       PLANS & USAGE
    ============================ */
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

    /* ============================
       DAILY STREAK
    ============================ */
    dailyStreak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastClaimedAt: Date,
      freezeTokens: { type: Number, default: 0 },
      lastRecoveryAt: Date,
    },

    /* ============================
       ROLE HISTORY
    ============================ */
    roleHistory: [
      {
        oldRole: String,
        newRole: String,
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        changedAt: { type: Date, default: Date.now },
        organizationContext: {
          type: Schema.Types.ObjectId,
          ref: 'Organization',
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

/* ============================
   HOOKS & METHODS
============================ */

// Password hashing
userSchema.pre('save', async function (next) {
  if (
    !this.isModified('password') ||
    !this.password ||
    this.authMethod !== 'local'
  ) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// JWT
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      accountType: this.accountType,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: config.accessTokenExpiry || '7d',
    },
  );
};

userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const rawToken = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return rawToken;
};

export const User = model('User', userSchema);
