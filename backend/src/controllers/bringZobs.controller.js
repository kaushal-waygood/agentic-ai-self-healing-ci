import { BringZobs } from '../models/BringZobs.model.js';
import { Organization } from '../models/Organization.model.js';
import { Student } from '../models/student.model.js';
import { User } from '../models/User.model.js';
import { sendEmailWithRetry } from '../utils/transporter.js';
import crypto from 'crypto';

const normalize = (value = '') => String(value).trim();

export const getBringzobs = async (req, res) => {
  try {
    const bringzobs = await BringZobs.find();
    return res.status(200).json({ success: true, data: bringzobs });
  } catch (err) {
    console.error('getBringzobs error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const initiateOnboarding = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { type } = req.body;

    if (!type) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing basic details' });
    }

    const user = await Student.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const { fullName: name, email, phone } = user;

    // 1. Create the record at Step 0
    const doc = await BringZobs.create({
      user: userId,
      type: normalize(type).toUpperCase(),
      name: normalize(name),
      email: normalize(email).toLowerCase(),
      phone: '1234567890',
      onboardingStep: 0,
    });

    // 2. Send "Welcome / Start Onboarding" Email
    const emailSubject = `Welcome to Zobs! Complete your ${type.toLowerCase()} profile`;
    const emailHtml = `<p>Hi ${name},</p><p>Thanks for joining. Please click the link to complete your onboarding.</p> <p><a href="${`http://localhost:3000/dashboard`}/onboarding/${
      doc.name
    }">Complete Onboarding</a></p>`;

    // Non-blocking email send
    sendEmailWithRetry({
      to: doc.email,
      subject: emailSubject,
      html: emailHtml,
    }).catch(console.error);

    return res.status(201).json({
      success: true,
      message: 'Onboarding initiated',
      bringId: doc._id,
      nextStep: 1,
    });
  } catch (err) {
    console.error('initiateOnboarding error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const saveOrganizationDetails = async (req, res) => {
  try {
    const { bringId } = req.params;
    const { companyName, size, industry, website, description } = req.body;

    const doc = await BringZobs.findById(bringId);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Record not found' });

    doc.organizationDetails = {
      name: normalize(companyName),
      size: size,
      industry: industry,
      website: website,
      description: description,
    };

    if (doc.onboardingStep < 1) doc.onboardingStep = 1;

    await doc.save();

    return res.status(200).json({
      success: true,
      message: 'Organization details saved',
      nextStep: 2,
    });
  } catch (err) {
    console.error('saveOrganizationDetails error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const markFreeJobPosted = async (req, res) => {
  try {
    const { bringId, jobId } = req.body; // Passed from frontend after job API success

    console.log('jobId:', jobId);

    const doc = await BringZobs.findById(bringId);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Record not found' });

    doc.freeJobPosted = {
      isPosted: true,
      jobId: jobId,
    };

    // Move to Step 2 Completed (Ready for Step 3)
    if (doc.onboardingStep < 2) doc.onboardingStep = 2;

    await doc.save();

    const emailSubject = `Welcome to Zobs! Complete your  profile`;
    const emailHtml = `<p>Hi ,</p><p>Thanks for joining. Please click the link to complete your onboarding.</p> <p><a href="${`http://localhost:3000/dashboard`}/onboarding/">Complete Onboarding</a></p>`;

    // Non-blocking email send
    sendEmailWithRetry({
      to: doc.email,
      subject: emailSubject,
      html: emailHtml,
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      message: 'Free job recorded',
      nextStep: 3,
    });
  } catch (err) {
    console.error('markFreeJobPosted error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const uploadVerificationDocs = async (req, res) => {
  try {
    const { bringId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Document file is required' });
    }

    const doc = await BringZobs.findById(bringId);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Record not found' });

    const documentUrl = `/form/${req.file.filename}`;

    doc.documentUrl = documentUrl;
    doc.onboardingStep = 3; // Onboarding Flow Complete
    doc.status = 'PENDING'; // Ready for Admin Review

    await doc.save();

    // 3. Send "Verification Received" Email
    const emailSubject = `Verification Documents Received - ${doc.organizationDetails?.name}`;
    const emailHtml = `<p>We have received your documents. Our team will verify them shortly.</p>`;

    sendEmailWithRetry(doc.email, emailSubject, emailHtml).catch(console.error);

    return res.status(200).json({
      success: true,
      message: 'Documents uploaded. Verification pending.',
      data: doc,
    });
  } catch (err) {
    console.error('uploadVerificationDocs error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const acceptedBringZobs = async (req, res) => {
  try {
    const { bringId } = req.params;

    // We just call the helper. It handles finding the doc, creating the org,
    // updating the user, and updating the status to APPROVED.
    const newOrg = await approveBringZobsRequest(bringId);

    return res.status(200).json({
      success: true,
      message: 'Request approved and Organization created successfully',
      organizationId: newOrg._id,
    });
  } catch (err) {
    console.error('acceptedBringZobs error:', err);

    // Handle specific "Request not found" error
    if (err.message === 'Request not found') {
      return res
        .status(404)
        .json({ success: false, message: 'Record not found' });
    }

    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

const approveBringZobsRequest = async (bringZobsId) => {
  const request = await BringZobs.findById(bringZobsId);
  if (!request) throw new Error('Request not found');

  // 2. Create the Organization
  const newOrg = await Organization.create({
    name: request.organizationDetails.name || request.name,
    type: request.type,
    user: request.user,
    profile: {
      industry: request.organizationDetails.industry,
      size: request.organizationDetails.size,
      website: request.organizationDetails.website,
      description: request.organizationDetails.description,
      address: request.organizationDetails.address,
    },
    contactInfo: {
      name: request.name,
      email: request.email,
      phone: request.phone,
    },
    verificationDocuments: request.documentUrl ? [request.documentUrl] : [],
    onboardingRequestId: request._id,
    apiKey: generateApiKey(),
    status: 'active',
  });

  const user = await User.findOneAndUpdate(
    { _id: request.user },
    {
      organization: newOrg._id,
      role:
        request.type === 'UNIVERSITY'
          ? 'uni-admin'
          : request.type === 'COMPANY'
          ? 'employer-admin'
          : 'guest-org',
      accountType:
        request.type === 'UNIVERSITY'
          ? 'uni-admin'
          : request.type === 'COMPANY'
          ? 'employer-admin'
          : 'guest-org',
    },
    { new: true },
  );

  console.log('Updated User:', user);
  request.status = 'APPROVED';
  await request.save();

  return newOrg;
};

const generateApiKey = () => {
  return crypto.randomBytes(20).toString('hex');
};
