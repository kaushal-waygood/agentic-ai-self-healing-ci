/** @format */

import { v4 as uuidv4 } from 'uuid';
import { Job } from '../models/jobs.model.js';
import axios from 'axios';
import {
  extractExperience,
  extractQualifications,
  extractQualificationsFromDescription,
  extractResponsibilitiesFromDescription,
} from '../utils/exprienceExtractor.js';
import redisClient from '../config/redis.js';
import { config } from '../config/config.js';
import { genAI } from '../config/gemini.js';
import { fetchAndSaveJobsService } from '../utils/fetchAndSaveJobsService.js';
import { Student } from '../models/student.model.js';

export const postManualJob = async (req, res) => {
  const { _id } = req.user;
  try {
    const {
      title,
      description,
      company,
      applyMethod,
      jobTypes,
      contractLength,
      salary,
      expectedHours,
      workingHoursMin,
      workingHoursMax,
      resumeRequired,
      coverLetterRequired,
      phoneRequired,
      language,
      applicationDeadline,
      jobAddress,
      country,
      location,
      tags,
      taxonomyAttributes,
      attributes,
      workPeriods,
    } = req.body;

    const jobData = {
      jobId: uuidv4(),
      origin: 'HOSTED',
      organizationId: _id,
      title,
      description,
      company,
      applyMethod,
      jobTypes,
      contractLength,
      salary,
      expectedHours,
      workingHoursMin,
      workingHoursMax,
      resumeRequired,
      coverLetterRequired,
      phoneRequired,
      language,
      applicationDeadline,
      jobAddress,
      country,
      location,
      tags,
      taxonomyAttributes,
      attributes,
      workPeriods,
    };

    const newJob = await Job.create(jobData);

    // Invalidate relevant caches
    await redisClient.invalidateAllJobsCache();
    await redisClient.del('jobs:employmentTypes');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob,
    });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const fetchAndSaveRapidJobsUseLater = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
    });
  }

  try {
    // Build search params
    const params = {
      query: `${query}`,
      page: 1,
      num_pages: 5, // Reduced from 20 to avoid hitting rate limits
    };

    const response = await axios.get(config.rapidJobApi, {
      params,
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    const jobs = response.data.data;
    let savedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    // Process jobs sequentially to avoid race conditions and properly track counts
    for (const job of jobs) {
      try {
        // Check if job already exists with the same jobId
        const existingJob = await Job.findOne({ jobId: job.job_id });

        if (existingJob) {
          // Check if this query is already in the job's queries array
          if (!existingJob.queries.includes(query)) {
            // Add the new query to the existing job
            await Job.updateOne(
              { jobId: job.job_id },
              { $addToSet: { queries: query } },
            );
            updatedCount++;
          } else {
            // Job exists and already has this query - skip
            skippedCount++;
          }
          continue; // Skip to next job
        }

        // Extract job details
        const experience = extractExperience(job.job_description);
        const qualifications = extractQualifications(job.job_description);

        const jobData = {
          jobId: job.job_id,
          origin: 'EXTERNAL',
          publisher: job.job_publisher,

          // Core job info
          title: job.job_title,
          description: job.job_description,
          shortDescription: job.job_description.substring(0, 200) + '...',
          isRemote: job.job_is_remote || false,

          // Company info
          company: job.employer_name,
          companyType: job.employer_company_type,
          logo: job.employer_logo,
          companyWebsite: job.employer_website,
          companyLinkedIn: job.employer_linkedin,

          // Requirements
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

          // Responsibilities
          responsibilities: job.job_highlights?.Responsibilities || [],

          // Employment details
          employmentType: job.job_employment_type || 'FULLTIME',
          employmentTypeText: job.job_employment_type_text || 'Full-time',

          // Salary
          salary: {
            min: job.job_min_salary || null,
            max: job.job_max_salary || null,
            currency: job.job_salary_currency || 'USD',
            period: job.job_salary_period || 'YEAR',
            isEstimated: !job.job_min_salary,
          },
          salaryDisclosed: !!job.job_min_salary,

          // Benefits
          benefits: job.job_benefits ? job.job_benefits.join(', ') : null,
          benefitsList: job.job_benefits || [],

          // Application details
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

          // Location
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

          // Dates
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

          // Classification
          industry: job.job_industry || null,
          occupationalCategory: job.job_occupational_categories?.[0] || null,
          onetSoc: job.job_onet_soc || null,
          onetJobZone: job.job_onet_job_zone || null,
          naicsCode: job.job_naics_code || null,
          naicsName: job.job_naics_name || null,

          // Metadata
          tags: job.job_benefits || [],
          queries: [query],
          taxonomyAttributes: [],
        };

        // Create new job
        await Job.create(jobData);
        savedCount++;
      } catch (error) {
        console.error(`Error processing job ${job.job_id}:`, error.message);
        skippedCount++;
      }
    }

    if (savedCount > 0) {
      await redisClient.invalidateAllJobsCache();
    }

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
    console.error('Error in fetchAndSaveRapidJobs:', err.message);

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

const formatJobDescriptionWithAI = (rawDescription) => {
  if (!rawDescription || rawDescription.trim() === '') {
    return rawDescription;
  }

  // This prompt is crucial. It tells the AI exactly how to format the text.
  const prompt = `
    You are an expert HR content formatter. Your task is to take the following raw job description text and reformat it into clean, well-structured HTML.

    Follow these rules strictly:
    1.  Use <h2> headings for major sections like "Responsibilities", "Qualifications", "Skills", or "Requirements".
    1.5 Use valide spacing like <br> padding or margin and more use your creativity
    2.  Use <ul> and <li> tags for bulleted lists.
    3.  Use <strong> tags to make key technologies, skills, and important phrases bold (e.g., "Java 11+", "Spring Boot", "Angular 17+", "Microservices").
    4.  Do NOT add any information that is not present in the original text.
    5.  Do NOT write any introductory or concluding paragraphs. Only output the formatted HTML.

    Here is the raw text:
    ---
    ${rawDescription}
    ---
  `;

  return genAI(prompt);
};

export const fetchAndSaveRapidJobs = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: 'Query is required' });
  }

  try {
    const response = await axios.get(config.rapidJobApi, {
      params: {
        query,
        page: 1,
        num_pages: 1,
      },
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    const jobs = response.data.data;

    let savedCount = 0;

    for (const job of jobs) {
      const existing = await Job.findOne({ jobId: job.job_id });
      const experience = extractExperience(job.job_description);
      // const qualifications = extractQualifications(job.job_description);

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
          experience: experience,
          qualification: qualifications,
          title: job.job_title,
          description: formattedDescription,
          responsibilities,
          qualifications,
          jobTypes: job.job_employment_types,

          company: job.employer_name,
          applyMethod: {
            method: 'URL',
            url: job.job_apply_link,
          },
          jobTypes: job.job_employment_types,
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
        // If job exists, just update query list
        await Job.updateOne(
          { jobId: job.job_id },
          { $addToSet: { queries: query } },
        );
      }
    }

    // Invalidate relevant caches
    if (savedCount > 0) {
      await redisClient.invalidateAllJobsCache();
    }

    res.status(200).json({
      success: true,
      message: `Jobs fetched and saved successfully`,
      savedCount,
      totalReceived: jobs.length,
      jobs: jobs,
    });
  } catch (err) {
    console.error('Error fetching/saving RapidAPI jobs:', err.message);
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
    } = req.query;

    // --- HYBRID FETCH BLOCK ---
    if (query) {
      const existingJobCount = await Job.countDocuments({
        queries: { $in: [query] },
      });

      if (existingJobCount === 0) {
        await fetchAndSaveJobsService(query);
      } else {
        fetchAndSaveJobsService(query); // No 'await' for a fast response
      }
    }

    // --- QUERY LOCAL DATABASE ---
    const filter = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }
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
    if (employmentType) {
      filter.jobTypes = { $in: employmentType.split(',') };
    }
    if (experience) {
      filter.experience = { $in: experience.split(',') };
    }

    if (query) {
      const matchingJobCount = await Job.countDocuments(filter);
      if (matchingJobCount < 10) {
        await fetchAndSaveJobsService(query);
      } else {
        fetchAndSaveJobsService(query); // No 'await'
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(filter),
    ]);

    // --- SEND RESPONSE ---
    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
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

const STALE_THRESHOLD_HOURS = 6;

export const streamAllJobs = async (req, res) => {
  try {
    const { query, country, city, datePosted, employmentType, experience } =
      req.query;

    console.log('SSE connection established');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // --- 1. NEW: Conditionally trigger the background fetch ---
    if (query) {
      // Check if we have any jobs for this specific query term
      const jobCount = await Job.countDocuments({ queries: query });
      let shouldFetch = false;

      if (jobCount === 0) {
        // Condition 1: No data exists for this query, so we must fetch.
        shouldFetch = true;
      } else {
        // Condition 2: Data exists, check if it's stale.
        const latestJob = await Job.findOne({ queries: query }).sort({
          createdAt: -1,
        });
        const thresholdDate = new Date();
        thresholdDate.setHours(
          thresholdDate.getHours() - STALE_THRESHOLD_HOURS,
        );

        if (latestJob && latestJob.createdAt < thresholdDate) {
          shouldFetch = true;
          console.log(`Data for query "${query}" is stale. Triggering fetch.`);
        } else {
          console.log(
            `Fresh data for query "${query}" already exists. Skipping fetch.`,
          );
        }
      }

      if (shouldFetch) {
        // Don't await. Let this run in the background.
        fetchAndSaveJobsService(query).catch((err) => {
          console.error(`Background fetch for "${query}" failed:`, err);
        });
      }
    }

    // --- 2. Build the database filter (No changes here) ---
    const filter = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { queries: query }, // Also match against the query array
      ];
    }
    // ... rest of the filter logic remains the same
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (datePosted) {
      /* ... date logic ... */
    }
    if (employmentType) filter.jobTypes = { $in: employmentType.split(',') };
    if (experience) filter.experience = { $in: experience.split(',') };

    // --- 3. Stream existing results from the database (No changes here) ---
    const cursor = Job.find(filter).sort({ createdAt: -1 }).cursor();

    for await (const job of cursor) {
      res.write(`event: new-job\ndata: ${JSON.stringify(job)}\n\n`);
    }

    // --- 4. Signal the end of the initial stream (No changes here) ---
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
    const jobs = await redisClient.withCache(cacheKey, 3600, async () => {
      return await Job.find({ origin: 'HOSTED' }).sort({ createdAt: -1 });
    });

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching manual jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getRapidJobs = async (req, res) => {
  try {
    const cacheKey = 'jobs:rapid';
    const jobs = await redisClient.withCache(cacheKey, 3600, async () => {
      return await Job.find({ origin: 'EXTERNAL' }).sort({ createdAt: -1 });
    });

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching rapid jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getJobFromJobId = async (req, res) => {
  const { jobId } = req.params;
  console.log(jobId);
  try {
    const job = await Job.find({ jobId });
    console.log(job);

    res.status(200).json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getSingleJobDetail = async (req, res) => {
  const { jobId } = req.params;
  try {
    const cacheKey = `job:${jobId}`;
    const job = await redisClient.withCache(cacheKey, 3600, async () => {
      return await Job.findById(jobId).select('-queries');
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

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

const escapeRegex = (text) => {
  if (!text) return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

const transformRapidApiJob = (apiJob, searchQuery) => {
  const qualifications = apiJob.job_highlights?.Qualifications || [];
  const responsibilities = apiJob.job_highlights?.Responsibilities || [];

  return {
    jobId: apiJob.job_id,
    origin: 'EXTERNAL',
    title: apiJob.job_title,
    description: apiJob.job_description,
    qualifications,
    responsibilities,
    company: apiJob.employer_name,
    country: apiJob.job_country,
    logo: apiJob.employer_logo,
    location: {
      city: apiJob.job_city,
      state: apiJob.job_state,
      lat: apiJob.job_latitude,
      lng: apiJob.job_longitude,
    },
    slug:
      (apiJob.job_title || 'job').toLowerCase().replace(/\s/g, '-') +
      `-${apiJob.job_id?.slice(0, 4) || 'ext'}`,
    applyMethod: { method: 'URL', url: apiJob.job_apply_link },
    isActive: true,
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
    // Build query with location information
    let query = apiQuery;
    if (city && state) {
      query = `${apiQuery} in ${city}, ${state}`;
    } else if (state) {
      query = `${apiQuery} in ${state}`;
    } else if (city) {
      query = `${apiQuery} in ${city}`;
    }

    const params = {
      query: query,
      page: '1',
      num_pages: '1',
    };

    // Add optional parameters only if they have values
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
    console.log('RapidAPI Response Data:', response.data);

    return response.data.data || [];
  } catch (apiError) {
    console.error(
      `RapidAPI fetch failed for query "${apiQuery}":`,
      apiError.response?.data || apiError.message,
    );
    return [];
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
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    const searchCriteria = {};

    // Build search criteria
    if (q) {
      searchCriteria.$or = [
        { title: new RegExp(escapeRegex(q), 'i') },
        { description: new RegExp(escapeRegex(q), 'i') },
        { queries: new RegExp(escapeRegex(q), 'i') },
      ];
    }

    if (country) searchCriteria.country = country;
    if (state) searchCriteria['location.state'] = state;
    if (city) searchCriteria['location.city'] = city;
    if (employmentType) {
      searchCriteria.jobTypes = { $in: employmentType.split(',') };
    }
    if (experience) {
      searchCriteria.experience = { $in: experience.split(',') };
    }

    let totalJobs = await Job.countDocuments(searchCriteria);
    let jobs = await Job.find(searchCriteria)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    let notification = null;

    // If no jobs found in database and this is the first page with a query
    if (jobs.length === 0 && q && pageNum === 1) {
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

        // Save to database in background - FIXED BULKWRITE OPERATION
        try {
          const bulkOps = externalJobsFormatted.map((job) => ({
            updateOne: {
              filter: { jobId: job.jobId },
              update: {
                // Use $set for all fields that should always be updated
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
                  jobTypes: job.jobTypes,
                  isActive: job.isActive,
                  origin: job.origin,
                  qualifications: job.qualifications,
                  responsibilities: job.responsibilities,
                  slug: job.slug,
                  experience: job.experience,
                },
                // Only use $setOnInsert for fields that should ONLY be set on insert
                $setOnInsert: {
                  createdAt: new Date(),
                  // Remove queries from $setOnInsert since we handle it separately
                },
                // Use $addToSet for array fields to avoid duplicates
                $addToSet: {
                  queries: q,
                },
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

    // Create notification if no jobs found
    if (jobs.length === 0 && q) {
      const locationString = [city, state, country].filter(Boolean).join(', ');
      notification = locationString
        ? `We couldn't find any jobs for "${q}" in ${locationString}. Try broadening your search.`
        : `We couldn't find any jobs matching your search for "${q}".`;
    }

    const totalPages = Math.ceil(totalJobs / limitNum);

    res.status(200).json({
      jobs,
      pagination: {
        totalJobs,
        totalPages,
        currentPage: pageNum,
        hasNextPage: pageNum < totalPages,
      },
      notification,
    });
  } catch (error) {
    console.error('Error in searchJobs controller:', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

export const getJobDetailBySlug = async (req, res) => {
  const { slug } = req.query;

  try {
    const singleJob = await Job.find({ slug });

    if (!singleJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ singleJob: singleJob[0] });
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
    const jobTypes = await redisClient.withCache(cacheKey, 86400, async () => {
      return await Job.distinct('jobTypes');
    });

    res.status(200).json({
      success: true,
      jobTypes: jobTypes || [],
    });
  } catch (error) {
    console.error('Error fetching employment types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAllExperiences = async (req, res) => {
  try {
    const cacheKey = 'jobs:experiences';
    let experiences = await redisClient.withCache(cacheKey, 86400, async () => {
      const exp = await Job.distinct('experience');
      return exp.map((e) => (e === null ? 0 : e));
    });

    if (!experiences || experiences.length === 0) {
      experiences = [0];
    }

    experiences.sort((a, b) => a - b);
    res.status(200).json({
      success: true,
      experiences,
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const toggleJobStatus = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.isActive = !job.isActive;
    await job.save();

    // Invalidate relevant caches
    await redisClient.invalidateJobCache(jobId);
    await redisClient.invalidateAllJobsCache();

    res.status(200).json({ message: 'Job status updated successfully' });
  } catch (error) {
    console.error('Error toggling job status:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const jobViewsCount = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.views++;
    console.log(`Job ${jobId} views incremented to ${job.views}`);
    await job.save();

    // Invalidate cache for this job
    // await redisClient.   invalidateJobCache(jobId);

    res.status(200).json({ message: 'Job views count updated successfully' });
  } catch (error) {
    console.error('Error updating job views count:', error);
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
    const job = await redisClient.withCache(cacheKey, 600, async () => {
      return await Job.findById(jobId).populate('applications');
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

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
    const job = await redisClient.withCache(cacheKey, 600, async () => {
      return await Job.findById(jobId);
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

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

    // 1. Get the current student's viewed job IDs
    const student = await Student.findById(studentId)
      .select('viewedJobs.job')
      .lean();

    // 2. Create a Set for fast lookup (more efficient than Array.includes())
    const viewedJobIds = new Set(
      student.viewedJobs.map((view) => view.job.toString()),
    );

    const jobs = await Job.find({}).lean();

    // 4. Add the 'viewed' boolean to each job
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
