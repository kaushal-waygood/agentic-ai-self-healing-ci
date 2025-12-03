import { OrganizationMember } from '../models/OrganizationMembers.model.js';
import mongoose from 'mongoose';
import { Job } from '../models/jobs.model.js';
import TemplateManager from '../email-templates/lib/templateLoader.js';
import { __dirname } from '../utils/fileUploadingManaging.js';
import path from 'path';
import { transporter } from '../utils/transporter.js';
import { config } from '../config/config.js';
import { User } from '../models/User.model.js';

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

export const createOrganizationMember = async (req, res) => {
  try {
    const { fullName, email, role } = req.body;
    const { _id: organizationId } = req.user; // adjust if you store orgId somewhere else

    if (!fullName || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email and role are required',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Check if member already exists in THIS organization
    const existingMember = await OrganizationMember.findOne({
      email: normalizedEmail,
      organizationId,
    });

    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: 'Role is required' });
    }

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Member already exists in this organization',
      });
    }

    // Check if a user with this email already exists in Users collection
    const existingUser = await User.findOne({ email: normalizedEmail });

    // Create organization member record (can link to existing user if found)
    const member = await OrganizationMember.create({
      organizationId,
      fullName,
      email: normalizedEmail,
      role,
      userId: existingUser?._id || null, // if your schema supports this
    });

    // Only send signup invite if user DOES NOT exist yet
    if (!existingUser) {
      await sendTemplatedEmail({
        to: normalizedEmail,
        templateName: 'member-invitation', // this template should explain signup + org access
        templateVars: {
          name: fullName,
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
    } else {
      // Optional: send a different "you were added to org" email instead of signup
      // or skip email entirely. Your call.
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

// Update organization member
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

// Delete organization member
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

    console.log('Unique departments:', departments);
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
