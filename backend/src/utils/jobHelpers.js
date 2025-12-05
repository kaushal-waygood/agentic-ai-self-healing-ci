// src/utils/jobHelpers.js
import axios from 'axios';
import slugify from 'slugify';
import { Job } from '../models/jobs.model.js';
import { config } from '../config/config.js';

// --------------------
// Slug helpers
// --------------------
const rand = () => Math.random().toString(36).slice(2, 8);

export const makeSlug = (title) =>
  `${slugify(title || 'job', {
    lower: true,
    strict: true,
    trim: true,
  })}-${rand()}`;

// --------------------
// Safe util helpers
// --------------------
export function safeRegex(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

export function escapeRegex(text) {
  if (!text) return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function parseMaybeDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function computeTotalExperienceYears(exps = []) {
  let ms = 0;
  const now = new Date();
  for (const e of exps) {
    const start = parseMaybeDate(e?.startDate);
    let end = parseMaybeDate(e?.endDate);
    if (!end && e?.currentlyWorking) end = now;
    if (start && end && end > start) ms += end.getTime() - start.getTime();
  }
  const years = ms / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years * 10) / 10);
}

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
    const key = `${(j.title || '').toLowerCase()}|${(
      j.company || ''
    ).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(j);
  }
  return out;
}

// --------------------
// Employment type normalization
// --------------------
const EMPLOYMENT_TYPE_MAP = {
  'FULL-TIME': 'FULLTIME',
  FULLTIME: 'FULLTIME',
  FULL_TIME: 'FULLTIME',
  'PART-TIME': 'PARTTIME',
  PARTTIME: 'PARTTIME',
  PART_TIME: 'PARTTIME',
  CONTRACTOR: 'CONTRACTOR',
  CONTRACT: 'CONTRACTOR',
  FREELANCE: 'CONTRACTOR',
  TEMPORARY: 'TEMPORARY',
  INTERN: 'INTERN',
  INTERNSHIP: 'INTERNSHIP',
};

export function normalizeJobTypesForDb(apiJob) {
  const list =
    apiJob.job_employment_types && Array.isArray(apiJob.job_employment_types)
      ? apiJob.job_employment_types
      : apiJob.job_employment_type
      ? [apiJob.job_employment_type]
      : [];

  return list
    .map((v) => v && v.toString().trim())
    .filter(Boolean)
    .map((v) =>
      (EMPLOYMENT_TYPE_MAP[v.toUpperCase()] || v.toUpperCase()).replace(
        /[\s-]+/g,
        '',
      ),
    );
}

export function normalizeEmploymentTypeForDbFilter(employmentType) {
  if (!employmentType) return undefined;

  return employmentType
    .split(',')
    .map((v) =>
      v
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, ''),
    )
    .filter(Boolean);
}

export function normalizeEmploymentTypeForApi(employmentType) {
  if (!employmentType) return undefined;

  return employmentType
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => EMPLOYMENT_TYPE_MAP[v] || v)
    .join(',');
}

// --------------------
// RapidAPI -> Job transform
// --------------------
function buildLocationFromApiJob(apiJob) {
  let city = apiJob.job_city || '';
  let state = apiJob.job_state || '';
  const country = apiJob.job_country || '';

  if (!city && apiJob.job_location) {
    const parts = apiJob.job_location.split(',').map((p) => p.trim());
    if (!city && parts[0]) city = parts[0];
    if (!state && parts[1]) state = parts[1];
  }

  return {
    city,
    state,
    postalCode: '',
    lat: Number(apiJob.job_latitude) || undefined,
    lng: Number(apiJob.job_longitude) || undefined,
  };
}

function resolveJobPostedAt(apiJob) {
  if (apiJob.job_posted_at_datetime_utc) {
    const d = new Date(apiJob.job_posted_at_datetime_utc);
    if (!isNaN(d.getTime())) return d;
  }
  if (apiJob.job_posted_at_timestamp) {
    const d = new Date(apiJob.job_posted_at_timestamp * 1000);
    if (!isNaN(d.getTime())) return d;
  }
  if (apiJob.job_posted_at) {
    const d = new Date(apiJob.job_posted_at);
    if (!isNaN(d.getTime())) return d;
  }
  if (apiJob.job_posted) {
    const d = new Date(apiJob.job_posted);
    if (!isNaN(d.getTime())) return d;
  }
  return undefined;
}

export function transformRapidApiJob(apiJob, searchQuery) {
  const highlights = apiJob?.job_highlights || {};

  const qualifications =
    highlights.Qualifications ||
    highlights.QUALIFICATIONS ||
    highlights.qualifications ||
    [];

  const responsibilities =
    highlights.Responsibilities ||
    highlights.RESPONSIBILITIES ||
    highlights.responsibilities ||
    [];

  const isRemote =
    typeof apiJob.job_is_remote === 'boolean'
      ? apiJob.job_is_remote
      : undefined;

  const location = buildLocationFromApiJob(apiJob);
  const jobPostedAt = resolveJobPostedAt(apiJob);
  const jobTypes = normalizeJobTypesForDb(apiJob);

  return {
    jobId: apiJob.job_id,
    origin: 'EXTERNAL',

    title: apiJob.job_title || 'job',
    description: apiJob.job_description || '',

    responsibilities,
    qualifications,

    company: apiJob.employer_name || '',
    country: apiJob.job_country || '',
    logo: apiJob.employer_logo || '',

    location,

    slug: makeSlug(apiJob.job_title || 'job'),

    applyMethod: {
      method: 'URL',
      url: apiJob.job_apply_link || '',
    },

    isActive: true,

    jobPosted:
      apiJob.job_posted || apiJob.job_posted_at || apiJob.job_posted_at_date,

    jobPostedAt,

    jobTypes,
    experience: [],
    tags: [],
    queries: searchQuery ? [searchQuery] : [],
    remote: isRemote,
  };
}

// --------------------
// External fetch with in-memory cache
// --------------------
const externalJobCache = new Map();

function makeExternalCacheKey(
  apiQuery,
  country,
  state,
  city,
  datePosted,
  employmentType,
  experience,
  page,
) {
  return JSON.stringify({
    apiQuery,
    country,
    state,
    city,
    datePosted,
    employmentType,
    experience,
    page,
  });
}

export async function fetchExternalJobs(
  apiQuery,
  country,
  state,
  city,
  datePosted,
  employmentType,
  experience,
  page = 1,
) {
  try {
    let query = apiQuery;
    if (city && state) query = `${apiQuery} in ${city}, ${state}`;
    else if (state) query = `${apiQuery} in ${state}`;
    else if (city) query = `${apiQuery} in ${city}`;

    const params = { query, page: String(page), num_pages: '1' };
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
    });
    return response?.data?.data || [];
  } catch (e) {
    console.error(
      `RapidAPI fetch failed for "${apiQuery}" p${page}:`,
      e?.response?.data || e?.message,
    );
    return [];
  }
}

export async function fetchExternalJobsCached(
  apiQuery,
  country,
  state,
  city,
  datePosted,
  employmentType,
  experience,
  page = 1,
  ttlMs = 15 * 60 * 1000,
) {
  const key = makeExternalCacheKey(
    apiQuery,
    country,
    state,
    city,
    datePosted,
    employmentType,
    experience,
    page,
  );

  const now = Date.now();
  const cached = externalJobCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const data = await fetchExternalJobs(
    apiQuery,
    country,
    state,
    city,
    datePosted,
    employmentType,
    experience,
    page,
  );

  externalJobCache.set(key, {
    data,
    expiresAt: now + ttlMs,
  });

  return data;
}

// --------------------
// Bulk upsert for external jobs
// --------------------
export async function upsertExternalJobs(externalJobs) {
  if (!externalJobs.length) return;

  const ops = externalJobs
    .filter((j) => j.jobId)
    .map((j) => ({
      updateOne: {
        filter: { jobId: j.jobId, origin: 'EXTERNAL' },
        update: {
          $set: {
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
          },
          $addToSet: {
            tags: { $each: Array.isArray(j.tags) ? j.tags : [] },
            queries: { $each: Array.isArray(j.queries) ? j.queries : [] },
          },
          $setOnInsert: { slug: j.slug || makeSlug(j.title) },
        },
        upsert: true,
      },
    }));

  if (!ops.length) return;

  try {
    await Job.bulkWrite(ops, { ordered: false });
  } catch (e) {
    const dupesOnly =
      e?.writeErrors &&
      Array.isArray(e.writeErrors) &&
      e.writeErrors.every((w) => w?.code === 11000);
    if (!dupesOnly) throw e;
  }
}

// --------------------
// External query builder & scoring
// --------------------
export function buildExternalQueries(titles, skills) {
  const titleQueries = titles.slice(0, 3);
  const topSkills = skills.slice(0, 3);
  const combos = [];

  for (const t of titleQueries) {
    if (topSkills.length) combos.push(`${t} ${topSkills[0]}`);
    combos.push(t);
  }
  if (!combos.length && topSkills.length) combos.push(topSkills.join(' '));

  const seen = new Set();
  return combos.filter((q) => {
    const key = q.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function scoreJob(job, profile) {
  let score = 0;

  const jobText = [
    job.title || '',
    job.description || '',
    Array.isArray(job.qualifications) ? job.qualifications.join(' ') : '',
    ...(Array.isArray(job.tags) ? job.tags : []),
  ]
    .join(' ')
    .toLowerCase();

  const skills = Array.isArray(profile.skills)
    ? profile.skills.map((s) => s.toLowerCase())
    : [];

  let skillHits = 0;
  for (const s of skills) {
    if (!s) continue;
    if (jobText.includes(s)) skillHits++;
  }
  score += Math.min(skillHits * 5, 40);

  if (!profile._titleRegexes) {
    const titles = Array.isArray(profile.titles) ? profile.titles : [];
    profile._titleRegexes = titles
      .map((t) => safeRegex(t))
      .filter((re) => !!re);
  }

  if (
    Array.isArray(profile._titleRegexes) &&
    profile._titleRegexes.some((re) => re.test(job.title || ''))
  ) {
    score += 20;
  }

  if (profile.isRemote && job.remote) score += 10;

  if (
    profile.minYearly &&
    job?.salary?.min &&
    job.salary.min >= profile.minYearly
  ) {
    score += 10;
  }

  return score;
}

// --------------------
// Sort helper
// --------------------
export function sortJobsByPostedDateDesc(jobs = []) {
  return [...jobs].sort((a, b) => {
    const aDate = a.jobPostedAt || a.createdAt;
    const bDate = b.jobPostedAt || b.createdAt;

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return new Date(bDate) - new Date(aDate);
  });
}

export const safeParseInt = (v, fallback = 0) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

export const isObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id);
  } catch (e) {
    return false;
  }
};

export const makeSearchCacheKey = (params) => {
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

