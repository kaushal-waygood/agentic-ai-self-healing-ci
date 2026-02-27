// src/utils/jobHelpers.js
import axios from 'axios';
import slugify from 'slugify';
import { Job } from '../models/jobs.model.js';
import { config } from '../config/config.js';
import { generateEmbedding } from '../config/embedding.js';
import crypto from 'crypto';
import { JobInteraction } from '../models/jobInteraction.model.js';
import redisClient from '../config/redis.js';
import { stableShuffle } from './stableShuffle.js';
import { makeTop4Key } from './dashboardKeys.js';
import { Student } from '../models/students/student.model.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import mongoose from 'mongoose';

export const safeParseInt = (v, fallback = 0) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

const hashText = (t) => crypto.createHash('sha256').update(t).digest('hex');

// --------------------
// 1. UTILS & SLUGS
// --------------------
const rand = () => Math.random().toString(36).slice(2, 8);

export const makeSlug = (title) =>
  `${slugify(title || 'job', { lower: true, strict: true, trim: true })}-${rand()}`;

export function normalizeSet(arr = []) {
  return Array.from(
    new Set(
      arr
        .map((s) =>
          (typeof s === 'string' ? s.trim() : s?.skill || '').toLowerCase(),
        )
        .filter(Boolean),
    ),
  );
}

export function dedupeByTitleCompany(jobs) {
  const seen = new Set();
  const out = [];
  for (const j of jobs) {
    const key = `${(j.title || '').toLowerCase()}|${(j.company || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(j);
  }
  return out;
}

// --------------------
// 2. NORMALIZATION MAPS
// --------------------
const EMPLOYMENT_TYPE_MAP = {
  'FULL-TIME': 'FULLTIME',
  'PART-TIME': 'PARTTIME',
  CONTRACTOR: 'CONTRACTOR',
  CONTRACT: 'CONTRACTOR',
  INTERN: 'INTERN',
  INTERNSHIP: 'INTERN',
  FREELANCE: 'CONTRACTOR', // JSearch doesn't have freelance, so map to contractor
};

export function normalizeEmploymentTypeForApi(employmentType) {
  if (!employmentType) return undefined;
  return employmentType
    .split(',')
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean)
    .map((v) => EMPLOYMENT_TYPE_MAP[v] || v)
    .join(',');
}

async function getExistingExternalJobMap(jobIds = []) {
  if (!jobIds.length) return {};

  const existing = await Job.find(
    { jobId: { $in: jobIds }, origin: 'EXTERNAL' },
    { jobId: 1, embeddingHash: 1 },
  ).lean();

  return Object.fromEntries(existing.map((j) => [j.jobId, j.embeddingHash]));
}
// --------------------
// 3. API DATA TRANSFORM
// --------------------

export async function retrieveLocalCandidates(context, limit = 100) {
  // Parallelize keyword and vector search
  const tasks = [];

  if (context.query) {
    tasks.push(keywordSearch(context, limit));
    tasks.push(vectorSearch(context, limit));
  } else {
    // If no query, fallback to recent active jobs in the desired country
    tasks.push(
      Job.find({ isActive: true, country: context.filters?.country || 'IN' })
        .sort({ jobPostedAt: -1 })
        .limit(limit)
        .lean(),
    );
  }

  const results = await Promise.all(tasks);
  const combined = results.flat();

  return dedupeByTitleCompany(combined);
}

/**
 * Optimized Bulk Upsert for External Jobs
 * Focuses on speed by avoiding sequential AI embedding generation.
 */
export async function upsertExternalJobs(externalJobs) {
  if (!externalJobs || !externalJobs.length) return;

  const startTime = Date.now();
  const jobIds = externalJobs.map((j) => j.jobId);

  // 1. Quick check for existing jobs to avoid unnecessary overrides
  // We fetch jobId, slug and _id to preserve their DB links
  const existingJobs = await Job.find(
    { jobId: { $in: jobIds }, origin: 'EXTERNAL' },
    { jobId: 1, slug: 1, _id: 1 },
  ).lean();

  const existingMap = new Map();
  existingJobs.forEach((j) => existingMap.set(j.jobId, j));

  // 2. Prepare Bulk Operations
  const ops = externalJobs.map((j) => {
    // 🔥 FIX: Bind DB's _id and slug to the returned node so frontend doesn't 404
    if (existingMap.has(j.jobId)) {
      const existing = existingMap.get(j.jobId);
      j.slug = existing.slug;
      j._id = existing._id;
    } else {
      j._id = new mongoose.Types.ObjectId();
      // slug will remain the one created by transformRapidApiJob
    }

    // Generate a fresh hash for the current content
    const textToEmbed =
      `Title: ${j.title} Description: ${j.description} Company: ${j.company}`.trim();
    const embeddingHash = hashText(textToEmbed);

    const updateDoc = {
      title: j.title,
      description: j.description,
      responsibilities: j.responsibilities,
      qualifications: j.qualifications,
      company: j.company,
      country: j.country,
      logo: j.logo,
      location: j.location,
      applyMethod: j.applyMethod,
      isActive: true,
      jobTypes: j.jobTypes,
      experience: j.experience,
      salary: j.salary,
      remote: j.remote,
      jobPosted: j.jobPosted,
      jobPostedAt: j.jobPostedAt,
      embeddingHash,
      // 🚀 SPEED TRICK: Don't generate vector here.
      // Mark it as "pending" so a background job can find and vectorize it.
      needsEmbedding: !existingMap.has(j.jobId),
    };

    return {
      updateOne: {
        filter: { jobId: j.jobId, origin: 'EXTERNAL' },
        update: {
          $set: updateDoc,
          $addToSet: {
            tags: { $each: Array.isArray(j.tags) ? j.tags : [] },
            queries: { $each: Array.isArray(j.queries) ? j.queries : [] },
          },
          $setOnInsert: { _id: j._id, slug: j.slug },
        },
        upsert: true,
      },
    };
  });

  // 3. Execute Bulk Write (unordered: false for maximum speed)
  const result = await Job.bulkWrite(ops, { ordered: false });

  return result;
}

function buildLocationFromApiJob(apiJob) {
  let city = apiJob.job_city || '';
  let state = apiJob.job_state || '';
  const country = apiJob.job_country?.toUpperCase() || '';

  if (!city && apiJob.job_location) {
    const parts = apiJob.job_location.split(',').map((p) => p.trim());
    city = parts[0] || '';
    state = parts[1] || '';
  }

  return {
    city,
    state,
    country,
    lat: Number(apiJob.job_latitude) || undefined,
    lng: Number(apiJob.job_longitude) || undefined,
  };
}

export function transformRapidApiJob(apiJob, searchQuery) {
  const loc = buildLocationFromApiJob(apiJob);

  // Repair Country Code - Defaulting to IN if India is mentioned
  let finalCountry = loc.country;
  const rawLocStr = (apiJob.job_location || '').toLowerCase();
  if (!finalCountry && rawLocStr.includes('india')) finalCountry = 'IN';
  if (
    !finalCountry &&
    (rawLocStr.includes('usa') || rawLocStr.includes('united states'))
  )
    finalCountry = 'US';

  let salaryObj = undefined;
  if (apiJob.job_min_salary || apiJob.job_max_salary) {
    let rawPeriod = (apiJob.job_salary_period || 'YEAR').toUpperCase();
    if (!['HOUR', 'DAY', 'MONTH', 'YEAR'].includes(rawPeriod)) {
      rawPeriod = 'YEAR'; // Fallback for 'WEEK' or other periods
    }
    salaryObj = {
      min: apiJob.job_min_salary || 0,
      max: apiJob.job_max_salary || 0,
      period: rawPeriod,
    };
  }

  let expArray = [];
  if (apiJob.job_required_experience?.required_experience_in_months) {
    const months = apiJob.job_required_experience.required_experience_in_months;
    const years = Math.floor(months / 12);
    if (years > 0) {
      expArray.push(`${years} years`);
    } else {
      expArray.push(`${months} months`);
    }
  }

  const jobPostedAtDate = apiJob.job_posted_at_datetime_utc
    ? new Date(apiJob.job_posted_at_datetime_utc)
    : new Date();

  // Simple relative time calculation for jobPosted
  const diffInMs = new Date() - jobPostedAtDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  let jobPostedStr = '';
  if (diffInDays === 0) jobPostedStr = 'Today';
  else if (diffInDays === 1) jobPostedStr = '1 day ago';
  else jobPostedStr = `${diffInDays} days ago`;

  return {
    jobId: apiJob.job_id,
    origin: 'EXTERNAL',
    title: apiJob.job_title || 'job',
    description: apiJob.job_description || '',
    responsibilities: apiJob.job_highlights?.Responsibilities || [],
    qualifications: apiJob.job_highlights?.Qualifications || [],
    company: apiJob.employer_name || '',
    country: finalCountry,
    logo: apiJob.employer_logo || '',
    location: loc,
    slug: makeSlug(apiJob.job_title || 'job'),
    applyMethod: { method: 'URL', url: apiJob.job_apply_link || '' },
    isActive: true,
    jobPosted: jobPostedStr,
    jobPostedAt: jobPostedAtDate,
    jobTypes: apiJob.job_employment_type
      ? [apiJob.job_employment_type.toUpperCase()]
      : [],
    queries: searchQuery ? [searchQuery] : [],
    remote: apiJob.job_is_remote || false,
    salary: salaryObj,
    experience: expArray,
  };
}

// --------------------
// 4. EXTERNAL FETCH (IN-DEFAULTED)
// --------------------
export async function fetchExternalJobs(
  apiQuery,
  country = 'IN',
  state,
  city,
  datePosted,
  employmentType,
  experience,
  page = 1,
) {
  try {
    let query = apiQuery;

    // Inject location with "India" as fallback for "IN"
    const locParts = [
      city,
      state,
      country === 'IN' ? 'India' : country === 'US' ? 'USA' : country,
    ].filter(Boolean);

    if (locParts.length > 0) {
      query += ` in ${locParts.join(', ')}`;
    }

    const params = { query, page: String(page), num_pages: '1' };

    if (employmentType) {
      // RapidAPI JSearch accepts format: FULLTIME, CONTRACTOR, PARTTIME, INTERNSHIP
      params.employment_types = employmentType;
    }

    if (experience) {
      // e.g. "under_3_years_experience,more_than_3_years_experience,no_experience"
      params.job_requirements = experience;
    }

    if (datePosted) {
      // e.g. "today", "3days", "week", "month"
      params.date_posted = datePosted;
    }
    const response = await axios.get(config.rapidJobApi, {
      params,
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    return response?.data?.data || [];
  } catch (e) {
    console.error('RapidAPI error:', e.message);
    return [];
  }
}

// --------------------
// 5. STRICT FILTERING (PREVENTS WRONG COUNTRY DATA)
// --------------------

export function applyFilters(jobs, context) {
  const { country, state, city, employmentType } = context.filters || {};
  const interactions = context.interactions || {
    applied: new Set(),
    saved: new Set(),
    views: {},
  };
  const { applied, saved, views } = interactions;

  // 1. Normalize target inputs for comparison
  const targetCountry = country?.toUpperCase().trim() || 'IN';
  const targetState = state?.toLowerCase().trim();
  const targetCity = city?.toLowerCase().trim();
  const targetType = employmentType?.toUpperCase().trim(); // e.g., "INTERNSHIP"

  return jobs.filter((job) => {
    if (!job || !job.isActive) return false;

    // Filter out jobs the user has applied to or saved
    const jobIdStr = String(job._id);
    if (job._id && (applied.has(jobIdStr) || saved.has(jobIdStr))) {
      return false;
    }

    // Filter out jobs heavily viewed but not acted upon (>5 recent decayed views)
    if (job._id && views[jobIdStr] && views[jobIdStr] > 5) {
      return false;
    }

    if (targetType) {
      const targetTypesClean = targetType
        .split(',')
        .map((t) => t.replace(/[^A-Z]/gi, '').toUpperCase());
      const jobTypesClean = (job.jobTypes || []).map((t) =>
        t.replace(/[^A-Z]/gi, '').toUpperCase(),
      );

      const typeMatch = jobTypesClean.some((t) => {
        return targetTypesClean.some((tt) => {
          const isOverlap = t.includes(tt) || tt.includes(t);
          const isInternshipMatch =
            (tt === 'INTERNSHIP' || tt === 'INTERN') &&
            (t === 'INTERN' || t === 'INTERNSHIP');
          const isContractMatch =
            (tt === 'FREELANCE' || tt === 'CONTRACT' || tt === 'CONTRACTOR') &&
            (t === 'FREELANCE' || t === 'CONTRACT' || t === 'CONTRACTOR');

          return isOverlap || isInternshipMatch || isContractMatch;
        });
      });

      if (!typeMatch) return false;
    }

    if (job.remote === true && !targetCity && !targetState) return true;

    const jLoc = job.location || {};
    const jobCountry = job.country?.toUpperCase().trim();
    const jobCity =
      (typeof jLoc === 'string' ? jLoc : jLoc.city)?.toLowerCase() || '';
    const jobState = (jLoc.state || '').toLowerCase();

    const locationBlob =
      `${jobCity} ${jobState} ${job.description?.slice(0, 150).toLowerCase()}`.trim();

    if (targetCountry) {
      const isISOPerfect = Boolean(jobCountry && jobCountry === targetCountry);

      const isCountryNameMatch =
        (targetCountry === 'IN' && locationBlob.includes('india')) ||
        (targetCountry === 'US' &&
          (locationBlob.includes('usa') ||
            locationBlob.includes('united states')));

      if (!isISOPerfect && !isCountryNameMatch) {
        // If the API didn't provide a country code, but provided a city, we shouldn't necessarily drop it
        // if we suspect it's the target country. If origin is EXTERNAL and we lack the ISO code, we tentatively allow it
        // UNLESS it explicitly mentions another known country (advanced NLP needed, but for now we fallback allow).
        const hasAnyLocationData = !!(jobCountry || jobCity || jobState);
        if (hasAnyLocationData && jobCountry) {
          // We only definitively reject if a DIFFERENT explicit country is found
          return false;
        }
      }
    }

    if (targetState) {
      const matchesState =
        jobState.includes(targetState) || jobCity.includes(targetState);
      if (!matchesState) return false;
    }

    if (targetCity) {
      const matchesCity = jobCity.includes(targetCity);
      if (!matchesCity) return false;
    }

    return true;
  });
}

export async function buildInteractionContext(userId) {
  if (!userId) return null;

  const interactions = await JobInteraction.find({
    user: userId,
    type: { $in: ['VIEW', 'SAVED', 'APPLIED'] },
  })
    .select('job type createdAt')
    .lean();

  const applied = new Set();
  const saved = new Set();
  const views = {};

  interactions.forEach((i) => {
    const id = String(i.job);

    if (i.type === 'APPLIED') applied.add(id);

    if (i.type === 'SAVED') saved.add(id);

    if (i.type === 'VIEW') {
      // time decay (recent views matter more)
      const decay = Math.exp(
        -(Date.now() - new Date(i.createdAt)) / (30 * 86400000),
      );

      views[id] = (views[id] || 0) + decay;
    }
  });

  return { applied, saved, views };
}

// --------------------
// 6. CONTEXT BUILDERS (INDIA DEFAULT)
// --------------------
export async function buildSearchContext(req) {
  // Default to IN if no country provided in query
  let country = req.query.country || 'IN';
  let state = req.query.state;
  let city = req.query.city;

  const interactions = await buildInteractionContext(req.user?._id);

  return {
    type: 'search',
    query: req.query.q?.toLowerCase().trim() || '',
    filters: { country, state, city, employmentType: req.query.employmentType },
    userId: req.user?._id,
    interactions,
  };
}

// --------------------
// 7. CANDIDATE RETRIEVAL (REFILLS WITH INDIA DATA)
// --------------------
export async function retrieveCandidates(context, limit = 300) {
  const cacheKey = context.query
    ? `cand:search:${context.userId || 'anon'}:${context.query}:${context.filters?.country}`
    : null;

  if (cacheKey) {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  // A. Local Search
  const tasks = [keywordSearch(context), vectorSearch(context)];
  const results = await Promise.allSettled(tasks);
  let jobs = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  let finalPool = dedupeByTitleCompany(jobs);

  // B. Refill loop - Hard-wired to current filters (Default IN)
  const MIN_POOL = 40;
  let page = 1;

  while (finalPool.length < MIN_POOL && page <= 20) {
    const externalRaw = await fetchExternalJobs(
      context.query,
      context.filters?.country,
      context.filters?.state,
      context.filters?.city,
      null,
      context.filters?.employmentType,
      null,
      page,
    );

    if (!externalRaw.length) break;

    const formatted = externalRaw.map((j) =>
      transformRapidApiJob(j, context.query),
    );

    // FIX: MUST UPSERT HERE to ensure jobs are fundamentally written and correct _id/slug mappings are hydrated!
    // Without this, user clicks on search UI will 404 because these are "ghost" objects never placed into MongoDB.
    await upsertExternalJobs(formatted).catch((e) =>
      console.error('retrieveCandidates Upsert Error:', e.message),
    );

    const validExternal = applyFilters(formatted, context);

    finalPool = dedupeByTitleCompany([...finalPool, ...validExternal]);
    page++;
  }

  const output = finalPool.slice(0, limit);
  if (cacheKey && output.length > 0)
    await redisClient.set(cacheKey, JSON.stringify(output), 600);

  return output;
}

// --------------------
// 8. SEARCH DRIVERS & SCORING
// --------------------
async function keywordSearch(context, limit = 100) {
  if (!context.query) return [];

  // Use regex search instead of $text since the index is missing
  const regex = new RegExp(context.query, 'i');
  return Job.find({
    $or: [{ title: regex }, { queries: regex }],
    isActive: true,
  })
    .limit(limit)
    .lean();
}

async function vectorSearch(context, limit = 100) {
  const titles = context.profile?.titles?.join(' ') || '';
  const skills = context.profile?.skills?.join(' ') || '';
  const input = context.query || `${titles} ${skills}`.trim();

  if (!input) return [];

  const queryVector = await generateEmbedding(input);
  if (!queryVector) return [];

  return Job.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'job_embedding',
        queryVector,
        limit: limit,
        numCandidates: limit * 2 > 200 ? limit * 2 : 200,
      },
    },
    {
      $project: { job_embedding: 0, score: { $meta: 'vectorSearchScore' } },
    },
    {
      $match: { score: { $gte: 0.935 } },
    },
  ]);
}

export function rankJobs(jobs, context) {
  return jobs
    .map((job) => {
      const freshness = Math.exp(
        -(Date.now() - new Date(job.jobPostedAt)) / (86400000 * 15),
      );
      const isTargetCountry =
        job.country === (context.filters?.country || 'IN');
      const geo = job.remote || isTargetCountry ? 1 : 0.1;

      return { ...job, score: freshness * 0.4 + geo * 0.6 };
    })
    .sort((a, b) => b.score - a.score);
}

export function diversify(jobs) {
  const companyCounts = {};
  return jobs.filter((j) => {
    companyCounts[j.company] = (companyCounts[j.company] || 0) + 1;
    return companyCounts[j.company] <= 3;
  });
}
