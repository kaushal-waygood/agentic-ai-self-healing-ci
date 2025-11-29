/** @format */

import { BringZobs } from '../models/BringZobs.model.js';
import { User } from '../models/User.model.js';

const ALLOWED_ROLES = [
  'student',
  'tpo',
  'hr',
  'university_staff',
  'employer',
  'OrgAdmin',
  'admin',
  'super-admin',
];

// STUDENT: TPO submission
export const submitStudentBringRequest = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { university, name, email, phone } = req.body || {};

    if (!university || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'university, name, email and phone are required',
      });
    }

    const doc = await BringZobs.create({
      user: userId,
      type: 'STUDENT',
      university,
      name,
      email,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: 'Student / TPO details submitted successfully',
      data: doc,
    });
  } catch (err) {
    console.error('submitStudentBringRequest error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// COMPANY: company registration + document
export const submitCompanyBringRequest = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { role, company, name, email, phone, university } = req.body || {};

    if (!role || !company || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'role, company, name, email and phone are required',
      });
    }

    // multer saved file under /public/form for field "attachment"
    let documentUrl = null;
    if (req.file) {
      // you can later map this to full URL if you serve /public
      documentUrl = `/form/${req.file.filename}`;
    }

    const doc = await BringZobs.create({
      user: userId,
      type: 'COMPANY',
      role,
      company,
      name,
      email,
      phone,
      university,
      documentUrl,
    });

    return res.status(201).json({
      success: true,
      message: 'Company request submitted successfully',
      data: doc,
    });
  } catch (err) {
    console.error('submitCompanyBringRequest error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getMyBringRequests = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { type } = req.query || {};

    const filter = { user: userId };

    if (type) {
      // accept case-insensitive: student / STUDENT / company / COMPANY
      const normalized = String(type).toUpperCase();
      const allowedTypes = ['STUDENT', 'COMPANY', 'STAFF'];

      if (!allowedTypes.includes(normalized)) {
        return res.status(400).json({
          success: false,
          message: `Invalid type. Allowed: ${allowedTypes.join(', ')}`,
        });
      }

      filter.type = normalized;
    }

    const requests = await BringZobs.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (err) {
    console.error('getMyBringRequests error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Map messy request roles to valid user.role values
const ROLE_MAP = {
  HR: 'hr',
  hr: 'hr',
  TPO: 'tpo',
  tpo: 'tpo',
  EMPLOYER: 'employer',
  employer: 'employer',
  STUDENT: 'student',
  student: 'student',
};

export const updateUserRoleFromBringRequest = async (req, res) => {
  try {
    const { id } = req.params; // bring request id
    const { role: overrideRole, status } = req.body || {};

    const bringReq = await BringZobs.findById(id);
    console.log('bringReq:', bringReq);

    if (!bringReq) {
      return res.status(404).json({
        success: false,
        message: 'Bring request not found',
      });
    }

    if (!bringReq.user) {
      return res.status(400).json({
        success: false,
        message: 'Bring request has no associated user',
      });
    }

    const user = await User.findById(bringReq.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found for this bring request',
      });
    }

    // Determine target role:
    // 1. If admin passes role in body, use that
    // 2. Else infer from bringReq.role
    let targetRole = overrideRole || bringReq.role;

    // Normalize via map
    targetRole = ROLE_MAP[targetRole] || targetRole;

    if (!ALLOWED_ROLES.includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role "${targetRole}". Allowed: ${ALLOWED_ROLES.join(
          ', ',
        )}`,
      });
    }

    console.log('targetRole:', targetRole);

    user.role = targetRole;
    user.accountType = targetRole;
    console.log(user);
    await user.save();

    // Update request status
    if (status) {
      bringReq.status = String(status).toUpperCase();
    } else {
      bringReq.status = 'APPROVED';
    }
    await bringReq.save();

    return res.status(200).json({
      success: true,
      message: 'User role updated from bring request',
      data: {
        bringRequest: bringReq,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('updateUserRoleFromBringRequest error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
