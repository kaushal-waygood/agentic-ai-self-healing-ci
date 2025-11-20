/** @format */

import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../models/User.model.js';

export const authMiddleware = async (req, res, next) => {
  const accessToken =
    req.headers.authorization?.split(' ')[1] || req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'Access Token is missing' });
  }

  try {
    const decoded = jwt.verify(accessToken, config.accessTokenSecret);

    let user;
    if (decoded._id) {
      user = await User.findById(decoded._id).select('-password');
    } else {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }
};

export const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Not a student.' });
  }
  next();
};

export const isOrgAdmin = (req, res, next) => {
  if (req.user.role !== 'OrgAdmin') {
    return res
      .status(403)
      .json({ message: 'Access denied. Not an org admin.' });
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  console.log(req.user.role);
  if (req.user.role !== 'super-admin') {
    return res
      .status(403)
      .json({ message: 'Access denied. Not a super admin.' });
  }
  next();
};
