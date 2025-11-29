/** @format */

import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../models/User.model.js';

export const authMiddleware = async (req, res, next) => {
  const accessToken =
    req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'Access Token is missing' });
  }

  try {
    const decoded = jwt.verify(accessToken, config.accessTokenSecret);

    const userId = decoded._id || decoded.id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload.' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware error:', err);
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }
};

/**
 * Generic role guard:
 * requireRole('admin') → exact
 * requireRole('admin', 'super-admin') → any of them
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(
          ' or ',
        )}. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * Some convenience middlewares
 * Usage: router.get('/student-only', authMiddleware, isStudent, handler)
 */

export const isStudent = requireRole('student');

export const isTpo = requireRole('tpo');

export const isHr = requireRole('hr');

export const isUniversityStaff = requireRole('university_staff');

export const isEmployer = requireRole('employer');

// Keep the legacy 'OrgAdmin' string since you put it in enum like that
export const isOrgAdmin = requireRole('OrgAdmin');

export const isAdmin = requireRole('admin');

export const isSuperAdmin = requireRole('super-admin');

// Example: any admin-type role (OrgAdmin, admin, super-admin)
export const isAnyAdmin = requireRole('OrgAdmin', 'admin', 'super-admin');
