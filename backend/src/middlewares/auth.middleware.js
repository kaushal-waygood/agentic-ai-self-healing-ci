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
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const userId = decoded._id || decoded.id;

    if (!userId) {
      return res.status(402).json({ message: 'Invalid token payload.' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(402).json({ message: 'User not found.' });
    }

    // Attach user document to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware error:', err);
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }
};

export const requireAnyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User role not found.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${allowedRoles.join(
          ' or ',
        )}. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};

export const isHr = requireAnyRole('hr');
export const isStudent = requireAnyRole('user');
export const isSuperAdmin = requireAnyRole('super-admin');
export const isAdmin = requireAnyRole('admin');
export const isGuestOrg = requireAnyRole('guest-org');

export const isGeneralUser = requireAnyRole('user', 'student', 'uni-student');
export const isEmployerStaff = requireAnyRole(
  'employer-admin',
  'hr',
  'team-lead',
  'team-management',
  'team-member',
);

export const isUniversityStaff = requireAnyRole('uni-admin', 'uni-tpo');

export const isUserOrUniStudent = requireAnyRole(
  'user',
  'uni-student',
  'student',
);

export const isAnyAdmin = requireAnyRole(
  'super-admin',
  'admin',
  'uni-admin',
  'employer-admin',
  'guest-org',
);
