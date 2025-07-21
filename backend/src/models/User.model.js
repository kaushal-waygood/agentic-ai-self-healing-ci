/** @format */

import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

const userSchema = new Schema(
  {
    accountType: {
      type: String,
      enum: ['individual', 'institution'],
      required: true,
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
      required: true,
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

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

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
      expiresIn: config.accessTokenExpiry || '7d', // Optional default
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
      expiresIn: config.refreshTokenExpiry || '7d',
    },
  );
};

export const User = model('User', userSchema);
