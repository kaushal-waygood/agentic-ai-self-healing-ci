/** @format */

import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const authMiddleware = (req, res, next) => {
  const accessToken =
    req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  console.log('Access Token:', accessToken);

  if (!accessToken) {
    return res.status(401).json({ message: 'Access Token is missing' });
  }

  jwt.verify(accessToken, config.accessTokenSecret, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: 'Invalid or expired access token' });
    }

    req.user = decoded; // Attach user info to request object

    next();
  });
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
  if (req.user.role !== 'super-admin') {
    return res
      .status(403)
      .json({ message: 'Access denied. Not a super admin.' });
  }
  next();
};
