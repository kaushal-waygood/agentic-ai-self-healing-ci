import { v4 as uuidv4 } from 'uuid';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
import redisClient from '../config/redis.js';
import { config } from '../config/config.js';
import { fetchAndSaveJobsService } from '../utils/fetchAndSaveJobsService.js';
import {
  escapeRegex,
  normalizeEmploymentTypeForDbFilter,
  normalizeEmploymentTypeForApi,
  sortJobsByPostedDateDesc,
  transformRapidApiJob,
  fetchExternalJobs,
  safeParseInt,
  isObjectId,
  makeSearchCacheKey,
} from '../utils/jobHelpers.js';

// --- Constants ---
const SEARCH_TTL = 120; // seconds
const LOCK_TTL = 10; // seconds for in-flight refresh lock

const ALLOWED_JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'];
const ALLOWED_SALARY_PERIODS = ['HOUR', 'DAY', 'MONTH', 'YEAR'];

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

// -------Controllers-------

export const searchJobs = async (req, res) => {
  const {
    q,
    page = 1,
    limit = 10,
    country,
    state,
    employmentType,
    experience,
    datePosted,
  } = req.query || {};

  const pageNum = safeParseInt(page, 1);
  const limitNum = safeParseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const cacheKey = makeSearchCacheKey({
    q,
    pageNum,
    limitNum,
    country,
    state,
    city,
    employmentType,
    experience,
    datePosted,
  });

  try {
    // 1) Try cache
    try {
      const cachedRaw = await redisClient.get(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        return res.status(200).json({
          jobs: cached.jobs,
          pagination: {
            totalJobs: cached.totalJobs || 0,
            totalPages: Math.ceil((cached.totalJobs || 0) / limitNum),
            currentPage: pageNum,
            hasNextPage:
              pageNum < Math.ceil((cached.totalJobs || 0) / limitNum),
          },
          notification: cached.notification || null,
          fromCache: true,
        });
      }
    } catch (cacheReadErr) {
      console.warn(
        'searchJobs: cache read failed',
        cacheReadErr && cacheReadErr.message,
      );
    }

    // 2) Acquire short lock to avoid thundering herd
    const lockKey = `${cacheKey}:lock`;
    const lockAcquired = await redisClient.setNxWithTtl(lockKey, '1', LOCK_TTL);

    // 3) Build DB search criteria
    const searchCriteria = {};

    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      searchCriteria.$or = [
        { title: regex },
        { description: regex },
        { queries: regex },
      ];
    }

    if (country) searchCriteria.country = country;
    if (state) searchCriteria['location.state'] = state;
    if (city) searchCriteria['location.city'] = city;

    if (employmentType) {
      const normalized = normalizeEmploymentTypeForDbFilter(employmentType);
      if (normalized && normalized.length) {
        searchCriteria.jobTypes = { $in: normalized };
      }
    }

    if (experience) {
      searchCriteria.experience = {
        $in: experience.split(',').map((v) => v.trim()),
      };
    }

    // 4) Query DB
    let [totalJobs, jobs] = await Promise.all([
      Job.countDocuments(searchCriteria),
      Job.find(searchCriteria)
        .sort({ jobPostedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    let notification = null;

    // 5) If no DB jobs & q present on first page → fetch external
    if ((jobs.length === 0 || totalJobs === 0) && q && pageNum === 1) {
      let externalJobsRaw = [];
      try {
        const normalizedEmploymentType =
          normalizeEmploymentTypeForApi(employmentType);

        externalJobsRaw = await fetchExternalJobs(
          q,
          country,
          state,
          city,
          datePosted,
          normalizedEmploymentType,
          experience,
        );
      } catch (apiErr) {
        console.warn('fetchExternalJobs failed:', apiErr && apiErr.message);
      }

      if (externalJobsRaw && externalJobsRaw.length > 0) {
        const externalJobsFormatted = externalJobsRaw.map((apiJob) =>
          transformRapidApiJob(apiJob, q),
        );

        try {
          const bulkOps = externalJobsFormatted.map((job) => ({
            updateOne: {
              filter: { jobId: job.jobId },
              update: {
                $set: {
                  title: job.title,
                  description: job.description,
                  company: job.company,
                  country: job.country,
                  'location.city': job.location.city,
                  'location.state': job.location.state,
                  'location.lat': job.location.lat,
                  'location.lng': job.location.lng,
                  logo: job.logo,
                  applyMethod: job.applyMethod,
                  jobPosted: job.jobPosted,
                  jobPostedAt: job.jobPostedAt,
                  jobTypes: job.jobTypes,
                  isActive: job.isActive,
                  origin: job.origin,
                  qualifications: job.qualifications,
                  responsibilities: job.responsibilities,
                  slug: job.slug,
                  experience: job.experience,
                },
                $setOnInsert: { createdAt: new Date() },
                $addToSet: { queries: q },
              },
              upsert: true,
            },
          }));

          await Job.bulkWrite(bulkOps);

          // Invalidate relevant cache keys
          try {
            await redisClient.del([
              cacheKey,
              `jobs:search|q:${q}|p:1|l:${limitNum}|c:${country || ''}|s:${
                state || ''
              }|ci:${city || ''}|et:${employmentType || ''}|exp:${
                experience || ''
              }|dp:${datePosted || ''}`,
            ]);
          } catch (delErr) {
            console.warn(
              'searchJobs: cache invalidation failed after DB save',
              delErr && delErr.message,
            );
          }

          jobs = externalJobsFormatted;
          totalJobs = externalJobsFormatted.length;
        } catch (dbError) {
          console.error('Background DB save failed:', dbError);
          jobs = externalJobsFormatted;
          totalJobs = externalJobsFormatted.length;
        }
      } else {
        const locationString = [city, state, country]
          .filter(Boolean)
          .join(', ');
        notification = locationString
          ? `We couldn't find any jobs for "${q}" in ${locationString}. Try broadening your search.`
          : `We couldn't find any jobs matching your search for "${q}".`;
      }
    }

    // 6) Prepare final payload
    jobs = sortJobsByPostedDateDesc(jobs);

    const resultPayload = {
      jobs,
      totalJobs,
      notification,
    };

    // 7) Write to cache if we hold the lock
    try {
      if (lockAcquired) {
        await redisClient.set(
          cacheKey,
          JSON.stringify(resultPayload),
          SEARCH_TTL,
        );
      }
    } catch (cacheWriteErr) {
      console.warn(
        'searchJobs: cache write failed',
        cacheWriteErr && cacheWriteErr.message,
      );
    } finally {
      try {
        if (lockAcquired) await redisClient.del(lockKey);
      } catch {
        // ignore unlock errors
      }
    }

    // 8) Return the computed result
    const totalPages = Math.ceil((totalJobs || 0) / limitNum);
    return res.status(200).json({
      jobs,
      pagination: {
        totalJobs: totalJobs || 0,
        totalPages,
        currentPage: pageNum,
        hasNextPage: pageNum < totalPages,
      },
      notification,
      fromCache: false,
    });
  } catch (error) {
    console.error('Error in searchJobs controller:', error);
    return res
      .status(500)
      .json({ message: 'Server Error', error: error.message });
  }
};

export const postManualJob = async (req, res) => {
  const { _id: organizationId } = req.user || {};

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
      // NEW FLAG:
      isOnboarding,
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

    // --- Normalization ---
    const normalizedJobTypes = Array.isArray(jobTypes)
      ? jobTypes.filter((t) => ALLOWED_JOB_TYPES.includes(t))
      : [];

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

    let normalizedLocation = undefined;
    if (!remote && location && typeof location === 'object') {
      normalizedLocation = {
        city: location.city || '',
        state: location.state || '',
        postalCode: location.postalCode || '',
        lat:
          typeof location.lat === 'number'
            ? location.lat
            : location.lat
            ? Number(location.lat)
            : undefined,
        lng:
          typeof location.lng === 'number'
            ? location.lng
            : location.lng
            ? Number(location.lng)
            : undefined,
      };
    }

    const now = new Date();
    const humanPosted = 'Just now';

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

    // --- LOGIC: Active Status Enforcement ---
    // If coming from Onboarding, force isActive to FALSE.
    // Otherwise use user input (defaulting to true if undefined)
    let finalIsActive = isActive;

    if (isOnboarding === true) {
      finalIsActive = false;
    }

    // Build final document object
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
    };

    const newJob = await Job.create(jobData);

    // Cache invalidation
    if (global.redisClient) {
      // Check if redisClient is available
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
    const jobs = await redisClient.withCache(cacheKey, 3600, async () =>
      Job.find({ origin: 'HOSTED' }).sort({ createdAt: -1 }),
    );
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching manual jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      // Support both Mongo _id and our jobId field
      if (isObjectId(jobId)) return Job.findById(jobId).select('-queries');
      return Job.findOne({ jobId }).select('-queries');
    });

    if (!job)
      return res.status(404).json({ success: false, message: 'Job not found' });

    res.status(200).json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: config.nodeEnv === 'development' ? error.message : undefined,
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
