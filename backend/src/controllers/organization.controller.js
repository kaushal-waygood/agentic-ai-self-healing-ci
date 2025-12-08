import { OrganizationMember } from '../models/OrganizationMembers.model.js';
import mongoose from 'mongoose';
import { Job } from '../models/jobs.model.js';
import TemplateManager from '../email-templates/lib/templateLoader.js';
import { __dirname } from '../utils/fileUploadingManaging.js';
import path from 'path';
import { transporter } from '../utils/transporter.js';
import { config } from '../config/config.js';
import { User } from '../models/User.model.js';
import crypto from 'crypto';

const tm = new TemplateManager({
  baseDir: path.join(__dirname, '..', 'email-templates', 'templates'),
});
await tm.init();

const sendTemplatedEmail = async ({
  to,
  templateName,
  templateVars,
  subjectOverride,
}) => {
  const { html, text } = await tm.compileWithTextFallback(
    templateName,
    templateVars,
  );
  await transporter.sendMail({
    from: config.emailUser,
    to,
    subject: subjectOverride || templateVars.subject || 'ZobsAI Notification',
    html,
    text,
  });
};

const ROLE_HIERARCHY = {
  'super-admin': 100,
  admin: 90,
  'employer-admin': 80,
  'uni-admin': 80,
  'team-management': 70,
  'team-lead': 60,
  hr: 50,
  'uni-tpo': 50,
  'team-member': 40,
  'guest-org': 30,
  'uni-student': 20,
  user: 10,
};

export const createOrganizationMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { _id: organizationId } = req.user;

    console.log('req.body', req.body, {
      email,
      role,
    });

    // Basic Validation
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      'role accountType fullName email organization',
    );

    if (existingUser) {
      const isAlreadyMember = await OrganizationMember.findOne({
        organizationId,
        email: normalizedEmail,
      });

      if (isAlreadyMember) {
        return res.status(400).json({
          success: false,
          message: 'Member already exists in this organization',
        });
      }

      const currentRoleWeight = ROLE_HIERARCHY[existingUser.role] || 0;
      const newRoleWeight = ROLE_HIERARCHY[role] || 0;

      if (currentRoleWeight > newRoleWeight) {
        return res.status(403).json({
          success: false,
          message: `User already holds a higher role (${existingUser.role}). Cannot assign lower role (${role}).`,
        });
      }
    }

    const member = await OrganizationMember.create({
      organizationId,
      email: normalizedEmail,
      role,
      fullName: existingUser?.fullName || req.body.fullName,
      userId: existingUser?._id || null,
    });

    console.log(member);

    if (!existingUser) {
      try {
        await sendTemplatedEmail({
          to: normalizedEmail,
          templateName: 'member-invitation',
          templateVars: {
            name: req.body.fullName || 'User',
            dashboardUrl: process.env.DASHBOARD_URL,
            supportEmail: 'support@zobsai.com',
            brandName: 'ZobsAI',
            companyUrl: 'https://zobsai.com',
            companyAddress: 'ZobsAI Pvt Ltd, City, Country',
            unsubscribeUrl: 'https://zobsai.com/unsubscribe',
          },
          subjectOverride:
            'Welcome to ZobsAI - Complete your signup to access your workspace',
        });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError.message);
        // Continue execution, do not fail the request
      }
    }

    return res.status(201).json({
      success: true,
      data: member,
      userExists: !!existingUser,
    });
  } catch (error) {
    console.error('createOrganizationMember error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendOrganizationInvite = async (req, res) => {
  try {
    const { email, role, fullName } = req.body;
    const { _id: organizationId } = req.user;

    if (!email || !role) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and role required' });
    }
    const normalizedEmail = String(email).toLowerCase().trim();

    const existingMember = await OrganizationMember.findOne({
      organizationId,
      email: normalizedEmail,
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'User is already an active member.',
        });
      }
      if (existingMember.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Invitation already sent. Please check spam or resend.',
        });
      }
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 Days

    const newMember = await OrganizationMember.create({
      organizationId,
      email: normalizedEmail,
      role,
      fullName: fullName || existingUser?.fullName || 'Invited User',
      userId: existingUser?._id || null,
      status: 'pending', // <--- Important
      invitationToken: inviteToken,
      invitationExpires: inviteExpires,
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';

    const actionUrl = existingUser
      ? `${baseUrl}/accept-invite?token=${inviteToken}`
      : `${baseUrl}/register?token=${inviteToken}&email=${normalizedEmail}`;

    console.log(actionUrl);

    await sendTemplatedEmail({
      to: normalizedEmail,
      templateName: existingUser ? 'org-invite-existing' : 'org-invite-new',
      templateVars: {
        name: newMember.fullName,
        actionUrl: actionUrl,
        brandName: 'ZobsAI',
        invitedBy: req.user.fullName, // Name of the admin who invited them
      },
      subjectOverride: existingUser
        ? 'You have been invited to join an Organization on ZobsAI'
        : 'Invitation to join ZobsAI',
    });

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: { email: newMember.email, status: newMember.status },
    });
  } catch (error) {
    console.error('Invite Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;
    const currentUser = req.user;

    if (!token) {
      console.log('Token is Required');
      return res
        .status(400)
        .json({ success: false, message: 'Token is required' });
    }

    // 1. Find the pending invitation
    const invitation = await OrganizationMember.findOne({
      invitationToken: token,
      status: 'pending',
      invitationExpires: { $gt: Date.now() }, // Ensure not expired
    });

    if (!invitation) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired invitation' });
    }

    if (currentUser.email !== invitation.email) {
      return res.status(403).json({
        success: false,
        message: 'This invitation belongs to a different email address.',
      });
    }

    // 3. Activate the Member
    invitation.status = 'active';
    invitation.invitationToken = undefined; // Clear token so it can't be used again
    invitation.invitationExpires = undefined;
    invitation.userId = currentUser._id; // Link the actual user ID

    await invitation.save();

    return res.status(200).json({
      success: true,
      message: 'You have successfully joined the organization',
      data: invitation,
    });
  } catch (error) {
    console.error('Accept Invite Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrganizationMembers = async (req, res) => {
  const { _id } = req.user;
  try {
    const members = await OrganizationMember.find({
      organizationId: _id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrganizationMember = async (req, res) => {
  const { id } = req.params;
  const { fullName, department, course, role } = req.body;
  try {
    const memberExists = await OrganizationMember.findOne({
      _id: id,
      organizationId: req.user._id,
    });

    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const member = await OrganizationMember.findOneAndUpdate(
      {
        _id: id,
        organizationId: req.user._id,
      },
      { department, course, role, fullName },
      { new: true },
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrganizationMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await OrganizationMember.findOneAndDelete({
      _id: id,
      organizationId: req.user._id,
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const filterOrganizationMembers = async (req, res) => {
  try {
    const { _id: organizationId } = req.user;

    const {
      fullName,
      email,
      department,
      role,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };

    console.log(fullName);
    const membersrought = await OrganizationMember.find({ fullName });
    console.log(membersrought);

    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (fullName) filter.fullName = { $regex: fullName, $options: 'i' };
    if (email) {
      const emailArray = email.split(',').map((email) => email.trim());
      filter.email = { $in: emailArray };
    } else {
      filter.email = { $exists: true };
    }

    const members = await OrganizationMember.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCount = await OrganizationMember.countDocuments(filter);

    res.status(200).json({
      success: true,
      members: members,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter members',
      error: error.message,
    });
  }
};

export const getUniqueDepartments = async (req, res) => {
  try {
    const { _id: organizationId } = req.user;

    const departments = await OrganizationMember.distinct('department', {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });

    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: 'No unique departments found' });
    }

    res.status(200).json({ departments });
  } catch (error) {
    console.error('Error fetching unique departments:', error);
    res.status(500).json({ message: 'Failed to fetch unique departments' });
  }
};

export const getUniqueCourses = async (req, res) => {
  try {
    const { _id: organizationId } = req.user;

    const courses = await OrganizationMember.distinct('course', {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'No unique departments found' });
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error fetching unique departments:', error);
    res.status(500).json({ message: 'Failed to fetch unique departments' });
  }
};

export const getJobsByOrgPosted = async (req, res) => {
  const { _id } = req.user;

  try {
    const jobs = await Job.find({ organizationId: _id });

    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
