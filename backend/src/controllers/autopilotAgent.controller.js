import { Student } from '../models/student.model.js';
import mongoose from 'mongoose';
import { extractDataFromCV } from '../utils/extractedCv.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redis.js';

export const createAutopilotAgent = async (req, res) => {
  try {
    const { _id: studentId } = req.user;
    const {
      agentName,
      jobTitle,
      country,
      isRemote = false,
      isOnsite = false,
      employmentType,
      cvOption = 'current_profile',
      jobDescription = '',
      autopilotLimit = 5,
    } = req.body;

    // Validate student exists
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    // Check if student exists
    const studentExists = await Student.exists({ _id: studentId });
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Validate required fields
    const requiredFields = [
      'agentName',
      'jobTitle',
      'country',
      'employmentType',
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields,
      });
    }

    if (!['current_profile', 'uploaded_pdf'].includes(cvOption)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CV option',
        validOptions: ['current_profile', 'uploaded_pdf'],
      });
    }

    if (cvOption === 'cv' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required for uploaded_pdf option',
      });
    }

    const agentId = `agent_${uuidv4()}`;

    // Prepare agent data
    const newAgent = {
      agentId,
      agentName,
      jobTitle,
      country,
      isRemote: Boolean(isRemote),
      isOnsite: Boolean(isOnsite),
      employmentType,
      cvOption,
      autopilotEnabled: true,
      autopilotLimit: Math.min(Number(autopilotLimit), 20), // Cap at 20 applications/day
      jobDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Process CV if uploaded
    if (req.file) {
      try {
        // Validate file extension
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext !== '.pdf') {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            message: 'Only PDF files are allowed for CV upload',
          });
        }

        // Validate file size (max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            message: 'CV file size must be less than 5MB',
          });
        }

        const extractedData = await extractDataFromCV(req.file.path);

        // Store extraction results
        newAgent.uploadedCVData = {
          skills: (extractedData.skills || []).map((skill) => ({
            ...skill,
            skillId: new mongoose.Types.ObjectId(),
          })),
          experience: (extractedData.experience || []).map((exp) => ({
            ...exp,
            experienceId: new mongoose.Types.ObjectId(),
          })),
          education: (extractedData.education || []).map((edu) => ({
            ...edu,
            educationId: new mongoose.Types.ObjectId(),
          })),
          projects: (extractedData.projects || []).map((proj) => ({
            ...proj,
            projectId: new mongoose.Types.ObjectId(),
          })),
          jobRole: extractedData.jobRole || '',
        };

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
      } catch (extractError) {
        console.error('CV extraction error:', extractError);
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'CV extraction failed',
          error: extractError.message,
        });
      }
    }

    // Create the agent
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $push: { autopilotAgent: newAgent } },
      { new: true, runValidators: true },
    ).select('autopilotAgent');

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found after update',
      });
    }

    // Get the newly created agent
    const createdAgent = updatedStudent.autopilotAgent.find(
      (agent) => agent.agentId === agentId,
    );

    res.status(201).json({
      success: true,
      message: 'Autopilot agent created successfully',
      agent: createdAgent,
    });
  } catch (error) {
    console.error('Agent creation error:', error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getAllPilotAgents = async (req, res) => {
  // Validate student ID from authenticated user
  if (!req.user?._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student identification',
      errorCode: 'INVALID_STUDENT_ID',
    });
  }

  const studentId = req.user._id;

  try {
    // Find student with only autopilotAgent field selected
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

    // Filter out only active agents if needed
    const activeAgents = student.autopilotAgent.filter(
      (agent) => agent.isActive !== false,
    );

    // Log successful retrieval (for monitoring)
    console.log(
      `Retrieved ${activeAgents.length} pilot agents for student ${studentId}`,
    );

    return res.status(200).json({
      success: true,
      count: activeAgents.length,
      data: {
        autoPilot: activeAgents,
      },
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

    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
        errorCode: 'INVALID_ID_FORMAT',
      });
    }

    // Handle database connection errors
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
      });
    }

    // Generic server error response
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while retrieving pilot agents',
      errorCode: 'SERVER_ERROR',
      systemMessage:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getSinglePilotAgent = async (req, res) => {
  // Validate student ID from authenticated user
  if (!req.user?._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student identification',
      errorCode: 'INVALID_STUDENT_ID',
    });
  }

  const studentId = req.user._id;
  const { id: agentId } = req.params;
  console.log(`Retrieving pilot agent ${agentId} for student ${studentId}`);

  try {
    // Find student with only autopilotAgent field selected
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

    // Filter out only active agents if needed
    const activeAgents = student.autopilotAgent.filter(
      (agent) => agent.isActive !== false,
    );

    // Find the agent
    const agent = activeAgents.find((a) => a.agentId === agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        errorCode: 'AGENT_NOT_FOUND',
      });
    }

    // Log successful retrieval (for monitoring)
    console.log(`Retrieved pilot agent ${agentId} for student ${studentId}`);

    return res.status(200).json({
      success: true,
      data: {
        autoPilot: agent,
      },
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

    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format',
        errorCode: 'INVALID_ID_FORMAT',
      });
    }

    // Handle database connection errors
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
      });
    }

    // Generic server error response
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while retrieving pilot agent',
      errorCode: 'SERVER_ERROR',
      systemMessage:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
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
  console.log(`Removing pilot agent ${agentId} for student ${studentId}`);

  try {
    // Find student by ID and update
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        errorCode: 'STUDENT_NOT_FOUND',
      });
    }

    // Initialize autopilotAgent array if it doesn't exist
    if (!student.autopilotAgent) {
      student.autopilotAgent = [];
    }

    // Find the agent index
    const agentIndex = student.autopilotAgent.findIndex((a) => {
      console.log(`Agent ID: ${a.agentId}, Target ID: ${agentId}`);
      return a.agentId === agentId;
    });

    console.log(`Agent index: ${agentIndex}`);

    if (agentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        errorCode: 'AGENT_NOT_FOUND',
      });
    }

    // Get the agent before removing (for response)
    const removedAgent = student.autopilotAgent[agentIndex];

    // Remove the agent
    student.autopilotAgent.splice(agentIndex, 1);

    await student.save();

    return res.status(200).json({
      success: true,
      data: {
        autoPilot: removedAgent,
      },
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

    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format',
        errorCode: 'INVALID_ID_FORMAT',
      });
    }

    // Handle database connection errors
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
      });
    }

    // Generic server error response
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while removing pilot agent',
      errorCode: 'SERVER_ERROR',
      systemMessage:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const activateAgent = async (req, res) => {
  const { _id: studentId } = req.user;
  const { id: agentId } = req.params;
  const { isActive } = req.body;

  console.log(`Activating agent ${agentId} for student ${studentId}`);

  try {
    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
        errorCode: 'INVALID_INPUT',
      });
    }

    // Find and update the specific agent
    const updatedStudent = await Student.findOneAndUpdate(
      {
        _id: studentId,
        'autopilotAgent.agentId': agentId,
      },
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

    // Find the updated agent to return
    const updatedAgent = updatedStudent.autopilotAgent.find(
      (agent) => agent.agentId === agentId,
    );

    res.status(200).json({
      success: true,
      message: `Agent ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        agentId: updatedAgent.agentId,
        autopilotEnabled: updatedAgent.autopilotEnabled,
      },
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR',
      systemMessage:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
