import { Student } from '../models/students/student.model.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';
import { User } from '../models/User.model.js';
import {
  addCredits,
  CREDIT_EARN,
  earnCreditsForAction,
  getAutopilotEntitlements,
} from '../utils/credits.js';
import { processAutopilotAgent } from '../utils/autopilot.background.js';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { StudentCV } from '../models/students/studentCV.model.js';
import { StudentHtmlCV } from '../models/students/studentHtmlCV.model.js';
import { StudentCL } from '../models/students/studentCL.model.js';
import { StudentCoverLetter } from '../models/students/studentCoverLetter.model.js';
import { getRecommendedJobs } from '../utils/getRecommendedJobs.js';
import { processAgentDiscovery } from '../worker/autopilotWorker.js';
import { AgentFoundJob } from '../models/AgentFoundJob.js';
import { addAutopilotDiscoveryJob } from '../queues/autopilotDiscoveryQueue.js';
import { initiateTailoredJobGeneration } from '../utils/tailoredJobs.js';

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
const activeFoundJobFilter = {
  $or: [{ status: 'ACTIVE' }, { status: { $exists: false } }],
};

const buildTailoredViewUrl = (applicationId) =>
  applicationId ? `/dashboard/my-docs/application/${applicationId}` : null;

const mapAgentJob = (record, tailoredApplication) => {
  const job = record?.job;
  if (!job) return null;

  return {
    id: job._id,
    _id: job._id,
    title: job.title,
    description: job.description,
    company: job.company,
    country: job.country,
    location: job.location,
    remote: job.remote,
    jobTypes: job.jobTypes,
    jobPostedAt: job.jobPostedAt,
    slug: job.slug,
    foundAt: record.foundAt,
    status: record.status || 'ACTIVE',
    tailoredStatus: tailoredApplication?.status || null,
    tailoredGenerated: tailoredApplication?.status === 'completed',
    tailoredApplicationId: tailoredApplication?._id || null,
    tailoredCompletedAt: tailoredApplication?.completedAt || null,
    tailoredViewUrl: buildTailoredViewUrl(tailoredApplication?._id),
  };
};

const buildJobsByDate = (jobs) => {
  const byDate = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  jobs.forEach((job) => {
    const sourceDate = new Date(job.foundAt || job.jobPostedAt || 0);
    const timestamp = sourceDate.getTime();

    if (!Number.isFinite(timestamp)) {
      byDate.older.push(job);
      return;
    }

    if (timestamp >= today.getTime()) {
      byDate.today.push(job);
    } else if (timestamp >= yesterday.getTime()) {
      byDate.yesterday.push(job);
    } else if (timestamp >= lastWeek.getTime()) {
      byDate.lastWeek.push(job);
    } else {
      byDate.older.push(job);
    }
  });

  return byDate;
};

const fetchActiveAgentJobs = async (
  studentId,
  agentMongoId,
  { page = 1, limit = 20 } = {},
) => {
  const filter = {
    student: studentId,
    agent: agentMongoId,
    ...activeFoundJobFilter,
  };
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 20), 50);
  const skip = (safePage - 1) * safeLimit;

  const total = await AgentFoundJob.countDocuments(filter);
  const foundJobs = await AgentFoundJob.find(filter)
    .sort({ foundAt: -1 })
    .skip(skip)
    .limit(safeLimit)
    .populate({
      path: 'job',
      select:
        'title description company country location remote jobTypes slug jobPostedAt',
    })
    .lean();

  const jobIds = foundJobs.map((record) => record?.job?._id).filter(Boolean);

  let tailoredByJobId = new Map();
  if (jobIds.length > 0) {
    const tailoredApplications = await StudentTailoredApplication.find({
      student: studentId,
      flag: 'agent',
      jobId: { $in: jobIds },
    })
      .sort({ createdAt: -1 })
      .select('_id jobId status completedAt createdAt')
      .lean();

    tailoredByJobId = tailoredApplications.reduce((map, application) => {
      const key = String(application.jobId || '');
      if (key && !map.has(key)) {
        map.set(key, application);
      }
      return map;
    }, new Map());
  }

  const jobs = foundJobs
    .map((record) =>
      mapAgentJob(record, tailoredByJobId.get(String(record?.job?._id || ''))),
    )
    .filter(Boolean);

  return {
    jobs,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: total > 0 ? Math.ceil(total / safeLimit) : 0,
      hasNextPage: skip + safeLimit < total,
      hasPrevPage: safePage > 1,
    },
  };
};

export const createAutopilotAgent = async (req, res) => {
  try {
    const { _id: studentId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid student ID' });
    }

    const requiredFields = [
      'agentName',
      'jobTitle',
      'country',
      'employmentTypes',
    ];
    const missing = requiredFields.filter((f) => !req.body[f]);

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missing,
      });
    }

    const agentName = String(req.body.agentName).trim();
    const jobTitle = String(req.body.jobTitle).trim();
    const employmentType = req.body.employmentTypes;
    const isRemote = toBool(req.body.isRemote);
    const isOnsite = toBool(req.body.isOnsite);
    const keywords = String(req.body.keywords || '').trim();
    const cvOption =
      req.body.cvOption === 'uploaded_pdf'
        ? 'uploaded_pdf'
        : req.body.cvOption === 'saved_cv'
          ? 'saved_cv'
          : 'current_profile';
    const selectedCVId = String(req.body.selectedCVId || '').trim();
    const selectedCVSource = String(req.body.selectedCVSource || '').trim();
    const selectedCVTitle = String(req.body.selectedCVTitle || '').trim();
    const coverLetterStrategy =
      req.body.coverLetterStrategy === 'template' ? 'template' : 'generate';
    const selectedCoverLetterId = String(
      req.body.selectedCoverLetterId || req.body.savedClId || '',
    ).trim();
    const selectedCoverLetterSource = String(
      req.body.selectedCoverLetterSource || 'saved',
    ).trim();
    const selectedCoverLetterTitle = String(
      req.body.selectedCoverLetterTitle || '',
    ).trim();
    const coverLetterInstructions = String(
      req.body.coverLetterInstructions || '',
    ).trim();
    const jobDescription = String(req.body.jobDescription || '');
    const autopilotLimit = Math.min(Number(req.body.autopilotLimit || 5), 20);
    const country = String(req.body.country || '').trim();

    if (cvOption === 'uploaded_pdf' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required for uploaded_pdf option',
      });
    }

    if (cvOption === 'saved_cv') {
      if (!selectedCVId || !mongoose.Types.ObjectId.isValid(selectedCVId)) {
        return res.status(400).json({
          success: false,
          message: 'A valid selected CV is required for saved_cv option',
        });
      }

      if (!['saved', 'generated'].includes(selectedCVSource)) {
        return res.status(400).json({
          success: false,
          message: 'selectedCVSource must be saved or generated',
        });
      }

      const selectedDoc =
        selectedCVSource === 'generated'
          ? await StudentCV.findOne({
              _id: selectedCVId,
              student: studentId,
              status: 'completed',
            })
              .select('_id')
              .lean()
          : await StudentHtmlCV.findOne({
              _id: selectedCVId,
              student: studentId,
            })
              .select('_id')
              .lean();

      if (!selectedDoc) {
        return res.status(404).json({
          success: false,
          message:
            selectedCVSource === 'generated'
              ? 'Generated CV not found or not ready'
              : 'Saved CV not found',
        });
      }
    }

    if (coverLetterStrategy === 'template') {
      if (
        !selectedCoverLetterId ||
        !mongoose.Types.ObjectId.isValid(selectedCoverLetterId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            'A valid selected cover letter is required for template strategy',
        });
      }

      if (!['saved', 'generated'].includes(selectedCoverLetterSource)) {
        return res.status(400).json({
          success: false,
          message: 'selectedCoverLetterSource must be saved or generated',
        });
      }

      const selectedLetter =
        selectedCoverLetterSource === 'generated'
          ? await StudentCL.findOne({
              _id: selectedCoverLetterId,
              student: studentId,
              status: 'completed',
            })
              .select('_id')
              .lean()
          : await StudentCoverLetter.findOne({
              _id: selectedCoverLetterId,
              student: studentId,
            })
              .select('_id')
              .lean();

      if (!selectedLetter) {
        return res.status(404).json({
          success: false,
          message:
            selectedCoverLetterSource === 'generated'
              ? 'Generated cover letter not found or not ready'
              : 'Saved cover letter not found',
        });
      }
    }

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext !== '.pdf')
        return res
          .status(400)
          .json({ success: false, message: 'Only PDF allowed' });
      if (req.file.size > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ success: false, message: 'File must be <5MB' });
      }
    }

    const agentId = `agent_${uuidv4()}`;

    const entitlements = await getAutopilotEntitlements(studentId);
    const activeAgentCount = await StudentAgent.countDocuments({
      student: studentId,
      isAgentActive: true,
    });
    const existingAgentCount = await StudentAgent.countDocuments({
      student: studentId,
    });
    const isFirstAgent = existingAgentCount === 0;

    if (
      Number.isFinite(entitlements.maxAgents) &&
      activeAgentCount >= entitlements.maxAgents
    ) {
      return res.status(403).json({
        success: false,
        message: entitlements.isFree
          ? 'Free plan supports only 1 active AI job agent. Upgrade to add more.'
          : `Your plan supports only ${entitlements.maxAgents} active AI job agents.`,
        errorCode: 'AGENT_LIMIT_REACHED',
        upgradeRequired: entitlements.isFree,
      });
    }

    const agent = await StudentAgent.create({
      student: studentId,
      agentId,
      agentName,
      jobTitle,
      country,
      isRemote,
      agentDailyLimit: entitlements.dailyJobLimit,
      isOnsite,
      keywords,
      employmentType,
      cvOption,
      selectedCVId: cvOption === 'saved_cv' ? selectedCVId : undefined,
      selectedCVSource:
        cvOption === 'saved_cv' ? selectedCVSource : undefined,
      selectedCVTitle: cvOption === 'saved_cv' ? selectedCVTitle : undefined,
      coverLetterStrategy,
      selectedCoverLetterId:
        coverLetterStrategy === 'template'
          ? selectedCoverLetterId
          : undefined,
      selectedCoverLetterSource:
        coverLetterStrategy === 'template'
          ? selectedCoverLetterSource
          : undefined,
      selectedCoverLetterTitle:
        coverLetterStrategy === 'template'
          ? selectedCoverLetterTitle
          : undefined,
      coverLetterInstructions,
      autopilotEnabled: true,
      autopilotLimit,
      jobDescription,
      status: 'processing',
    });

    await User.findByIdAndUpdate(studentId, {
      $inc: { 'usageCounters.aiAutoApply': 1 },
    });

    if (isFirstAgent) {
      earnCreditsForAction(studentId, 'FIRST_AUTO_AGENT_SETUP', {
        agentId,
      }).catch((err) =>
        console.error('FIRST_AUTO_AGENT_SETUP credit failed:', err?.message),
      );
    }

    const io = req.app.get('io');

    processAutopilotAgent(studentId, agentId, req.file, io).catch(
      console.error,
    );

    return res.status(202).json({
      success: true,
      agentId,
      status: 'processing',
      message: 'Autopilot agent started',
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path))
      fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllPilotAgents = async (req, res) => {
  const studentId = req.user._id;

  try {
    const [activeAgents, user, appliedStats] = await Promise.all([
      StudentAgent.find({ student: studentId }).lean(),
      User.findById(studentId).select('usageLimits usageCounters').lean(),
      AppliedJob.aggregate([
        {
          $match: {
            student: new mongoose.Types.ObjectId(studentId),
            applicationMethod: 'AUTOPILOT',
          },
        },
        {
          $facet: {
            today: [
              {
                $match: {
                  applicationDate: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  },
                },
              },
              { $count: 'count' },
            ],
            total: [{ $count: 'count' }],
          },
        },
      ]),
    ]);

    const applicationsToday =
      appliedStats[0]?.today?.[0]?.count ??
      user?.usageCounters?.aiAutoApplyDailyLimit ??
      0;
    const totalApplied =
      appliedStats[0]?.total?.[0]?.count ??
      user?.usageCounters?.aiAutoApply ??
      0;
    const entitlements = await getAutopilotEntitlements(studentId);
    const dailyLimit = entitlements.dailyJobLimit;
    const totalLimit = user?.usageLimits?.aiAutoApply ?? -1;

    const planUsage = {
      applicationsToday,
      dailyLimit: dailyLimit === -1 ? '∞' : dailyLimit,
      totalApplied,
      totalLimit: totalLimit === -1 ? '∞' : totalLimit,
    };

    const enrichedAgents = activeAgents.map((agent) => {
      const agentCap = Math.min(
        dailyLimit,
        dailyLimit === -1 ? 999 : dailyLimit,
      );
      return {
        ...agent,
        applicationsToday,
        maxApplications:
          dailyLimit === -1 ? agent.agentDailyLimit || 5 : agentCap,
        totalApplications: totalApplied,
      };
    });

    if (activeAgents.length === 0) {
      return res.status(200).json({
        count: 0,
        data: [],
        meta: { planUsage },
      });
    }

    return res.status(200).json({
      success: true,
      count: enrichedAgents.length,
      data: enrichedAgents,
      meta: { planUsage },
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
  const studentId = req.user._id;
  const { id: agentId } = req.params;

  try {
    const isMongoId =
      mongoose.Types.ObjectId.isValid(agentId) && String(agentId).length === 24;
    const agent = await StudentAgent.findOne(
      isMongoId
        ? { _id: agentId, student: studentId }
        : { agentId, student: studentId },
    ).lean();

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

/**
 * Get recommended jobs for an agent (matches agent's criteria).
 * Used by the AI Job Agents dashboard accordion.
 */
export const getAgentJobs = async (req, res) => {
  const studentId = req.user._id;
  const { id: agentId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const shouldRefresh = toBool(req.query.refresh);

  try {
    const agent = await StudentAgent.findOne({
      agentId,
      student: studentId,
    }).lean();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    let { jobs, pagination } = await fetchActiveAgentJobs(
      studentId,
      agent._id,
      {
        page,
        limit,
      },
    );

    const hasJobs = jobs.length > 0;
    const canDiscoverMore = agent.isAgentActive !== false;
    let isRefreshing = false;

    if ((shouldRefresh || !hasJobs) && canDiscoverMore) {
      // Queue discovery for background processing to avoid blocking the response
      addAutopilotDiscoveryJob(agent, shouldRefresh).catch((err) => {
        console.error('[getAgentJobs] Failed to queue discovery:', err);
      });
      // Return current jobs immediately with a flag indicating refresh is in progress
      isRefreshing = true;
    }

    return res.status(200).json({
      success: true,
      data: { jobs, byDate: buildJobsByDate(jobs), isRefreshing },
      meta: {
        agentId: agent.agentId,
        count: jobs.length,
        pagination,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch agent jobs',
    });
  }
};

export const replaceAgentJob = async (req, res) => {
  const studentId = req.user._id;
  const { agentId, jobId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  try {
    const isMongoId =
      mongoose.Types.ObjectId.isValid(agentId) && String(agentId).length === 24;
    const agent = await StudentAgent.findOne(
      isMongoId
        ? { _id: agentId, student: studentId }
        : { agentId, student: studentId },
    ).lean();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    const updated = await AgentFoundJob.findOneAndUpdate(
      {
        student: studentId,
        agent: agent._id,
        job: jobId,
        ...activeFoundJobFilter,
      },
      {
        $set: {
          status: 'NOT_INTERESTED',
          resolvedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Agent job not found',
      });
    }

    const discovery = await processAgentDiscovery(agent, {
      force: true,
      requestedSlots: 1,
    });
    const { jobs, pagination } = await fetchActiveAgentJobs(
      studentId,
      agent._id,
      {
        page,
        limit,
      },
    );

    return res.status(200).json({
      success: true,
      message:
        discovery.processed > 0
          ? 'Replacement job found'
          : 'Job marked as not interested',
      data: {
        jobs,
        byDate: buildJobsByDate(jobs),
        replacementFound: discovery.processed > 0,
      },
      meta: {
        agentId: agent.agentId,
        count: jobs.length,
        pagination,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to replace agent job',
    });
  }
};

/**
 * Start tailored doc generation for a job found by an agent.
 * First find (jobs in accordion) -> user clicks Generate -> this endpoint.
 */
// src/controllers/agentJobTailored.controller.js

export const startAgentJobTailoredGeneration = async (req, res) => {
  const studentId = req.user._id;
  const { agentId: agentIdParam, jobId } = req.params;

  try {
    const result = await initiateTailoredJobGeneration({
      studentId,
      agentIdParam,
      jobId,
      io: req.app.get('io'),
    });

    return res.status(result.status).json({
      success: result.success,
      message: result.message,
      ...(result.errorCode ? { errorCode: result.errorCode } : {}),
      ...(result.data ? { data: result.data } : {}),
    });
  } catch (error) {
    console.error(
      `Error starting tailored generation agent=${agentIdParam} job=${jobId}:`,
      error,
    );
    return res.status(500).json({
      success: false,
      message: 'Failed to start tailored doc generation',
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
    await StudentAgent.findOneAndDelete({
      agentId,
      student: studentId,
    });

    return res.status(200).json({
      success: true,
      message: 'Autopilot agent removed successfully',
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

    if (isActive) {
      const entitlements = await getAutopilotEntitlements(studentId);
      const activeAgentCount = await StudentAgent.countDocuments({
        student: studentId,
        isAgentActive: true,
        agentId: { $ne: agentId },
      });

      if (
        Number.isFinite(entitlements.maxAgents) &&
        activeAgentCount >= entitlements.maxAgents
      ) {
        return res.status(403).json({
          success: false,
          message: entitlements.isFree
            ? 'Free plan supports only 1 active AI job agent. Upgrade to activate more.'
            : `Your plan supports only ${entitlements.maxAgents} active AI job agents.`,
          errorCode: 'AGENT_LIMIT_REACHED',
          upgradeRequired: entitlements.isFree,
        });
      }
    }

    const updatedAgent = await StudentAgent.findOneAndUpdate(
      { agentId, student: studentId },
      {
        $set: isActive
          ? {
              isAgentActive: isActive,
              agentDailyLimit: (await getAutopilotEntitlements(studentId))
                .dailyJobLimit,
            }
          : { isAgentActive: isActive },
      },
      { new: true },
    );

    if (!updatedAgent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        errorCode: 'AGENT_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Agent ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        agentId: updatedAgent.agentId,
        autopilotEnabled: updatedAgent.isAgentActive,
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

export const singleActivateAgent = async (req, res) => {
  const { _id: studentId } = req.user;
  const { id: agentId } = req.params;
  const { isAgentActive } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid student ID' });
    }
    if (typeof isAgentActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAgentActive must be a boolean value',
        errorCode: 'INVALID_INPUT',
      });
    }

    if (isAgentActive) {
      const entitlements = await getAutopilotEntitlements(studentId);
      const activeAgentCount = await StudentAgent.countDocuments({
        student: studentId,
        isAgentActive: true,
        agentId: { $ne: agentId },
      });

      if (
        Number.isFinite(entitlements.maxAgents) &&
        activeAgentCount >= entitlements.maxAgents
      ) {
        return res.status(403).json({
          success: false,
          message: entitlements.isFree
            ? 'Free plan supports only 1 active AI job agent. Upgrade to activate more.'
            : `Your plan supports only ${entitlements.maxAgents} active AI job agents.`,
          errorCode: 'AGENT_LIMIT_REACHED',
          upgradeRequired: entitlements.isFree,
        });
      }
    }

    const updatedAgent = await StudentAgent.findOneAndUpdate(
      { agentId, student: studentId },
      {
        $set: isAgentActive
          ? {
              isAgentActive,
              agentDailyLimit: (await getAutopilotEntitlements(studentId))
                .dailyJobLimit,
            }
          : { isAgentActive },
      },
      { new: true },
    );

    if (!updatedAgent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        errorCode: 'AGENT_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Agent ${isAgentActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        agentId: updatedAgent.agentId,
        autopilotEnabled: updatedAgent.isAgentActive,
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
