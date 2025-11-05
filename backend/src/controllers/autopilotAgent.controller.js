import { Student } from '../models/student.model.js';
import mongoose from 'mongoose';
import { extractDataFromCV } from '../utils/extractedCv.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';

// ----------------- helpers -----------------
const toBool = (v) => {
  if (typeof v === 'boolean') return v;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
};

const EMPLOYMENT_TYPE_MAP = new Map([
  ['full-time', 'FULL_TIME'],
  ['full_time', 'FULL_TIME'],
  ['full time', 'FULL_TIME'],
  ['["full-time"]', 'FULL_TIME'],
  ['part-time', 'PART_TIME'],
  ['part time', 'PART_TIME'],
  ['contract', 'CONTRACT'],
  ['internship', 'INTERNSHIP'],
  ['temporary', 'TEMPORARY'],
]);
const normalizeEmploymentType = (v) => {
  if (!v) return undefined;
  const k = String(v).trim().toLowerCase();
  return EMPLOYMENT_TYPE_MAP.get(k) || String(v).trim().toUpperCase();
};

const COUNTRY_ALIAS = new Map([
  ['usa', 'US'],
  ['united states', 'US'],
  ['u.s.', 'US'],
  ['u.s.a', 'US'],
]);
const normalizeCountry = (v) => {
  if (!v) return undefined;
  const k = String(v).trim().toLowerCase();
  return COUNTRY_ALIAS.get(k) || String(v).trim();
};

const ensureStringId = () => uuidv4();

// ----------------- controllers -----------------

export const createAutopilotAgent = async (req, res) => {
  try {
    const { _id: studentId } = req.user;

    // validate student id
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid student ID' });
    }

    // required fields present?
    const requiredFields = [
      'agentName',
      'jobTitle',
      'country',
      'employmentType',
    ];
    const missing = requiredFields.filter((f) => !req.body[f]);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missing,
      });
    }

    // student exists?
    const exists = await Student.exists({ _id: studentId });
    if (!exists) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found' });
    }

    // read & sanitize inputs
    const agentName = String(req.body.agentName).trim();
    const jobTitle = String(req.body.jobTitle).trim();
    const employmentType = normalizeEmploymentType(req.body.employmentType);
    const isRemote = toBool(req.body.isRemote);
    const isOnsite = toBool(req.body.isOnsite);
    const cvOption =
      req.body.cvOption === 'uploaded_pdf' ? 'uploaded_pdf' : 'current_profile';
    const jobDescription = (req.body.jobDescription || '').toString();
    const autopilotLimit = Math.min(Number(req.body.autopilotLimit || 5), 20);
    const countryRaw = String(req.body.country || '').trim();
    const country = normalizeCountry(countryRaw);

    // if cvOption requires file, enforce it
    if (cvOption === 'uploaded_pdf' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required for uploaded_pdf option',
      });
    }

    // employmentType sanity
    if (!employmentType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employmentType',
        valid: [
          'FULL_TIME',
          'PART_TIME',
          'CONTRACT',
          'INTERNSHIP',
          'TEMPORARY',
        ],
      });
    }

    // country can be optional if remote; otherwise enforce
    if (!country && !isRemote) {
      return res.status(400).json({
        success: false,
        message: 'Country is required unless isRemote is true',
      });
    }

    const agentId = `agent_${uuidv4()}`;
    const newAgent = {
      agentId,
      agentName,
      jobTitle,
      country,
      isRemote,
      isOnsite,
      employmentType,
      cvOption,
      autopilotEnabled: true,
      autopilotLimit,
      jobDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // process CV if present
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext !== '.pdf') {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Only PDF files are allowed for CV upload',
        });
      }
      if (req.file.size > 5 * 1024 * 1024) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'CV file size must be less than 5MB',
        });
      }

      try {
        const extractedData = await extractDataFromCV(req.file.path);

        newAgent.uploadedCVData = {
          skills: (extractedData.skills || []).map((skill) => ({
            ...skill,
            skillId: ensureStringId(),
          })),
          experience: (extractedData.experience || []).map((exp) => ({
            ...exp,
            experienceId: ensureStringId(),
          })),
          education: (extractedData.education || []).map((edu) => ({
            ...edu,
            educationId: ensureStringId(),
          })),
          projects: (extractedData.projects || []).map((proj) => ({
            ...proj,
            projectId: ensureStringId(),
          })),
          jobRole: extractedData.jobRole || '',
        };
      } catch (err) {
        if (req.file?.path && fs.existsSync(req.file.path))
          fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'CV extraction failed',
          error: err.message,
        });
      } finally {
        if (req.file?.path && fs.existsSync(req.file.path))
          fs.unlinkSync(req.file.path);
      }
    }

    // create agent on student
    const updated = await Student.findByIdAndUpdate(
      studentId,
      { $push: { autopilotAgent: newAgent } },
      { new: true, runValidators: true },
    ).select('autopilotAgent');

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'Student not found after update' });
    }

    const createdAgent = updated.autopilotAgent.find(
      (a) => a.agentId === agentId,
    );

    return res.status(201).json({
      success: true,
      message: 'Autopilot agent created successfully',
      agent: createdAgent,
    });
  } catch (error) {
    // cleanup file if still present
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Agent creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: config.nodeEnv === 'local' ? error.message : undefined,
    });
  }
};

export const getAllPilotAgents = async (req, res) => {
  if (!req.user?._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student identification',
      errorCode: 'INVALID_STUDENT_ID',
    });
  }

  const studentId = req.user._id;

  try {
    const student = await Student.findById(studentId)
      .select('autopilotAgent')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        errorCode: 'STUDENT_NOT_FOUND',
      });
    }

    // filter by autopilotEnabled, not isActive
    const activeAgents = (student.autopilotAgent || []).filter(
      (a) => a.autopilotEnabled !== false,
    );

    return res.status(200).json({
      success: true,
      count: activeAgents.length,
      data: { autoPilot: activeAgents },
      meta: {
        timestamp: new Date().toISOString(),
        studentId: studentId.toString(),
      },
    });
  } catch (error) {
    console.error(
      `Error getting pilot agents for student ${studentId}:`,
      error,
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
        errorCode: 'INVALID_ID_FORMAT',
      });
    }
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while retrieving pilot agents',
      errorCode: 'SERVER_ERROR',
      systemMessage: config.nodeEnv === 'local' ? error.message : undefined,
    });
  }
};

export const getSinglePilotAgent = async (req, res) => {
  if (!req.user?._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student identification',
      errorCode: 'INVALID_STUDENT_ID',
    });
  }

  const studentId = req.user._id;
  const { id: agentId } = req.params;

  try {
    const student = await Student.findById(studentId)
      .select('autopilotAgent')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        errorCode: 'STUDENT_NOT_FOUND',
      });
    }

    const activeAgents = (student.autopilotAgent || []).filter(
      (a) => a.autopilotEnabled !== false,
    );
    const agent = activeAgents.find((a) => a.agentId === agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        errorCode: 'AGENT_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: { autoPilot: agent },
      meta: {
        timestamp: new Date().toISOString(),
        studentId: studentId.toString(),
      },
    });
  } catch (error) {
    console.error(
      `Error getting pilot agent ${agentId} for student ${studentId}:`,
      error,
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format',
        errorCode: 'INVALID_ID_FORMAT',
      });
    }
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while retrieving pilot agent',
      errorCode: 'SERVER_ERROR',
      systemMessage: config.nodeEnv === 'local' ? error.message : undefined,
    });
  }
};

export const removeAutoPilotAgent = async (req, res) => {
  if (!req.user?._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student identification',
      errorCode: 'INVALID_STUDENT_ID',
    });
  }

  const studentId = req.user._id;
  const { id: agentId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        errorCode: 'STUDENT_NOT_FOUND',
      });
    }

    if (!Array.isArray(student.autopilotAgent)) student.autopilotAgent = [];

    const idx = student.autopilotAgent.findIndex(
      (a) => String(a.agentId) === String(agentId),
    );
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        errorCode: 'AGENT_NOT_FOUND',
      });
    }

    const removedAgent = student.autopilotAgent[idx];
    student.autopilotAgent.splice(idx, 1);
    await student.save();

    return res.status(200).json({
      success: true,
      data: { autoPilot: removedAgent },
      meta: {
        timestamp: new Date().toISOString(),
        studentId: studentId.toString(),
      },
    });
  } catch (error) {
    console.error(
      `Error removing pilot agent ${agentId} for student ${studentId}:`,
      error,
    );

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format',
        errorCode: 'INVALID_ID_FORMAT',
      });
    }
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while removing pilot agent',
      errorCode: 'SERVER_ERROR',
      systemMessage: config.nodeEnv === 'local' ? error.message : undefined,
    });
  }
};

export const activateAgent = async (req, res) => {
  const { _id: studentId } = req.user;
  const { id: agentId } = req.params;
  const { isActive } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid student ID' });
    }
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
        errorCode: 'INVALID_INPUT',
      });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { _id: studentId, 'autopilotAgent.agentId': agentId },
      {
        $set: {
          'autopilotAgent.$.autopilotEnabled': isActive,
          'autopilotAgent.$.updatedAt': new Date(),
        },
      },
      { new: true },
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        errorCode: 'AGENT_NOT_FOUND',
      });
    }

    const updatedAgent = updatedStudent.autopilotAgent.find(
      (a) => a.agentId === agentId,
    );

    return res.status(200).json({
      success: true,
      message: `Agent ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        agentId: updatedAgent.agentId,
        autopilotEnabled: updatedAgent.autopilotEnabled,
      },
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR',
      systemMessage: config.nodeEnv === 'local' ? error.message : undefined,
    });
  }
};
