/** @format */

import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import mongoose from 'mongoose';

import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
import redisClient from '../config/redis.js';
import { config } from '../config/config.js';
import { genAI } from '../config/gemini.js';
import { fetchAndSaveJobsService } from '../utils/fetchAndSaveJobsService.js';
import {
  extractExperience,
  extractQualificationsFromDescription,
  extractResponsibilitiesFromDescription,
} from '../utils/exprienceExtractor.js';

// --- Constants ---
const STALE_THRESHOLD_HOURS = 6;
const SEARCH_TTL = 120; // seconds - tune as needed

// --- Small helpers ---
const safeParseInt = (v, fallback = 0) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

const isObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id);
  } catch (e) {
    return false;
  }
};

const escapeRegex = (text) => {
  if (!text) return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

const makeSearchCacheKey = (params) => {
  const {
    q,
    pageNum,
    limitNum,
    country,
    state,
    city,
    employmentType,
    experience,
    datePosted,
  } = params;

  return [
    'jobs:search',
    `q:${q || ''}`,
    `p:${pageNum}`,
    `l:${limitNum}`,
    `c:${country || ''}`,
    `s:${state || ''}`,
    `ci:${city || ''}`,
    `et:${employmentType || ''}`,
    `exp:${experience || ''}`,
    `dp:${datePosted || ''}`,
  ].join('|');
};

// AI formatting wrapper with safe fallback
const formatJobDescriptionWithAI = async (rawDescription) => {
  if (!rawDescription || rawDescription.trim() === '') return rawDescription;

  const prompt = `
You are an expert HR content formatter. Your task is to take the following raw job description text and reformat it into clean, well-structured HTML.

Follow these rules strictly:
1. Use <h2> headings for major sections like "Responsibilities", "Qualifications", "Skills", or "Requirements".
1.5 Use valid spacing like <br> padding or margin and use your creativity.
2. Use <ul> and <li> tags for bulleted lists.
3. Use <strong> tags to make key technologies, skills, and important phrases bold.
4. Do NOT add any information that is not present in the original text.
5. Do NOT write any introductory or concluding paragraphs. Only output the formatted HTML.

Here is the raw text:
---
${rawDescription}
---
`;

  try {
    const formatted = await genAI(prompt);
    return formatted || rawDescription;
  } catch (err) {
    console.error(
      'AI formatting failed, returning raw description:',
      err?.message || err,
    );
    return rawDescription;
  }
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace all non-alphanumeric
    .replace(/-+/g, '-') // collapse ---
    .replace(/^-+|-+$/g, ''); // trim hyphens
};

const transformRapidApiJob = (apiJob, searchQuery) => {
  const title = apiJob.job_title || 'job';

  const slugBase = slugify(title);
  const slugId = slugify(apiJob.job_id?.toString()?.slice(0, 6) || 'ext');

  return {
    jobId: apiJob.job_id,
    origin: 'EXTERNAL',
    title: title,
    description: apiJob.job_description,

    qualifications: apiJob.job_highlights?.Qualifications || [],
    responsibilities: apiJob.job_highlights?.Responsibilities || [],

    company: apiJob.employer_name,
    country: apiJob.job_country,
    logo: apiJob.employer_logo,

    location: {
      city: apiJob.job_city,
      state: apiJob.job_state,
      lat: apiJob.job_latitude,
      lng: apiJob.job_longitude,
    },

    slug: `${slugBase}-${slugId}`,

    applyMethod: { method: 'URL', url: apiJob.job_apply_link },
    isActive: true,
    jobPosted: apiJob.job_posted_at,
    jobTypes: apiJob.job_employment_types || [],
    experience: [],
    queries: searchQuery ? [searchQuery] : [],
  };
};

const fetchExternalJobs = async (
  apiQuery,
  country,
  state,
  city,
  datePosted,
  employmentType,
  experience,
) => {
  try {
    let query = apiQuery;
    if (city && state) query = `${apiQuery} in ${city}, ${state}`;
    else if (state) query = `${apiQuery} in ${state}`;
    else if (city) query = `${apiQuery} in ${city}`;

    const params = {
      query,
      page: '1',
      num_pages: '1',
    };

    if (country) params.country = country;
    if (state) params.state = state;
    if (city) params.city = city;
    if (datePosted) params.date_posted = datePosted;
    if (employmentType) params.employment_type = employmentType;
    if (experience) params.job_requirements = experience;

    const response = await axios.get(config.rapidJobApi, {
      params,
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
      timeout: 10000,
    });

    console.log('RapidAPI Response Status:', response.status);
    return response.data?.data || [];
  } catch (apiError) {
    console.error(
      `RapidAPI fetch failed for query "${apiQuery}":`,
      apiError.response?.data || apiError.message,
    );
    return [];
  }
};

// --- Controllers ---
export const postManualJob = async (req, res) => {
  const { _id } = req.user || {};
  try {
    const payload = req.body || {};

    const jobData = {
      jobId: uuidv4(),
      origin: 'HOSTED',
      organizationId: _id,
      ...payload,
    };

    const newJob = await Job.create(jobData);

    await Promise.all([
      redisClient.invalidateAllJobsCache().catch(() => {}),
      redisClient.del('jobs:employmentTypes').catch(() => {}),
    ]);

    res
      .status(201)
      .json({ success: true, message: 'Job posted successfully', job: newJob });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const fetchAndSaveRapidJobsUseLater = async (req, res) => {
  const { query } = req.body || {};
  if (!query)
    return res
      .status(400)
      .json({ success: false, message: 'Search query is required' });

  try {
    const params = { query: `${query}`, page: 1, num_pages: 5 };

    const response = await axios.get(config.rapidJobApi, {
      params,
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    const jobs = response.data?.data || [];
    let savedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const job of jobs) {
      try {
        const existingJob = await Job.findOne({ jobId: job.job_id });

        if (existingJob) {
          if (!existingJob.queries?.includes(query)) {
            await Job.updateOne(
              { jobId: job.job_id },
              { $addToSet: { queries: query } },
            );
            updatedCount++;
          } else {
            skippedCount++;
          }
          continue;
        }

        const experience = extractExperience(job.job_description);

        const jobData = {
          jobId: job.job_id,
          origin: 'EXTERNAL',
          publisher: job.job_publisher,
          title: job.job_title,
          description: job.job_description,
          shortDescription:
            (job.job_description || '').substring(0, 200) + '...',
          isRemote: job.job_is_remote || false,
          company: job.employer_name,
          companyType: job.employer_company_type,
          logo: job.employer_logo,
          companyWebsite: job.employer_website,
          companyLinkedIn: job.employer_linkedin,
          qualifications: job.job_highlights?.Qualifications || [],
          responsibilities: job.job_highlights?.Responsibilities || [],
          jobRequiredExperience: {
            noExperienceRequired:
              job.job_required_experience?.no_experience_required || false,
            requiredExperienceInMonths:
              job.job_required_experience?.required_experience_in_months ||
              null,
            experienceMentioned:
              job.job_required_experience?.experience_mentioned || false,
            experiencePreferred:
              job.job_required_experience?.experience_preferred || false,
            yearsOfExperience: experience,
          },
          employmentType: job.job_employment_type || 'FULLTIME',
          employmentTypeText: job.job_employment_type_text || 'Full-time',
          salary: {
            min: job.job_min_salary || null,
            max: job.job_max_salary || null,
            currency: job.job_salary_currency || 'USD',
            period: job.job_salary_period || 'YEAR',
            isEstimated: !job.job_min_salary,
          },
          salaryDisclosed: !!job.job_min_salary,
          benefits: job.job_benefits ? job.job_benefits.join(', ') : null,
          benefitsList: job.job_benefits || [],
          applyMethod: {
            method: 'URL',
            url: job.job_apply_link,
            isDirect: job.job_apply_is_direct || false,
          },
          applyOptions:
            job.apply_options?.map((option) => ({
              publisher: option.publisher,
              applyLink: option.apply_link,
              isDirect: option.is_direct,
            })) || [],
          applicationQualityScore: job.job_apply_quality_score || null,
          location: {
            city: job.job_city,
            state: job.job_state,
            country: job.job_country || 'US',
            postalCode: job.job_postal_code || '',
            address: job.job_location,
            lat: job.job_latitude,
            lng: job.job_longitude,
          },
          locationText: job.job_location,
          postedAt: job.job_posted_at_datetime_utc
            ? new Date(job.job_posted_at_datetime_utc)
            : new Date(),
          postedAtTimestamp:
            job.job_posted_at_timestamp || Math.floor(Date.now() / 1000),
          postedHumanReadable: job.job_posted_human_readable || 'Just now',
          expiresAt: job.job_offer_expiration_datetime_utc
            ? new Date(job.job_offer_expiration_datetime_utc)
            : null,
          expiresAtTimestamp: job.job_offer_expiration_timestamp || null,
          industry: job.job_industry || null,
          occupationalCategory: job.job_occupational_categories?.[0] || null,
          onetSoc: job.job_onet_soc || null,
          onetJobZone: job.job_onet_job_zone || null,
          naicsCode: job.job_naics_code || null,
          naicsName: job.job_naics_name || null,
          tags: job.job_benefits || [],
          queries: [query],
          taxonomyAttributes: [],
        };

        await Job.create(jobData);
        savedCount++;
      } catch (error) {
        console.error(
          `Error processing job ${job.job_id}:`,
          error.message || error,
        );
        skippedCount++;
      }
    }

    if (savedCount > 0)
      await redisClient.invalidateAllJobsCache().catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Jobs processed successfully',
      stats: {
        totalReceived: jobs.length,
        saved: savedCount,
        updated: updatedCount,
        skipped: skippedCount,
      },
    });
  } catch (err) {
    console.error('Error in fetchAndSaveRapidJobs:', err.message || err);
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.message || 'Failed to fetch and save jobs';
    res.status(status).json({
      success: false,
      message,
      error: config.nodeEnv === 'local' ? err.message : undefined,
    });
  }
};

export const fetchAndSaveRapidJobs = async (req, res) => {
  const { query } = req.body || {};
  if (!query)
    return res
      .status(400)
      .json({ success: false, message: 'Query is required' });

  try {
    const response = await axios.get(config.rapidJobApi, {
      params: { query, page: 1, num_pages: 1 },
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    const jobs = response.data?.data || [];
    let savedCount = 0;

    for (const job of jobs) {
      const existing = await Job.findOne({ jobId: job.job_id });
      const experience = extractExperience(job.job_description);
      const qualifications = extractQualificationsFromDescription(
        job.job_description,
      );
      const responsibilities = extractResponsibilitiesFromDescription(
        job.job_description,
      );

      if (!existing) {
        const formattedDescription = await formatJobDescriptionWithAI(
          job.job_description,
        );
        const newJob = new Job({
          jobId: job.job_id,
          origin: 'EXTERNAL',
          logo: job.employer_logo,
          experience,
          qualification: qualifications,
          title: job.job_title,
          description: formattedDescription,
          responsibilities,
          qualifications,
          jobTypes: job.job_employment_types,
          company: job.employer_name,
          applyMethod: { method: 'URL', url: job.job_apply_link },
          salary: {
            min: job.job_min_salary || 0,
            max: job.job_max_salary || 0,
            period: job.job_salary_period || 'YEAR',
          },
          location: {
            city: job.job_city,
            postalCode: job.job_postal_code || '',
            lat: job.job_latitude,
            lng: job.job_longitude,
          },
          jobAddress: job.job_location,
          country: job.job_country,
          tags: job.job_benefits || [],
          queries: [query],
        });

        await newJob.save();
        savedCount++;
      } else {
        await Job.updateOne(
          { jobId: job.job_id },
          { $addToSet: { queries: query } },
        );
      }
    }

    if (savedCount > 0)
      await redisClient.invalidateAllJobsCache().catch(() => {});

    res.status(200).json({
      success: true,
      message: `Jobs fetched and saved successfully`,
      savedCount,
      totalReceived: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error('Error fetching/saving RapidAPI jobs:', err.message || err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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

export const streamAllJobs = async (req, res) => {
  try {
    const { query, country, city, datePosted, employmentType, experience } =
      req.query || {};

    console.log('SSE connection established');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (query) {
      const jobCount = await Job.countDocuments({ queries: query });
      let shouldFetch = false;

      if (jobCount === 0) shouldFetch = true;
      else {
        const latestJob = await Job.findOne({ queries: query }).sort({
          createdAt: -1,
        });
        const thresholdDate = new Date();
        thresholdDate.setHours(
          thresholdDate.getHours() - STALE_THRESHOLD_HOURS,
        );

        if (latestJob && latestJob.createdAt < thresholdDate)
          shouldFetch = true;
        else
          console.log(
            `Fresh data for query "${query}" already exists. Skipping fetch.`,
          );
      }

      if (shouldFetch)
        fetchAndSaveJobsService(query).catch((err) =>
          console.error(`Background fetch for "${query}" failed:`, err),
        );
    }

    const filter = {};
    if (query)
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { queries: query },
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

    const cursor = Job.find(filter).sort({ createdAt: -1 }).cursor();

    for await (const job of cursor) {
      res.write(`event: new-job\ndata: ${JSON.stringify(job)}\n\n`);
    }

    res.write(
      'event: end-stream\ndata: {"message": "Initial stream complete"}\n\n',
    );

    req.on('close', () => {
      console.log('Client disconnected from stream.');
      cursor.close();
      res.end();
    });
  } catch (error) {
    console.error('Error in streamAllJobs controller:', error);
    res.write(
      `event: error\ndata: {"message": "An internal error occurred"}\n\n`,
    );
    res.end();
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const searchJobs = async (req, res) => {
  const {
    q,
    page = 1,
    limit = 10,
    country,
    state,
    city,
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
    const cachedResult = await redisClient.withCache(
      cacheKey,
      SEARCH_TTL,
      async () => {
        const searchCriteria = {};
        if (q)
          searchCriteria.$or = [
            { title: new RegExp(escapeRegex(q), 'i') },
            { description: new RegExp(escapeRegex(q), 'i') },
            { queries: new RegExp(escapeRegex(q), 'i') },
          ];
        if (country) searchCriteria.country = country;
        if (state) searchCriteria['location.state'] = state;
        if (city) searchCriteria['location.city'] = city;
        if (employmentType)
          searchCriteria.jobTypes = { $in: employmentType.split(',') };
        if (experience)
          searchCriteria.experience = { $in: experience.split(',') };

        let totalJobs = await Job.countDocuments(searchCriteria);
        let jobs = await Job.find(searchCriteria)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean();

        let notification = null;

        if ((jobs.length === 0 || totalJobs === 0) && q && pageNum === 1) {
          const externalJobsRaw = await fetchExternalJobs(
            q,
            country,
            state,
            city,
            datePosted,
            employmentType,
            experience,
          );
          if (externalJobsRaw.length > 0) {
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
              console.log('Successfully saved external jobs to database');
            } catch (dbError) {
              console.error('Background DB save failed:', dbError);
            }

            jobs = externalJobsFormatted;
            totalJobs = externalJobsFormatted.length;
          } else {
            console.log('No external jobs found either');
          }
        }

        if ((!jobs || jobs.length === 0) && q) {
          const locationString = [city, state, country]
            .filter(Boolean)
            .join(', ');
          notification = locationString
            ? `We couldn't find any jobs for "${q}" in ${locationString}. Try broadening your search.`
            : `We couldn't find any jobs matching your search for "${q}".`;
        }

        return { jobs, totalJobs, notification };
      },
    );

    const { jobs, totalJobs, notification } = cachedResult;
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
    });
  } catch (error) {
    console.error('Error in searchJobs controller:', error);
    return res
      .status(500)
      .json({ message: 'Server Error', error: error.message });
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getAllJobsForStudent = async (req, res, next) => {
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
    console.log(`Job ${jobId} views incremented to ${job.views}`);
    await job.save();

    // Invalidate cache for this job (best-effort)
    await redisClient.invalidateJobCache(jobId).catch(() => {});

    res.status(200).json({ message: 'Job views count updated successfully' });
  } catch (error) {
    console.error('Error updating job views count:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
