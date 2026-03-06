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
  const seen = new Map();
  for (const j of jobs) {
    const key = `${(j.title || '').toLowerCase()}|${(j.company || '').toLowerCase()}`;
    const existing = seen.get(key);
    if (!existing || (j.score && (!existing.score || j.score > existing.score))) {
      seen.set(key, j);
    }
  }
  return Array.from(seen.values());
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

function freshnessScore(date, halfLifeDays = 14) {
  const ageDays = (Date.now() - new Date(date)) / 86400000;
  return Math.pow(0.5, ageDays / halfLifeDays);
}

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
  const queryPart = context.query || 'recent';
  const countryPart = context.filters?.country || 'GLOBAL';
  const contextType = context.type || 'search';
  const cacheKey = `jobs:local:${crypto.createHash('md5').update(`${contextType}:${queryPart}:${countryPart}:${limit}`).digest('hex')}`;

  return await redisClient.withCache(cacheKey, 600, async () => {
    const tasks = [];

    const maxAgeDays = contextType === 'recommendation' ? 90 : 10;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    const dateFilter = { jobPostedAt: { $gte: cutoffDate } };

    if (context.query) {
      tasks.push(keywordSearch(context, limit, dateFilter));
      tasks.push(vectorSearch(context, limit, dateFilter));
    } else {
      // No query — fetch recent active jobs, respecting country only if provided
      const baseFilter = { isActive: true, ...dateFilter };
      if (context.filters?.country) {
        baseFilter.country = context.filters.country;
      }
      tasks.push(
        Job.find(baseFilter).sort({ jobPostedAt: -1 }).limit(limit).lean(),
      );
    }

    const results = await Promise.all(tasks);
    const combined = results.flat();
    combined.sort((a, b) => new Date(b.jobPostedAt) - new Date(a.jobPostedAt));
    return dedupeByTitleCompany(combined);
  });
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

  // Sanitize: JSearch returns 'Anywhere', 'Remote', 'Worldwide', etc. for
  // remote-only jobs. These are not real city names — clear them so the
  // frontend can fall back to state / country or show the remote badge.
  const MEANINGLESS_CITY_TOKENS = [
    'anywhere',
    'remote',
    'worldwide',
    'global',
    'work from home',
    'wfh',
    'online',
    'virtual',
  ];
  const cityLower = city.toLowerCase().trim();
  if (MEANINGLESS_CITY_TOKENS.includes(cityLower)) {
    city = '';
  }

  return {
    city,
    state,
    country,
    lat: Number(apiJob.job_latitude) || undefined,
    lng: Number(apiJob.job_longitude) || undefined,
  };
}

// --- Country normalization maps ---
const ISO3_TO_ISO2 = {
  IND: 'IN',
  USA: 'US',
  GBR: 'GB',
  JPN: 'JP',
  DEU: 'DE',
  FRA: 'FR',
  CAN: 'CA',
  AUS: 'AU',
  BRA: 'BR',
  CHN: 'CN',
  KOR: 'KR',
  SGP: 'SG',
  ARE: 'AE',
  SAU: 'SA',
  NLD: 'NL',
  ESP: 'ES',
  ITA: 'IT',
  CHE: 'CH',
  SWE: 'SE',
  NOR: 'NO',
  DNK: 'DK',
  FIN: 'FI',
  IRL: 'IE',
  NZL: 'NZ',
  ZAF: 'ZA',
  MEX: 'MX',
  ARG: 'AR',
  COL: 'CO',
  CHL: 'CL',
  PHL: 'PH',
  MYS: 'MY',
  IDN: 'ID',
  THA: 'TH',
  VNM: 'VN',
  POL: 'PL',
  ROU: 'RO',
  PRT: 'PT',
  AUT: 'AT',
  BEL: 'BE',
  ISR: 'IL',
  TUR: 'TR',
  RUS: 'RU',
  UKR: 'UA',
  EGY: 'EG',
  NGA: 'NG',
  KEN: 'KE',
  PAK: 'PK',
  BGD: 'BD',
  LKA: 'LK',
  NPL: 'NP',
  HKG: 'HK',
  TWN: 'TW',
  QAT: 'QA',
  KWT: 'KW',
  OMN: 'OM',
  BHR: 'BH',
};

const COUNTRY_NAME_TO_ISO2 = {
  india: 'IN',
  usa: 'US',
  'united states': 'US',
  'united states of america': 'US',
  japan: 'JP',
  germany: 'DE',
  france: 'FR',
  canada: 'CA',
  australia: 'AU',
  brazil: 'BR',
  china: 'CN',
  'south korea': 'KR',
  korea: 'KR',
  singapore: 'SG',
  'united arab emirates': 'AE',
  uae: 'AE',
  dubai: 'AE',
  'saudi arabia': 'SA',
  netherlands: 'NL',
  holland: 'NL',
  spain: 'ES',
  italy: 'IT',
  switzerland: 'CH',
  sweden: 'SE',
  norway: 'NO',
  denmark: 'DK',
  finland: 'FI',
  ireland: 'IE',
  'new zealand': 'NZ',
  'south africa': 'ZA',
  mexico: 'MX',
  argentina: 'AR',
  colombia: 'CO',
  chile: 'CL',
  philippines: 'PH',
  malaysia: 'MY',
  indonesia: 'ID',
  thailand: 'TH',
  vietnam: 'VN',
  poland: 'PL',
  romania: 'RO',
  portugal: 'PT',
  austria: 'AT',
  belgium: 'BE',
  israel: 'IL',
  turkey: 'TR',
  russia: 'RU',
  ukraine: 'UA',
  egypt: 'EG',
  nigeria: 'NG',
  kenya: 'KE',
  pakistan: 'PK',
  bangladesh: 'BD',
  'sri lanka': 'LK',
  nepal: 'NP',
  'hong kong': 'HK',
  taiwan: 'TW',
  qatar: 'QA',
  kuwait: 'KW',
  oman: 'OM',
  bahrain: 'BH',
  'united kingdom': 'GB',
  uk: 'GB',
  england: 'GB',
  britain: 'GB',
  'great britain': 'GB',
};

function normalizeCountryCode(raw, locationStr) {
  if (!raw && !locationStr) return '';

  // 1. Already a valid ISO-2
  if (raw && raw.length === 2) return raw.toUpperCase();

  // 2. ISO-3 → ISO-2
  if (raw && raw.length === 3) {
    const mapped = ISO3_TO_ISO2[raw.toUpperCase()];
    if (mapped) return mapped;
  }

  // 3. Fuzzy match country name in location string
  const searchStr = `${raw || ''} ${locationStr || ''}`.toLowerCase();
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_ISO2)) {
    if (searchStr.includes(name)) return code;
  }

  return raw ? raw.toUpperCase() : '';
}

export function transformRapidApiJob(apiJob, searchQuery) {
  const loc = buildLocationFromApiJob(apiJob);

  // Normalize country code from any format (ISO-3, full name, etc.) → ISO-2
  const finalCountry = normalizeCountryCode(
    apiJob.job_country || loc.country,
    apiJob.job_location,
  );

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
  const cacheKeyStr = `${apiQuery || 'jobs'}:${country}:${state || 'none'}:${city || 'none'}:${datePosted || 'none'}:${employmentType || 'none'}:${experience || 'none'}:${page}`;
  const cacheKey = `jobs:rapid:${crypto.createHash('md5').update(cacheKeyStr).digest('hex')}`;

  return await redisClient.withCache(cacheKey, 3600, async () => {
    try {
      let query = apiQuery;

      // Inject location with full country name (RapidAPI needs names, not ISO codes)
      const ISO2_TO_NAME = {
        IN: 'India',
        US: 'USA',
        GB: 'United Kingdom',
        JP: 'Japan',
        DE: 'Germany',
        FR: 'France',
        CA: 'Canada',
        AU: 'Australia',
        BR: 'Brazil',
        CN: 'China',
        KR: 'South Korea',
        SG: 'Singapore',
        AE: 'UAE',
        SA: 'Saudi Arabia',
        NL: 'Netherlands',
        ES: 'Spain',
        IT: 'Italy',
        CH: 'Switzerland',
        SE: 'Sweden',
        NO: 'Norway',
        DK: 'Denmark',
        FI: 'Finland',
        IE: 'Ireland',
        NZ: 'New Zealand',
        ZA: 'South Africa',
        MX: 'Mexico',
        AR: 'Argentina',
        CO: 'Colombia',
        CL: 'Chile',
        PH: 'Philippines',
        MY: 'Malaysia',
        ID: 'Indonesia',
        TH: 'Thailand',
        VN: 'Vietnam',
        PL: 'Poland',
        RO: 'Romania',
        PT: 'Portugal',
        AT: 'Austria',
        BE: 'Belgium',
        IL: 'Israel',
        TR: 'Turkey',
        RU: 'Russia',
        UA: 'Ukraine',
        EG: 'Egypt',
        NG: 'Nigeria',
        KE: 'Kenya',
        PK: 'Pakistan',
        BD: 'Bangladesh',
        LK: 'Sri Lanka',
        NP: 'Nepal',
        HK: 'Hong Kong',
        TW: 'Taiwan',
        QA: 'Qatar',
        KW: 'Kuwait',
        OM: 'Oman',
        BH: 'Bahrain',
      };
      const countryName = ISO2_TO_NAME[country?.toUpperCase()] || country;
      const locParts = [city, state, countryName].filter(Boolean);

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
  });
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

  // When country is null/undefined/empty → no country filter (global mode)
  const targetCountry = country ? country.toUpperCase().trim() : '';
  const targetState = state?.toLowerCase().trim();
  const targetCity = city?.toLowerCase().trim();
  const targetType = employmentType?.toUpperCase().trim();

  return jobs.filter((job) => {
    if (!job || !job.isActive) return false;

    // Filter out jobs the user has applied to or saved
    const jobIdStr = String(job._id);
    if (job._id && (applied.has(jobIdStr) || saved.has(jobIdStr))) {
      return false;
    }

    // Filter out jobs heavily viewed but not acted upon (>5 recent decayed views)
    // if (job._id && views[jobIdStr] && views[jobIdStr] > 5) {
    //   return false;
    // }

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

    const jLoc = job.location || {};
    const jobCountry = job.country?.toUpperCase().trim();
    const jobCity =
      (typeof jLoc === 'string' ? jLoc : jLoc.city)?.toLowerCase() || '';
    const jobState = (jLoc.state || '').toLowerCase();

    // Remote jobs: bypass location in global mode or recommendation mode,
    // or when job country matches target.
    if (job.remote === true && !targetCity && !targetState) {
      const isGlobal = !targetCountry;
      const isRecommendation = context.type === 'recommendation';
      const countryMatches =
        !targetCountry || !jobCountry || jobCountry === targetCountry;
      if (isGlobal || isRecommendation || countryMatches) return true;
    }

    const locationBlob =
      `${jobCity} ${jobState} ${job.description?.slice(0, 150).toLowerCase()}`.trim();

    // Skip country check entirely in global mode (targetCountry = '')
    if (targetCountry) {
      const isISOPerfect = Boolean(jobCountry && jobCountry === targetCountry);

      // Universal fuzzy match: derive ISO-2 from location text
      let isCountryNameMatch = false;
      if (!isISOPerfect) {
        for (const [name, code] of Object.entries(COUNTRY_NAME_TO_ISO2)) {
          if (code === targetCountry && locationBlob.includes(name)) {
            isCountryNameMatch = true;
            break;
          }
        }
      }

      if (!isISOPerfect && !isCountryNameMatch) {
        if (jobCountry) return false;
        const hasAnyLocationData = !!(jobCity || jobState);
        if (!hasAnyLocationData) return false;
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
      const decay = freshnessScore(i.createdAt, 30);

      views[id] = (views[id] || 0) + decay;
    }
  });

  return { applied, saved, views };
}

// --------------------
// 6. CONTEXT BUILDERS (INDIA DEFAULT)
// --------------------
export async function buildSearchContext(req) {
  let country = (req.query.country || 'IN').toUpperCase().trim();
  let state = req.query.state?.trim() || undefined;
  let city = req.query.city?.trim() || undefined;

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

  const tasks = [keywordSearch(context), vectorSearch(context)];
  const results = await Promise.allSettled(tasks);
  let jobs = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  let finalPool = dedupeByTitleCompany(jobs);

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

const SEARCH_STOP_WORDS = new Set([
  'in', 'at', 'on', 'to', 'for', 'the', 'and', 'or', 'of',
  'is', 'it', 'an', 'as', 'by', 'be', 'near', 'from', 'with',
]);

const YEAR_PATTERN = /^(20\d{2}|19\d{2})$/;

function isYearToken(token) {
  return YEAR_PATTERN.test(token);
}

export function stripYearTokens(query) {
  if (!query) return query;
  return query
    .split(/\s+/)
    .filter((t) => !isYearToken(t.trim()))
    .join(' ')
    .trim();
}

async function keywordSearch(context, limit = 100, dateFilter = {}) {
  if (!context.query) return [];

  const tokens = context.query
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !SEARCH_STOP_WORDS.has(t.toLowerCase()));

  if (!tokens.length) return [];

  const meaningfulTokens = tokens.filter((t) => !isYearToken(t));
  if (!meaningfulTokens.length) return [];

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const andConditions = meaningfulTokens.map((token) => {
    const pattern = `\\b${escapeRegex(token)}`;
    const regex = new RegExp(pattern, 'i');
    return {
      $or: [{ title: regex }, { tags: regex }, { company: regex }],
    };
  });

  const filter = {
    $and: andConditions,
    isActive: true,
    ...dateFilter,
  };

  if (context.filters?.country) {
    filter.country = context.filters.country.toUpperCase();
  }

  return Job.find(filter)
    .sort({ jobPostedAt: -1 })
    .limit(limit)
    .lean();
}

async function vectorSearch(context, limit = 100, dateFilter = {}) {
  const titles = context.profile?.titles?.join(' ') || '';
  const skills = context.profile?.skills?.join(' ') || '';
  const rawInput = context.query || `${titles} ${skills}`.trim();
  const input = stripYearTokens(rawInput) || rawInput;

  if (!input) return [];

  const queryVector = await generateEmbedding(input);
  if (!queryVector) return [];

  const preFilter = [{ isActive: true }];
  if (context.filters?.country) {
    preFilter.push({ country: context.filters.country.toUpperCase() });
  }

  const postMatch = {
    $and: [{ score: { $gte: 0.65 } }],
  };

  if (dateFilter.jobPostedAt) {
    postMatch.$and.push({ jobPostedAt: dateFilter.jobPostedAt });
  }

  return Job.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'job_embedding',
        queryVector,
        limit: Math.min(limit, 10000),
        numCandidates: Math.min(Math.max(limit * 3, 300), 10000),
        filter: { $and: preFilter },
      },
    },
    {
      $project: { job_embedding: 0, score: { $meta: 'vectorSearchScore' } },
    },
    {
      $match: postMatch,
    },
    {
      $sort: { jobPostedAt: -1 },
    },
  ]);
}

export function rankJobs(jobs, context) {
  const query = context.query?.toLowerCase().trim() || '';
  const cleanedQuery = stripYearTokens(query) || query;
  const queryTokens = cleanedQuery.split(/\s+/).filter((t) => t.length >= 2);
  const targetCountry = context.filters?.country?.toUpperCase();

  return jobs
    .map((job) => {
      const freshness = freshnessScore(job.jobPostedAt, 14);

      const isTargetCountry =
        !targetCountry || job.country === targetCountry;
      const geo = job.remote || isTargetCountry ? 1 : 0.2;

      const rawVectorScore = job.score || 0;

      let titleMatchScore = 0;

      if (cleanedQuery && job.title) {
        const titleLower = job.title.toLowerCase();

        if (titleLower === cleanedQuery) {
          titleMatchScore = 1;
        } else if (titleLower.includes(cleanedQuery)) {
          titleMatchScore = 0.8;
        } else if (queryTokens.length > 0) {
          const matchCount = queryTokens.filter((token) =>
            titleLower.includes(token),
          ).length;

          titleMatchScore = matchCount / queryTokens.length;
        }
      }

      // Keyword-matched results lack a vector score — impute a baseline
      // proportional to their title relevance so they aren't penalised.
      const vectorScore = rawVectorScore > 0
        ? rawVectorScore
        : titleMatchScore * 0.75;

      const relevance = vectorScore * 0.5 + titleMatchScore * 0.5;

      const rankScore = relevance * 0.6 + freshness * 0.25 + geo * 0.15;

      return {
        ...job,
        rankScore,
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}

const processPool = (jobsPool, ctx) => {
  const filtered = applyFilters(jobsPool, ctx);
  const ranked = rankJobs(filtered, ctx);
  return ranked; // remove diversify for testing
};

export function diversify(jobs) {
  const companyCounts = {};
  return jobs.filter((j) => {
    companyCounts[j.company] = (companyCounts[j.company] || 0) + 1;
    return companyCounts[j.company] <= 3;
  });
}

export function rankJobsWithIntentBoost(jobs, context) {
  const primaryTitles = normalizeSet(context.profile?.titles || []);
  const targetCountry = context.filters?.country?.toUpperCase();

  return jobs
    .map((job) => {
      const freshness = freshnessScore(job.jobPostedAt, 14);
      const geo =
        job.remote || !targetCountry || job.country === targetCountry
          ? 1
          : 0.2;

      let primaryBoost = 0;
      const isRelevantDomain = primaryTitles.some((t) => {
        const match = job.title?.toLowerCase().includes(t.toLowerCase());
        if (match) primaryBoost = 1;
        return match;
      });

      // Impute baseline for keyword results that lack a vector score
      const rawVectorScore = job.score || 0;
      const vectorScore = rawVectorScore > 0
        ? rawVectorScore
        : (primaryBoost > 0 ? 0.7 : 0);

      const domainPenalty = isRelevantDomain ? 1 : 0.3;

      const rankScore =
        (vectorScore * 0.4 + freshness * 0.2 + geo * 0.1 + primaryBoost * 0.3) *
        domainPenalty;

      return { ...job, rankScore };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}

export async function fetchExternalDeep({
  apiTerm,
  country,
  state,
  city,
  minRequired = 1500,
  maxPages = 30,
}) {
  let pageCursor = 1;
  let externalRaw = [];

  while (externalRaw.length < minRequired && pageCursor <= maxPages) {
    const batch = await fetchExternalJobs(
      apiTerm,
      country,
      state,
      city,
      null,
      null,
      null,
      pageCursor,
    );

    if (!batch.length) break;

    externalRaw.push(...batch);
    pageCursor++;
  }

  return externalRaw;
}

export const fetchExternal = async (extCountry, extState, extCity) => {
  const externalRaw = await fetchExternalDeep({
    apiTerm,
    country: extCountry || 'IN',
    state: extState,
    city: extCity,
    minRequired: 2000,
    maxPages: 40,
  });

  return externalRaw;
};
