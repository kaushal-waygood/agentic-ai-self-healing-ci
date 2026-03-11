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
import { Organization } from '../models/Organization.model.js';
import { uploadBufferToCloudinary } from '../middlewares/multer.js';
import { AppliedJob } from '../models/AppliedJob.js';

const tm = new TemplateManager({
  baseDir: path.join(__dirname, '..', 'email-templates', 'templates'),
});
await tm.init();

export const updateOrgLogo = async (req, res) => {
  try {
    const organizationId = req.user.organization;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided',
      });
    }

    const logoPath = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'students/logo-org',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      ],
    });

    const profileLogo = logoPath.secure_url;

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: { 'profile.logo': profileLogo } },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logo updated successfully',
      data: organization,
    });
  } catch (error) {
    console.error('updateOrgLogo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateOrganizationProfile = async (req, res) => {
  try {
    const organizationId = req.user.organization;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organization reference',
      });
    }

    const { name, profile, contactInfo, betaFeaturesEnabled } = req.body;

    if (profile?.industry && profile.industry.trim() !== '') {
      const allowedIndustries = [
        'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
        'Retail', 'Hospitality', 'Construction', 'Real Estate', 'Transportation',
        'Energy', 'Media & Entertainment', 'Telecommunications', 'Agriculture',
        'Pharmaceuticals', 'Automotive', 'Aerospace', 'Defense', 'Food & Beverage',
        'Fashion', 'Beauty & Cosmetics', 'Sports', 'Non-profit', 'Government',
        'Consulting', 'Legal', 'Insurance', 'E-commerce', 'Software', 'Hardware',
        'Biotechnology', 'Environmental Services', 'Mining', 'Logistics',
        'Travel & Tourism', 'Research & Development', 'Other'
      ];

      if (!allowedIndustries.includes(profile.industry)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid industry selected',
        });
      }
    }

    // Website validation
    if (profile?.website && profile.website.trim() !== '') {
      const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/\S*)?$/;
      if (!urlPattern.test(profile.website)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid website URL (e.g., https://example.com)',
        });
      }
      // URL starts with http:// or https://
      if (!profile.website.startsWith('http://') && !profile.website.startsWith('https://')) {
        profile.website = 'https://' + profile.website;
      }
    }

    // Company size validation
    if (profile?.size && profile.size.trim() !== '') {
      const allowedSizes = [
        '1-10', '11-50', '51-200', '201-500',
        '501-1000', '1001-5000', '5001-10000', '10000+'
      ];

      if (!allowedSizes.includes(profile.size)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company size selected',
        });
      }
    }

    // Build update object dynamically
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (profile !== undefined) updates.profile = profile;
    if (contactInfo !== undefined) updates.contactInfo = contactInfo;
    if (betaFeaturesEnabled !== undefined)
      updates.betaFeaturesEnabled = betaFeaturesEnabled;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Organization profile updated successfully',
      data: {
        id: organization._id,
        name: organization.name,
        type: organization.type,
        profile: organization.profile,
        contactInfo: organization.contactInfo,
        betaFeaturesEnabled: organization.betaFeaturesEnabled,
        updatedAt: organization.updatedAt,
      },
    });
  } catch (error) {
    console.error('updateOrganizationProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getOrganisationProfile = async (req, res) => {
  try {
    const { organization: organizationId } = req.user;
    const organization = await Organization.findById(organizationId).lean();
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('getOrganisationProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

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

    await sendTemplatedEmail({
      to: normalizedEmail,
      templateName: existingUser ? 'org-invite-existing' : 'org-invite-new',
      templateVars: {
        name: newMember.fullName,
        actionUrl: actionUrl,
        brandName: 'ZobsAI',
        invitedBy: req.user.fullName,
        companyUrl: 'https://zobsai.com',
        companyAddress: 'ZobsAI Pvt Ltd',
        unsubscribeUrl: 'https://zobsai.com/unsubscribe',
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

export const getOrganisationStats = async (req, res) => {
  try {
    const { organization: organizationId } = req.user;

    const orgObjectId = new mongoose.Types.ObjectId(organizationId);

    const stats = await AppliedJob.aggregate([
      { $match: { organization: orgObjectId } },
    ]);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('getOrganisationStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// export const updateCandidateStatus = async (req, res) => {
//   try {
//     const { appliedJobId } = req.params;
//     const { organization: organizationId } = req.user;
//     const { status } = req.body;

//     const appliedJob = await AppliedJob.findOne({
//       _id: appliedJobId,
//     });

//     if (!appliedJob) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Applied job not found' });
//     }

//     appliedJob.status = status;
//     await appliedJob.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Candidate status updated successfully',
//     });
//   } catch (error) {
//     console.error('updateCandidateStatus error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };
export const updateCandidateStatus = async (req, res) => {
  try {
    const { appliedJobId } = req.params;
    const { status } = req.body;

    // Match your schema exactly
    const allowedStatuses = [
      'APPLIED',
      'SELECTED',
      'REJECTED',
      'INTERVIEW',
      'CANCELLED',
      'SHORTLISTED',
    ];

    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status' });
    }

    const appliedJob = await AppliedJob.findByIdAndUpdate(
      appliedJobId,
      { $set: { status } },
      { new: true },
    );

    if (!appliedJob) {
      return res
        .status(404)
        .json({ success: false, message: 'Job application not found' });
    }

    return res.status(200).json({ success: true, data: appliedJob });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
export const updateJobTitle = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { organization: organizationId } = req.user;
    const { jobTitle } = req.body;

    const job = await Job.findOne({ _id: jobId, organization: organizationId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.jobTitle = jobTitle;
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job title updated successfully',
    });
  } catch (error) {
    console.error('updateJobTitle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { organization: organizationId } = req.user;
    const { jobDetails } = req.body;

    const job = await Job.findOne({ _id: jobId, organization: organizationId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.jobDetails = jobDetails;
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job details updated successfully',
    });
  } catch (error) {
    console.error('updateJobDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;
    const currentUser = req.user;

    if (!token) {
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

    const membersrought = await OrganizationMember.find({ fullName });

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
