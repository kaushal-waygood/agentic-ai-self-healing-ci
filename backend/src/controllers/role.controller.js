import { Role } from '../models/Role.model.js';
import { Organization } from '../models/Organization.model.js';
import mongoose from 'mongoose'; // Add this import
import TemplateManager from '../email-templates/lib/templateLoader.js';
import { __dirname } from '../utils/fileUploadingManaging.js';
import path from 'path';
import fs from 'fs';
import { transporter } from '../utils/transporter.js';
import { config } from '../config/config.js';
import { OrganizationMember } from '../models/OrganizationMembers.model.js';

const isRoleInUse = async (orgId, roleName) => {
  return await Organization.findOne({
    _id: orgId,
    'members.role': roleName,
  });
};

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

const sendRawEmail = async ({ to, subject, html }) =>
  transporter.sendMail({
    from: config.emailUser,
    to,
    subject,
    html,
  });

export const createRole = async (req, res) => {
  const orgId = req.user.organization;

  try {
    const { name, permissions, description } = req.body;

    // 1. Basic Check
    if (!name) {
      return res
        .status(400)
        .json({ message: 'Role name and Organization ID are required' });
    }

    // 2. Validate ObjectId Format (Prevents the CastError)
    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({
        message: `Invalid Org ID format. Received: "${orgId}". Expected a 24-character hex string.`,
      });
    }

    // 3. Check for duplicates
    const existingRole = await Role.findOne({ name, organization: orgId });
    if (existingRole) {
      return res
        .status(400)
        .json({ message: 'Role name already exists in this organization' });
    }

    // 4. Create
    const newRole = await Role.create({
      name,
      permissions: permissions || [],
      description,
      organization: orgId,
      isSystemRole: false,
    });

    res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    console.error('Role Creation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getOrgRoles = async (req, res) => {
  try {
    const { organization } = req.user;
    console.log(organization);
    const roles = await Role.find({ organization }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions, description, name } = req.body;

    const role = await Role.findById(roleId);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (role.isSystemRole) {
      return res
        .status(403)
        .json({ message: 'System-defined roles cannot be modified' });
    }

    if (name) role.name = name;
    if (permissions) role.permissions = permissions;
    if (description) role.description = description;

    await role.save();
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findById(roleId);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (role.isSystemRole) {
      return res
        .status(403)
        .json({ message: 'Cannot delete core system roles' });
    }

    const inUse = await isRoleInUse(role.organization, role.name);
    if (inUse) {
      return res.status(400).json({
        message:
          'Role is currently assigned to members. Reassign them before deleting.',
      });
    }

    await role.deleteOne();
    res
      .status(200)
      .json({ success: true, message: 'Role removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { organization } = req.user;

    const user = await User.findOne({ email });
    if (!user) {
      await sendRawEmail({
        to: email,
        subject: 'Invitation to join organization',
        html: `
          <p>You have been invited to join the organization.</p>
          <p>Click the link below to accept the invitation.</p>
          <a href="${config.frontendUrl}/accept-invite?token=${token}">Accept Invitation</a>
        `,
      });
      return res.status(404).json({ message: 'User not found' });
    }

    const member = await OrganizationMember.findOne({
      organization,
      user: user._id,
    });
    if (member) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    const newMember = await OrganizationMember.create({
      organization,
      user: user._id,
      role,
    });

    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
