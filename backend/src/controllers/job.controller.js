import { v4 as uuidv4 } from 'uuid';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/students/student.model.js';
import redisClient from '../config/redis.js';
import { config } from '../config/config.js';
import { fetchAndSaveJobsService } from '../utils/fetchAndSaveJobsService.js';
import {
  safeParseInt,
  buildSearchContext,
  retrieveCandidates,
  applyFilters,
  rankJobs,
  diversify,
  normalizeEmploymentTypeForApi,
  fetchExternalJobs,
  transformRapidApiJob,
  upsertExternalJobs,
  retrieveLocalCandidates,
} from '../utils/jobHelpers.js';
import { generateEmbedding } from '../config/embedding.js';
import { JobInteraction } from '../models/jobInteraction.model.js';
import mongoose, { isObjectIdOrHexString } from 'mongoose';
import { AppliedJob } from '../models/AppliedJob.js';
import TemplateManager from '../email-templates/lib/templateLoader.js';
import path from 'path';
import { __dirname } from '../utils/fileUploadingManaging.js';
import { transporter } from '../utils/transporter.js';
import { genAIRequest } from '../config/gemini.js';
import { Organization } from '../models/Organization.model.js';
import { StudentCV } from '../models/students/studentCV.model.js';
import { StudentHtmlCV } from '../models/students/studentHtmlCV.model.js';
import puppeteer from 'puppeteer';
import { uploadBufferToCloudinary } from '../middlewares/multer.js';
import { wrapCVHtml } from '../utils/cvTemplate.js';
import { StudentCoverLetter } from '../models/students/studentCoverLetter.model.js';
import fs from 'fs'; // Required to read the uploaded files

// --- Constants ---
const SEARCH_TTL = 120; // seconds
const LOCK_TTL = 10; // seconds for in-flight refresh lock

const ALLOWED_JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'];
const ALLOWED_SALARY_PERIODS = ['HOUR', 'DAY', 'MONTH', 'YEAR'];

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

// --- Functions ---

export async function countJobs(filter = { published: true }) {
  return Job.countDocuments(filter).exec();
}

export async function fetchJobsPage({
  page = 1,
  limit = 5000,
  fields = ['slug', 'updatedAt'],
} = {}) {
  const projection = {};
  fields.forEach((f) => (projection[f] = 1));
  const skip = (page - 1) * limit;
  return Job.find()
    .select(projection)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}

async function vectorJobSearch({
  query,
  limit,
  country,
  state,
  city,
  employmentType,
}) {
  const queryVector = await generateEmbedding(query);
  if (!queryVector) return [];

  const filters = [{ isActive: true }];

  if (country) filters.push({ country });
  if (state) filters.push({ 'location.state': state });
  if (city) filters.push({ 'location.city': city });

  if (employmentType) {
    const normalized = normalizeEmploymentTypeForDbFilter(employmentType);
    if (normalized?.length) {
      filters.push({ jobTypes: { $in: normalized } });
    }
  }

  const pipeline = [
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'job_embedding',
        queryVector,
        numCandidates: 150,
        limit,
        filter: { $and: filters },
      },
    },
    {
      $addFields: {
        score: { $meta: 'vectorSearchScore' },
      },
    },
    {
      $project: {
        job_embedding: 0,
        __v: 0,
      },
    },
  ];

  return Job.aggregate(pipeline);
}

function buildPrompt(jd, orgContext) {
  return `
You are an experienced HR and technical recruitment specialist.

Your task is to generate a professional, factual job description.

STRICT RULES:
- Use ONLY the information explicitly provided below.
- Do NOT invent company size, email addresses, phone numbers, benefits, salary, location, or website unless provided.
- Do NOT add a "How to Apply" section.
- Do NOT use filler phrases or conversational language.
- Keep the tone formal, concise, and suitable for a job portal.
- if ( Responsibilities,
Required Skills & Qualifications
Nice-to-Have Skills )
- are not provided, then generate them according to the job description.
JOB DETAILS:
${jd}

ORGANIZATION DETAILS:
${JSON.stringify(orgContext, null, 2)}

OUTPUT FORMAT (Markdown only):
About the Company
Role Overview
Key Responsibilities
Required Skills & Qualifications
Nice-to-Have Skills (if applicable)

Only return the job description. No explanations. No prefaces.
`;
}

async function generateJobDescriptionService(jd, org) {
  const prompt = buildPrompt(jd, org);
  const response = await genAIRequest(prompt);
  return response;
}

// -------Controllers-------

export const getAllAppliedJobList = async (req, res) => {
  const { _id: studentId } = req.user;
  const appliedJobs = await AppliedJob.find({ student: studentId })
    .populate('job')
    .lean()
    .exec();

  return res.status(200).json({
    success: true,
    appliedJobs,
  });
};

export async function searchJobs(req, res) {
  const startTime = Date.now();
  try {
    const { q, page = 1, limit = 30 } = req.query || {};
    const pageNum = safeParseInt(page, 1);
    const limitNum = safeParseInt(limit, 30);

    console.log('pageNum', pageNum);
    console.log('limitNum', limitNum);
    // 1. Build Context & Fetch Local Candidates in Parallel
    const context = await buildSearchContext(req);

    // 🔥 FIX: Aggressively fetch more local candidates because in-memory filtering drops many jobs.
    // Ensure we have a large enough pool to satisfy current and future pages.
    const requiredPoolSize = pageNum * limitNum * 10 + 200;
    console.log('requiredPoolSize', requiredPoolSize);

    // 🔥 OPTIMIZATION: Get local candidates FAST
    let candidates = await retrieveLocalCandidates(context, requiredPoolSize);

    const processPool = (jobsPool) => {
      const filtered = applyFilters(jobsPool, context);
      const ranked = rankJobs(filtered, context);
      return diversify(ranked);
    };

    let processed = processPool(candidates);

    const start = (pageNum - 1) * limitNum;
    let paginatedJobs = processed.slice(start, start + limitNum);

    // 2. 🚀 FAST FALLBACK: Ensure we fill up to the requested limit, even if 'q' is missing
    if (paginatedJobs.length < limitNum) {
      const apiFallbackQuery =
        q || req.query.employmentType || req.query.experience || 'jobs';

      // Parallelize fetching to avoid 60 second response times from sequential API calls
      const pagesToFetch = [pageNum, pageNum + 1, pageNum + 2];

      const fetchPromises = pagesToFetch.map((apiPage) =>
        fetchExternalJobs(
          apiFallbackQuery,
          context.filters?.country || 'IN',
          context.filters?.state,
          context.filters?.city,
          null, // datePosted
          normalizeEmploymentTypeForApi(req.query.employmentType),
          null, // experience
          apiPage,
        ),
      );

      const API_TIMEOUT = 12000; // 12 seconds max waiting for RapidAPI

      // Wait for all 3 requests to finish concurrently OR timeout
      const responsesRaw = await Promise.all(
        fetchPromises.map((p) =>
          Promise.race([
            p,
            new Promise((resolve) =>
              setTimeout(() => resolve([]), API_TIMEOUT),
            ),
          ]),
        ),
      );

      // Flatten arrays and filter out nulls
      const externalRaw = responsesRaw.flat().filter(Boolean);

      if (externalRaw.length > 0) {
        const formatted = externalRaw.map((j) =>
          transformRapidApiJob(j, q || 'job'),
        );

        // 🛡️ DATA CONSISTENCY REQUIREMENT:
        // We MUST await the upsert before sending the response AND before cloning!
        // If we don't, the user could click the job instantly on the frontend, triggering
        // a 404 on `jobs/find?slug=...` because MongoDB hasn't finished its background write yet.
        await upsertExternalJobs(formatted).catch((e) =>
          console.error('Sync Upsert Error', e.message),
        );

        const filteredExt = processPool(formatted);

        if (filteredExt.length > 0) {
          const remainingNeeded = limitNum - paginatedJobs.length;
          const toAdd = filteredExt.slice(0, remainingNeeded);
          paginatedJobs = [...paginatedJobs, ...toAdd];
          processed = [...processed, ...filteredExt];
        }
      }
    }

    // 3. Track Impression
    const activeJobIds = paginatedJobs
      .filter((j) => j._id)
      .map((j) => String(j._id));
    if (activeJobIds.length > 0) {
      const impressionDocs = activeJobIds.map((jobId) => ({
        job: jobId,
        user: req.user?._id || null,
        type: 'IMPRESSION',
        meta: {
          query: q || null,
          source: 'search',
        },
      }));

      JobInteraction.insertMany(impressionDocs, { ordered: false }).catch((e) =>
        console.error('Impression error', e.message),
      );
    }

    console.log('paginatedJobs', paginatedJobs.length);

    return res.status(200).json({
      success: true,
      jobs: paginatedJobs,
      pagination: {
        currentPage: pageNum,
        hasNextPage:
          paginatedJobs.length >= limitNum ||
          candidates.length >= requiredPoolSize,
        totalJobs:
          processed.length > start + limitNum
            ? processed.length
            : start + paginatedJobs.length,
      },
    });
  } catch (error) {
    console.error('error', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}

export const postManualJob = async (req, res) => {
  const { organization: organizationId } = req.user;

  try {
    if (!organizationId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: no organization found',
      });
    }

    const payload = req.body || {};

    const {
      title,
      description,
      company,
      applyMethod,
      jobTypes,
      salary,
      country,
      location,
      responsibilities,
      qualifications,
      experience,
      tags,
      remote,
      jobAddress,
      isActive,
      contractLength,
      resumeRequired,
      isOnboarding,

      // NEW FIELDS FROM FRONTEND:
      screeningQuestions,
      assignment,
    } = payload;

    // --- Validation ---
    if (!title || typeof title !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Job title is required' });
    }
    if (!description || typeof description !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Job description is required' });
    }
    if (!company || typeof company !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Company name is required' });
    }

    // --- Normalization: Job Types ---
    const normalizedJobTypes = Array.isArray(jobTypes)
      ? jobTypes.filter((t) => ALLOWED_JOB_TYPES.includes(t))
      : [];

    // --- Normalization: Apply Method ---
    let normalizedApplyMethod = undefined;
    if (applyMethod && typeof applyMethod === 'object') {
      const method = applyMethod.method;
      if (method === 'EMAIL') {
        const email =
          applyMethod.email ||
          (Array.isArray(applyMethod.emails) && applyMethod.emails[0]) ||
          null;

        if (!email) {
          return res.status(400).json({
            success: false,
            message: 'Application email is required for EMAIL method',
          });
        }
        normalizedApplyMethod = { method: 'EMAIL', email, url: null };
      } else if (method === 'URL') {
        const url = applyMethod.url;
        if (!url) {
          return res.status(400).json({
            success: false,
            message: 'Application URL is required for URL method',
          });
        }
        normalizedApplyMethod = { method: 'URL', email: null, url };
      }
    }

    // --- Normalization: Salary ---
    let normalizedSalary = undefined;
    if (salary && typeof salary === 'object') {
      const min = salary.min !== undefined ? Number(salary.min) : undefined;
      const max = salary.max !== undefined ? Number(salary.max) : undefined;
      const period = ALLOWED_SALARY_PERIODS.includes(salary.period)
        ? salary.period
        : undefined;

      normalizedSalary = {
        min: Number.isFinite(min) ? min : undefined,
        max: Number.isFinite(max) ? max : undefined,
        period,
      };
    }

    // --- Normalization: Location ---
    let normalizedLocation = undefined;
    if (!remote && location && typeof location === 'object') {
      normalizedLocation = {
        city: location.city || '',
        state: location.state || '',
        postalCode: location.postalCode || '',
        lat: location.lat ? Number(location.lat) : undefined,
        lng: location.lng ? Number(location.lng) : undefined,
      };
    }

    // --- Normalization: Screening Questions ---
    const normalizedScreeningQuestions = Array.isArray(screeningQuestions)
      ? screeningQuestions
          .map((q) => ({
            question: q.question,
            type: ['text', 'boolean', 'number', 'date'].includes(q.type)
              ? q.type
              : 'text',
            required: typeof q.required === 'boolean' ? q.required : true,
          }))
          .filter((q) => q.question) // Filter out empty questions
      : [];

    // --- Normalization: Assignment ---
    let normalizedAssignment = { isEnabled: false };

    // Check if the frontend sent assignment data
    if (assignment && assignment.isEnabled) {
      normalizedAssignment = {
        isEnabled: true,
        type: ['MANUAL', 'FILE'].includes(assignment.type)
          ? assignment.type
          : 'MANUAL',
        instruction: assignment.content || assignment.assignmentQuestion || '',
        fileUrl: assignment.fileUrl || null,
      };
    }

    const now = new Date();
    const humanPosted = 'Just now';

    // Search Queries construction
    const queries = [
      title,
      company,
      country,
      normalizedLocation?.city,
      normalizedLocation?.state,
      jobAddress,
    ]
      .filter(Boolean)
      .map((q) => String(q).toLowerCase());

    const normalizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    // --- Active Status ---
    let finalIsActive = isActive !== undefined ? isActive : true;
    if (isOnboarding === true) {
      finalIsActive = false;
    }

    // --- Build Document ---
    const jobData = {
      jobId: uuidv4(),
      origin: 'HOSTED',
      organizationId,
      title: title.trim(),
      description,
      company: company.trim(),
      jobTypes: normalizedJobTypes,
      applyMethod: normalizedApplyMethod,
      salary: normalizedSalary,
      country,
      location: normalizedLocation,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      experience: Array.isArray(experience) ? experience : [],
      tags: normalizedTags,
      queries,
      jobPosted: humanPosted,
      jobPostedAt: now,
      isActive: finalIsActive,
      resumeRequired: resumeRequired !== undefined ? resumeRequired : true,
      remote: !!remote,
      contractLength: contractLength,
      jobAddress: jobAddress,

      // Attach new normalized fields
      screeningQuestions: normalizedScreeningQuestions,
      assignment: normalizedAssignment,
    };

    const newJob = await Job.create(jobData);

    // Cache invalidation
    if (global.redisClient) {
      await Promise.all([
        global.redisClient.invalidateAllJobsCache().catch(() => {}),
        global.redisClient.del('jobs:employmentTypes').catch(() => {}),
      ]);
    }

    return res.status(201).json({
      success: true,
      message: isOnboarding
        ? 'Job created and queued for verification.'
        : 'Job posted successfully',
      job: newJob,
    });
  } catch (error) {
    console.error('Error posting job:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const {
      query = '',
      country = '',
      city = '',
      datePosted = '',
      employmentType = '',
      experience = '',
      page = 1,
      limit = 10,
    } = req.query || {};

    // Hybrid fetch triggers (keep behaviour identical)
    if (query) {
      const existingJobCount = await Job.countDocuments({
        queries: { $in: [query] },
      });
      if (existingJobCount === 0) await fetchAndSaveJobsService(query);
      else fetchAndSaveJobsService(query);
    }

    // Build filter
    const filter = {};
    if (query)
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };

    if (datePosted) {
      const dateNow = new Date();
      let dateFilter;
      switch (datePosted) {
        case '1':
          dateFilter = new Date(dateNow.setDate(dateNow.getDate() - 1));
          break;
        case '3':
          dateFilter = new Date(dateNow.setDate(dateNow.getDate() - 3));
          break;
        case '7':
          dateFilter = new Date(dateNow.setDate(dateNow.getDate() - 7));
          break;
        case '30':
          dateFilter = new Date(dateNow.setDate(dateNow.getDate() - 30));
          break;
        default:
          break;
      }
      if (dateFilter) filter.createdAt = { $gte: dateFilter };
    }

    if (employmentType) filter.jobTypes = { $in: employmentType.split(',') };
    if (experience) filter.experience = { $in: experience.split(',') };

    // Additional hybrid trigger (keeps same non-blocking behaviour)
    if (query) {
      const matchingJobCount = await Job.countDocuments(filter);
      if (matchingJobCount < 10) await fetchAndSaveJobsService(query);
      else fetchAndSaveJobsService(query);
    }

    const skip = (safeParseInt(page, 1) - 1) * safeParseInt(limit, 10);
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeParseInt(limit, 10)),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        total,
        page: safeParseInt(page, 1),
        limit: safeParseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getAllJobs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: config.nodeEnv === 'local' ? error.message : undefined,
    });
  }
};

export const getMannualyJobs = async (req, res) => {
  try {
    const cacheKey = 'jobs:manual';

    // 1. Fetch jobs (cached, static data only)
    const jobs = await redisClient.withCache(cacheKey, 3600, async () =>
      Job.find({ origin: 'HOSTED' }).sort({ createdAt: -1 }).lean(),
    );

    if (!jobs.length) {
      return res.status(200).json({ success: true, jobs: [] });
    }

    // 2. Extract job IDs
    const jobIds = jobs.map((job) => job._id);

    // 3. Aggregate interactions by job + type
    const interactionCounts = await JobInteraction.aggregate([
      {
        $match: {
          job: { $in: jobIds },
          type: { $in: ['IMPRESSION', 'VIEW', 'APPLIED'] },
        },
      },
      {
        $group: {
          _id: {
            job: '$job',
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Build lookup map
    const interactionMap = {};

    for (const row of interactionCounts) {
      const jobId = String(row._id.job);
      const type = row._id.type;

      if (!interactionMap[jobId]) {
        interactionMap[jobId] = {
          impressions: 0,
          views: 0,
          applied: 0,
        };
      }

      if (type === 'IMPRESSION') interactionMap[jobId].impressions = row.count;
      if (type === 'VIEW') interactionMap[jobId].views = row.count;
      if (type === 'APPLIED') interactionMap[jobId].applied = row.count;
    }

    // 5. Attach analytics to jobs
    const jobsWithAnalytics = jobs.map((job) => {
      const stats = interactionMap[String(job._id)] || {
        impressions: 0,
        views: 0,
        applied: 0,
      };

      return {
        ...job,
        impressions: stats.impressions,
        jobViews: stats.views,
        appliedCount: stats.applied,
      };
    });

    // 6. Respond
    res.status(200).json({
      success: true,
      jobs: jobsWithAnalytics,
    });
  } catch (error) {
    console.error('Error fetching manual jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const generateJobDescription = async (req, res) => {
  const { jd } = req.body;
  const { organization: organizationId } = req.user;

  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: 'Organization not found on user',
    });
  }

  try {
    const org = await Organization.findById(organizationId).select(
      'profile contactInfo',
    );

    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found in database',
      });
    }

    const generatedJD = await generateJobDescriptionService(jd, org);

    return res.status(200).json({
      success: true,
      jobDescription: generatedJD,
    });
  } catch (error) {
    console.error('Error generating job description:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getHostedJobsByAdmin = async (req, res) => {
  const { organization } = req.user;
  const { status } = req.query;

  if (!organization) {
    return res.status(400).json({
      success: false,
      message: 'Organization not found on user',
    });
  }

  let query = {
    organizationId: organization,
    origin: 'HOSTED',
  };

  if (status === 'total') {
    delete query.status;
  } else if (status === 'active') {
    query.status = 'ACTIVE';
  } else if (status === 'inactive') {
    query.status = 'INACTIVE';
  }

  try {
    const organizationId = new mongoose.Types.ObjectId(organization);

    // pagination params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    // 1. total count
    const totalCount = await Job.countDocuments(query);

    if (totalCount === 0) {
      return res.status(200).json({
        data: [],
        meta: {
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
          limit,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // 2. fetch paginated jobs
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const jobIds = jobs.map((j) => j._id);

    // 3. aggregate interactions
    const interactionCounts = await JobInteraction.aggregate([
      {
        $match: {
          job: { $in: jobIds },
          type: { $in: ['IMPRESSION', 'VIEW', 'APPLIED'] },
        },
      },
      {
        $group: {
          _id: { job: '$job', type: '$type' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. build interaction map
    const interactionMap = {};

    for (const row of interactionCounts) {
      const jobId = row._id.job.toString();

      if (!interactionMap[jobId]) {
        interactionMap[jobId] = {
          impressions: 0,
          views: 0,
          applied: 0,
        };
      }

      if (row._id.type === 'IMPRESSION') {
        interactionMap[jobId].impressions = row.count;
      } else if (row._id.type === 'VIEW') {
        interactionMap[jobId].views = row.count;
      } else if (row._id.type === 'APPLIED') {
        interactionMap[jobId].applied = row.count;
      }
    }

    // 5. merge analytics + normalize id
    const data = jobs.map((job) => {
      const idStr = job._id.toString();
      const stats = interactionMap[idStr];

      return {
        id: idStr,
        ...job,
        _id: undefined, // optional: remove Mongo _id
        impressions: stats?.impressions ?? 0,
        jobViews: stats?.views ?? 0,
        appliedCount: stats?.applied ?? 0,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      data,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('Error in getHostedJobsByAdmin:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const candidatesOrganization = async (req, res) => {
  try {
    const { organization } = req.user;
    const { jobId } = req.params;

    if (!organization) {
      return res.status(400).json({
        success: false,
        message: 'Organization not found on user',
      });
    }

    const candidates = await Organization.find({
      organizationId: organization,
      jobId,
    }).select('_id');

    return res.status(200).json({
      success: true,
      candidates,
    });
  } catch (error) {
    console.error('Error in candidatesOrganization:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const deleteJobByAdmin = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { organization } = req.user;

    const deletedJob = await Job.findOneAndDelete({
      _id: jobId,
      organizationId: organization,
    });

    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job',
      error: error.message,
    });
  }
};

export const bulkDeleteJobsByAdmin = async (req, res) => {
  try {
    const { ids } = req.body;
    const { organization } = req.user;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No job IDs provided' });
    }

    await Job.deleteMany({ _id: { $in: ids }, organizationId: organization });

    res.status(200).json({
      success: true,
      message: `${ids.length} jobs deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobCandidateStats = async (req, res) => {
  const { jobId } = req.params;
  const { organization } = req.user;

  try {
    const job = await Job.findOne({
      slug: jobId,
      organizationId: organization,
    }).select('_id');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Efficiently count all statuses in one aggregation call
    const stats = await AppliedJob.aggregate([
      { $match: { job: job._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          shortlisted: {
            $sum: { $cond: [{ $eq: ['$status', 'SHORTLISTED'] }, 1, 0] },
          },
          selected: {
            $sum: {
              $cond: [{ $in: ['$status', ['SELECTED', 'HIRED']] }, 1, 0],
            },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] },
          },
        },
      },
    ]);

    const defaultStats = { total: 0, shortlisted: 0, selected: 0, rejected: 0 };

    return res.status(200).json(stats[0] || defaultStats);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getHostedJobCandidates = async (req, res) => {
  const { jobId } = req.params;
  const { organization } = req.user;
  const { page = 1, limit = 10, status } = req.query;

  try {
    const job = await Job.findOne({
      slug: jobId,
      organizationId: organization,
    }).select('_id');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Build filter
    const query = { job: job._id };
    if (status) query.status = status;

    const skip = (Math.max(page, 1) - 1) * limit;
    const totalCount = await AppliedJob.countDocuments(query);

    const applications = await AppliedJob.find(query)
      .populate(
        'student',
        'fullName email profilePicture university graduationYear phone',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      data: applications,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateJobDescription = async (req, res) => {
  const { jobId } = req.params;
  const {
    description,
    jobTypes,
    title,
    salary,
    remote,
    location,
    resumeRequired,
    responsibilities,
    qualifications,
    screeningQuestions,
  } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // 1. Update MongoDB
    job.description = description || job.description;
    job.jobTypes = jobTypes || job.jobTypes;
    job.title = title || job.title;
    job.salary = salary || job.salary;
    job.remote = remote ?? job.remote;
    job.location = location || job.location;
    job.resumeRequired = resumeRequired ?? job.resumeRequired;
    job.responsibilities = responsibilities || job.responsibilities;
    job.qualifications = qualifications || job.qualifications;
    job.screeningQuestions = screeningQuestions || job.screeningQuestions;

    await job.save();

    // 2. 🔥 Invalidate ALL job-related caches (single + lists)
    await redisClient.invalidateJobCache(job._id.toString());
    await redisClient.invalidateAllJobsCache();

    return res.status(200).json({
      success: true,
      message: 'Job description updated successfully',
      job,
    });
  } catch (error) {
    console.error('Error updating job description:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const jobStats = async (req, res) => {
  const { organization } = req.user; // From your auth middleware
  const { jobId } = req.params;

  try {
    // 1. Security Check: Ensure this job actually belongs to the user's organization
    const jobExists = await Job.findOne({
      _id: jobId,
      organizationId: organization,
    });

    if (!jobExists) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or job not found',
      });
    }

    // 2. Aggregate interactions for this specific job
    const stats = await JobInteraction.aggregate([
      {
        $match: {
          job: jobExists._id, // Filter by this specific job ID
        },
      },
      {
        $group: {
          totalViews: {
            $sum: { $cond: [{ $eq: ['$type', 'VIEW'] }, 1, 0] },
          },
          totalApplications: {
            $sum: { $cond: [{ $eq: ['$type', 'APPLIED'] }, 1, 0] },
          },
          totalImpressions: {
            $sum: { $cond: [{ $eq: ['$type', 'IMPRESSION'] }, 1, 0] },
          },
          totalSaves: {
            $sum: { $cond: [{ $eq: ['$type', 'SAVED'] }, 1, 0] },
          },
        },
      },
    ]);

    // 3. Prepare the response
    const result = stats[0] || {
      totalViews: 0,
      totalApplications: 0,
      totalImpressions: 0,
      totalSaves: 0,
    };

    res.status(200).json({
      success: true,
      jobTitle: jobExists.title, // Helpful for the frontend
      stats: {
        views: result.totalViews,
        applications: result.totalApplications,
        impressions: result.totalImpressions,
        saves: result.totalSaves,
      },
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCandidatesByOrganization = async (req, res) => {
  try {
    const { organization } = req.user;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const result = await AppliedJob.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      { $unwind: '$jobDetails' },
      {
        $match: {
          'jobDetails.organizationId': new mongoose.Types.ObjectId(
            organization,
          ),
        },
      },

      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentDetails',
        },
      },
      { $unwind: '$studentDetails' },

      { $sort: { applicationDate: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                fullName: '$studentDetails.fullName',
                email: '$studentDetails.email',
                status: 1,
                applicationDate: 1,
                cvLink: 1,
                screeningAnswers: 1,
                jobTitle: '$jobDetails.title',
                candidateName: '$studentDetails.name',
                candidateEmail: '$studentDetails.email',
                studentId: '$studentDetails._id',
                appliedAt: '$createdAt',
                jobTitle: '$jobDetails.title',
                jobId: '$jobDetails._id',
                jobSlug: '$jobDetails.slug',
                jobType: '$jobDetails.type',
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);

    const data = result[0]?.data || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrganizationCandidateStats = async (req, res) => {
  try {
    const { organization } = req.user;

    const stats = await AppliedJob.aggregate([
      // 1. Join with Jobs to filter by Organization
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobInfo',
        },
      },
      { $unwind: '$jobInfo' },
      {
        $match: {
          'jobInfo.organizationId': new mongoose.Types.ObjectId(organization),
        },
      },

      // 2. Group by status to get counts
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Format the data into a clean object for the frontend
    const formattedStats = {
      TOTAL: 0,
      APPLIED: 0,
      INTERVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      CANCELED: 0,
    };

    stats.forEach((item) => {
      formattedStats[item._id] = item.count;
      formattedStats.TOTAL += item.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrganizationJobStats = async (req, res) => {
  try {
    const { organization } = req.user;
    const orgId = new mongoose.Types.ObjectId(organization);

    /* ============================
       JOB STATS
    ============================ */
    const jobStats = await Job.aggregate([
      { $match: { organizationId: orgId } },
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 },
        },
      },
    ]);

    const jobs = {
      TOTAL: 0,
      ACTIVE: 0,
      INACTIVE: 0,
    };

    jobStats.forEach((j) => {
      if (j._id === true) jobs.ACTIVE = j.count;
      if (j._id === false) jobs.INACTIVE = j.count;
      jobs.TOTAL += j.count;
    });

    /* ============================
       APPLIED JOB STATS
    ============================ */
    const appliedStats = await AppliedJob.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
      { $match: { 'job.organizationId': orgId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const applications = {
      TOTAL: 0,
      APPLIED: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      INTERVIEW: 0,
      CANCELED: 0,
    };

    appliedStats.forEach((a) => {
      applications[a._id] = a.count;
      applications.TOTAL += a.count;
    });

    /* ============================
       INTERACTION STATS
    ============================ */
    const interactionStats = await JobInteraction.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
      { $match: { 'job.organizationId': orgId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const interactions = {
      VIEW: 0,
      SAVED: 0,
      VISIT: 0,
      APPLIED: 0,
      IMPRESSION: 0,
    };

    interactionStats.forEach((i) => {
      interactions[i._id] = i.count;
    });

    /* ============================
       FINAL RESPONSE
    ============================ */
    res.status(200).json({
      success: true,
      data: {
        jobs,
        applications,
        interactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRapidJobs = async (req, res) => {
  try {
    const cacheKey = 'jobs:rapid';
    const jobs = await redisClient.withCache(cacheKey, 3600, async () =>
      Job.find({ origin: 'EXTERNAL' }).sort({ createdAt: -1 }),
    );
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching rapid jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getJobFromJobId = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findOne({ jobId });
    if (!job)
      return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSingleJobDetail = async (req, res) => {
  const { jobId } = req.params;

  try {
    const cacheKey = `job:${jobId}`;

    const job = await redisClient.withCache(cacheKey, 3600, async () => {
      let foundJob = null;

      if (mongoose.isValidObjectId(jobId)) {
        foundJob = await Job.findById(jobId).select('-queries').lean();
      }

      if (!foundJob) {
        foundJob = await Job.findOne({ slug: jobId }).select('-queries').lean();
      }

      return foundJob;
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const jobObjectId = new mongoose.Types.ObjectId(job._id);

    const analytics = await JobInteraction.aggregate([
      {
        $match: {
          job: jobObjectId,
          type: { $in: ['IMPRESSION', 'VIEW', 'APPLIED'] },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    let impressions = 0;
    let jobViews = 0;
    let appliedCount = 0;

    for (const row of analytics) {
      if (row._id === 'IMPRESSION') impressions = row.count;
      if (row._id === 'VIEW') jobViews = row.count;
      if (row._id === 'APPLIED') appliedCount = row.count;
    }

    res.status(200).json({
      success: true,
      job: {
        ...job,
        impressions,
        jobViews,
        appliedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getJobDetailBySlug = async (req, res) => {
  const { slug } = req.query || {};
  try {
    const singleJob = await Job.findOne({ slug });
    if (!singleJob) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json({ singleJob });
  } catch (error) {
    console.error('Error fetching job by slug:', error);
    res.status(500).json({
      message: 'Server Error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

export const getAllEmploymentTypes = async (req, res) => {
  try {
    const cacheKey = 'jobs:employmentTypes';
    const jobTypes = await redisClient.withCache(cacheKey, 86400, async () =>
      Job.distinct('jobTypes'),
    );
    res.status(200).json({ success: true, jobTypes: jobTypes || [] });
  } catch (error) {
    console.error('Error fetching employment types:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllExperiences = async (req, res) => {
  try {
    const cacheKey = 'jobs:experiences';
    let experiences = await redisClient.withCache(cacheKey, 86400, async () => {
      const exp = await Job.distinct('experience');
      return exp.map((e) => (e === null ? 0 : e));
    });

    if (!experiences || experiences.length === 0) experiences = [0];
    experiences.sort((a, b) => a - b);
    res.status(200).json({ success: true, experiences });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleJobStatus = async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.isActive = !job.isActive;
    await job.save();

    await Promise.all([
      redisClient.invalidateJobCache(jobId).catch(() => {}),
      redisClient.invalidateAllJobsCache().catch(() => {}),
    ]);

    res.status(200).json({ message: 'Job status updated successfully' });
  } catch (error) {
    console.error('Error toggling job status:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

export const jobApplications = async (req, res) => {
  const { jobId } = req.params;
  try {
    const cacheKey = `job:${jobId}:applications`;
    const job = await redisClient.withCache(cacheKey, 600, async () =>
      Job.findById(jobId).populate('applications'),
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json({ job });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

export const getSingleJobApplication = async (req, res) => {
  const { jobId } = req.params;
  try {
    const cacheKey = `job:${jobId}:application`;
    const job = await redisClient.withCache(cacheKey, 600, async () =>
      Job.findById(jobId),
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json({ job });
  } catch (error) {
    console.error('Error fetching job application:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

export const getAllJobsForStudent = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await Student.findById(studentId)
      .select('viewedJobs.job')
      .lean();
    const viewedJobIds = new Set(
      (student?.viewedJobs || []).map((view) => view.job.toString()),
    );
    const jobs = await Job.find({}).lean();
    const jobsWithViewedStatus = jobs.map((job) => ({
      ...job,
      viewed: viewedJobIds.has(job._id.toString()),
    }));

    res.status(200).json({
      success: true,
      count: jobsWithViewedStatus.length,
      data: jobsWithViewedStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const jobViewsCount = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.views = (job.views || 0) + 1;
    await job.save();

    // Invalidate cache for this job (best-effort)
    await redisClient.invalidateJobCache(jobId).catch(() => {});

    res.status(200).json({ message: 'Job views count updated successfully' });
  } catch (error) {
    console.error('Error updating job views count:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

export const getAllJobsQueries = async (req, res) => {
  try {
    const queries = await Job.distinct('queries');

    res.status(200).json({ success: true, queries });
  } catch (error) {
    console.error('Error fetching job queries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

export const trackJobClick = async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Job ID is required' });
    }

    await JobInteraction.create({
      jobId: id,
      userId: req.user?._id || null,
      query: query?.trim() || null,
      action: 'click',
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('trackJobClick error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const trackJobImpressions = async (req, res) => {
  try {
    const { jobIds, query } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'jobIds must be a non-empty array',
      });
    }

    const userId = req.user?._id || null;

    // Deduplicate jobIds
    const uniqueJobIds = [...new Set(jobIds)];

    const interactions = uniqueJobIds.map((jobId) => ({
      jobId,
      userId,
      query: query?.trim() || null,
      action: 'impression',
    }));

    await JobInteraction.insertMany(interactions, { ordered: false });

    return res.json({ success: true });
  } catch (err) {
    console.error('trackJobImpressions error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getJobDescByJobId = async (req, res) => {
  const { jobId } = req.params;
  try {
    const singleJob = await Job.findById(jobId).select(
      'description title jobType',
    );
    if (!singleJob) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json({ singleJob });
  } catch (error) {
    console.error('Error fetching job by slug:', error);
    res.status(500).json({
      message: 'Server Error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

export const getJobStats = async (req, res) => {
  try {
    const stats = await JobInteraction.aggregate([
      {
        $match: {
          type: 'VIEW',
        },
      },
      {
        $group: {
          _id: '$job',
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({
      message: 'Server Error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

export async function htmlToPdfBuffer(html, isShowImage = true) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.emulateMediaType('screen');

    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 60000,
    });

    await page.addStyleTag({
      content: `
        * { box-sizing: border-box; }
        html, body {
          height: auto !important;
          overflow: visible !important;
        }
        ${
          isShowImage
            ? ''
            : '.resume-container .profile-image { display: none; }'
        }
      `,
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
}

export async function uploadPdfToCloudinary(buffer, filename) {
  return uploadBufferToCloudinary(buffer, {
    folder: 'resumes',
    resource_type: 'raw',
    public_id: filename,
    format: 'pdf',
  });
}

export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user._id;

    let rawAnswers = req.body.answers;
    let answers = {};

    if (typeof rawAnswers === 'string') {
      try {
        const parsed = JSON.parse(rawAnswers);

        answers = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch (e) {
        answers = {};
      }
    }

    const { applicationMethod = 'MANUAL', resumeId, coverLetterId } = req.body;

    // 1. Basic Validations
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student found' });

    // 2. Handle Screening Questions
    for (const q of job.screeningQuestions) {
      const questionKey = q._id.toString();
      const value = answers[questionKey]; // This now correctly looks up the ID in the object
      if (q.required && !value) {
        return res
          .status(400)
          .json({ message: `Missing answer: ${q.question}` });
      }
    }

    const screeningAnswers = job.screeningQuestions.map((q) => ({
      questionId: q._id,
      question: q.question,
      answer: answers[q._id.toString()] ?? null,
    }));

    // --- 3. HANDLE CV (UPLOAD OR DATABASE) ---
    let cvPdfUrl = null;
    const uploadedCv = req.files?.cv?.[0];

    if (uploadedCv) {
      // User uploaded a new file
      const fileBuffer = fs.readFileSync(uploadedCv.path);
      const result = await uploadPdfToCloudinary(
        fileBuffer,
        `resume_${studentId}_${Date.now()}`,
      );
      cvPdfUrl = result.secure_url;
    } else if (resumeId) {
      // User picked a saved HTML CV
      const studentCV = await StudentHtmlCV.findOne({
        _id: resumeId,
        student: studentId,
      });
      if (!studentCV)
        return res.status(404).json({ message: 'Resume not found' });

      const htmlCV = wrapCVHtml(
        studentCV.html,
        studentCV.title,
        studentCV.template,
      );
      const pdfBufferCV = await htmlToPdfBuffer(htmlCV);
      const result = await uploadPdfToCloudinary(
        pdfBufferCV,
        `resume_${studentId}_${jobId}`,
      );
      cvPdfUrl = result.secure_url;
    } else {
      return res
        .status(400)
        .json({ message: 'Please upload a CV or select a saved one' });
    }

    // --- 4. HANDLE COVER LETTER (UPLOAD OR DATABASE) ---
    let letterPdfUrl = null;
    const uploadedLetter = req.files?.coverLetter?.[0];

    if (uploadedLetter) {
      const fileBuffer = fs.readFileSync(uploadedLetter.path);
      const result = await uploadPdfToCloudinary(
        fileBuffer,
        `letter_${studentId}_${Date.now()}`,
      );
      letterPdfUrl = result.secure_url;
    } else if (coverLetterId) {
      const studentLetter = await StudentCoverLetter.findOne({
        _id: coverLetterId,
        student: studentId,
      });
      if (studentLetter) {
        const pdfBufferLetter = await htmlToPdfBuffer(
          studentLetter.coverLetter,
        );
        const result = await uploadPdfToCloudinary(
          pdfBufferLetter,
          `letter_${studentId}_${jobId}`,
        );
        letterPdfUrl = result.secure_url;
      }
    }

    // 5. Create Application
    const application = await AppliedJob.create({
      student: studentId,
      job: jobId,
      applicationMethod,
      cvLink: cvPdfUrl,
      coverLetterLink: letterPdfUrl,
      screeningAnswers,
    });

    // 6. Send Confirmation Email
    await sendTemplatedEmail({
      to: student.email,
      templateName: 'apply',
      templateVars: {
        name: student.fullName,
        dashboardUrl: process.env.DASHBOARD_URL,
        brandName: 'ZobsAI',
      },
      subjectOverride: 'Application Submitted Successfully | ZobsAI',
    });

    return res.status(201).json({
      message: 'Job applied successfully',
      applicationId: application._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: 'You have already applied for this job' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Failed to apply for job' });
  }
};
