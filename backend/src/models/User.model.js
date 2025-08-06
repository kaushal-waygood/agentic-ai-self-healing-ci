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
    },
    jobRole: {
      type: String,
    },
    role: {
      type: String,
      enum: ['student', 'OrgAdmin', 'super-admin', 'admin'],
      default: 'student',
    },
    referralCode: {
      type: String,
    },
    referredBy: {
      type: String,
    },
    otp: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
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
    referralCode: {
      type: String,
    },
    referredBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') && this.authMethod === 'local') {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

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
      expiresIn: '7d', // Optional default
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      accountType: this.accountType,
    },
    config.refreshTokenSecret,
    {
      expiresIn: '7d',
    },
  );
};

export const User = model('User', userSchema);
