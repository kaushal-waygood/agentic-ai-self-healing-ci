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

const hashText = (t) => crypto.createHash('sha256').update(t).digest('hex');

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

    // Only append location in query
    if (city) query += ` ${city}`;
    else if (state) query += ` ${state}`;

    const params = {
      query,
      page: String(page),
    };

    console.log('RapidAPI params:', params);

    const response = await axios.get(config.rapidJobApi, {
      params,
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    console.log(
      'RapidAPI response:',
      JSON.stringify(response.data).slice(0, 300),
    );

    return (
      response?.data?.data ||
      response?.data?.jobs ||
      response?.data?.results ||
      []
    );
  } catch (e) {
    console.error('RapidAPI error:', e?.response?.data || e.message);
    return [];
  }
}

export async function fetchExternalJobsCached(
  apiQuery,
  country = 'IN',
  state,
  city,
  datePosted,
  employmentType,
  experience,
  page = 1,
  ttlMs = 15 * 60 * 1000,
) {
  console.log('Fetching external jobs:', apiQuery, country, state, city);
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

  console.log('Fetched external jobs:', data.length);

  externalJobCache.set(key, {
    data,
    expiresAt: now + ttlMs,
  });

  return data;
}

// --------------------
// Bulk upsert for external jobs
// --------------------
// src/utils/jobHelpers.js

async function getExistingExternalJobMap(jobIds = []) {
  if (!jobIds.length) return {};

  const existing = await Job.find(
    { jobId: { $in: jobIds }, origin: 'EXTERNAL' },
    { jobId: 1, embeddingHash: 1 },
  ).lean();

  return Object.fromEntries(existing.map((j) => [j.jobId, j.embeddingHash]));
}

export async function upsertExternalJobs(externalJobs) {
  if (!externalJobs.length) return;

  const jobIds = externalJobs.map((j) => j.jobId);
  const existingMap = await getExistingExternalJobMap(jobIds);

  const ops = [];

  for (const j of externalJobs) {
    if (!j.jobId) continue;

    const textToEmbed = `
Title: ${j.title}
Description: ${j.description}
Skills: ${j.qualifications?.join(', ')}
Company: ${j.company}
`.trim();

    const embeddingHash = hashText(textToEmbed);

    let vector;

    if (!existingMap[j.jobId] || existingMap[j.jobId] !== embeddingHash) {
      vector = await generateEmbedding(textToEmbed);
    }

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
    };

    if (vector) updateDoc.job_embedding = vector;

    ops.push({
      updateOne: {
        filter: { jobId: j.jobId, origin: 'EXTERNAL' },
        update: {
          $set: updateDoc,
          $addToSet: {
            tags: { $each: Array.isArray(j.tags) ? j.tags : [] },
            queries: { $each: Array.isArray(j.queries) ? j.queries : [] },
          },
          $setOnInsert: { slug: j.slug || makeSlug(j.title) },
        },
        upsert: true,
      },
    });
  }

  const result = await Job.bulkWrite(ops, { ordered: false });

  console.log(
    'External jobs inserted:',
    result.upsertedCount,
    'updated:',
    result.modifiedCount,
  );
}

// --------------------
// External query builder & scoring
// --------------------
export function buildExternalQueries(titles = [], skills = []) {
  const queries = new Set();

  // Only job titles
  titles.slice(0, 3).forEach((t) => {
    if (t && t.length < 40) {
      queries.add(t.toLowerCase());
    }
  });

  // Optional hard skills only
  const HARD_SKILLS = [
    'python',
    'java',
    'react',
    'node',
    'sales',
    'accounting',
    'data',
  ];

  skills.slice(0, 3).forEach((s) => {
    if (HARD_SKILLS.includes(s.toLowerCase())) {
      titles.forEach((t) => {
        queries.add(`${t} ${s}`);
      });
    }
  });

  return Array.from(queries);
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

export async function getCTRMap(jobIds) {
  const stats = await JobInteraction.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    {
      $group: {
        _id: '$jobId',
        impressions: {
          $sum: { $cond: [{ $eq: ['$action', 'impression'] }, 1, 0] },
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$action', 'click'] }, 1, 0] },
        },
        applies: {
          $sum: { $cond: [{ $eq: ['$action', 'apply'] }, 1, 0] },
        },
      },
    },
  ]);

  const map = {};
  for (const s of stats) {
    const ctr = s.impressions > 0 ? s.clicks / s.impressions : 0;
    map[s._id.toString()] = Math.log(1 + ctr + s.applies * 3);
  }
  return map;
}

function isRelevantJob(jobTitle, profileTitles = []) {
  if (!jobTitle) return false;

  const jt = jobTitle.toLowerCase();

  return profileTitles.some((t) => jt.includes(t.toLowerCase()));
}

export async function getJobViewsMap(jobIds = []) {
  if (!jobIds.length) return {};

  const stats = await JobInteraction.aggregate([
    {
      $match: {
        job: { $in: jobIds },
        type: 'VIEW',
      },
    },
    {
      $group: {
        _id: '$job',
        views: { $sum: 1 },
      },
    },
  ]);

  return Object.fromEntries(stats.map((s) => [s._id.toString(), s.views]));
}

export async function getLocalRecommendedJobs(profile) {
  const prefs = profile.jobPreferences || {};

  const skills = profile.skills || [];
  const titles = profile.titles || [];

  const appliedJobIds =
    profile.appliedJobs?.map((j) => j.job).filter(Boolean) || [];

  const loc = profile.location || {};
  const userLat = loc.lat;
  const userLng = loc.lng;

  const city = loc.city?.toLowerCase();
  const state = loc.state?.toLowerCase();
  const country = loc.country;

  // ---------- BASE QUERY ----------
  const query = { isActive: true };

  if (appliedJobIds.length) {
    query._id = { $nin: appliedJobIds };
  }

  // ---------- LOCATION FILTER ----------
  if (country) {
    query.$or = [{ country }, { remote: true }];
  }

  // ---------- SKILLS + TITLES ----------
  const skillOr = [];

  if (skills.length) {
    skillOr.push(
      { skills: { $in: skills } },
      { mustHaveSkills: { $in: skills } },
    );
  }

  if (titles.length) {
    titles.forEach((t) => {
      skillOr.push({ title: { $regex: t, $options: 'i' } });
    });
  }

  if (skillOr.length) {
    query.$and = [{ $or: skillOr }];
  }

  // ---------- FETCH ----------
  let jobs = await Job.find(query).sort({ jobPostedAt: -1 }).limit(250).lean();

  if (!jobs.length) return [];

  // ---------- CTR BOOST ----------
  const ctrMap = await getCTRMap(jobs.map((j) => j._id));

  // ---------- JOB VIEWS ----------
  const jobViewsMap = await getJobViewsMap(jobs.map((j) => j._id));

  // ---------- GEO ----------
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const locationDecay = (job) => {
    if (job.remote) return 0.15;

    const jc = job.location?.city?.toLowerCase();
    const js = job.location?.state?.toLowerCase();
    const jco = job.country?.toLowerCase();

    if (city && jc === city) return 0.35;
    if (state && js === state) return 0.25;
    if (country && jco === country.toLowerCase()) return 0.1;

    return 0;
  };

  // ---------- SKILL MATCH ----------
  const skillScore = (jobSkills = []) => {
    if (!jobSkills.length || !skills.length) return 0;

    const matches = jobSkills.filter((s) => skills.includes(s)).length;

    return matches / jobSkills.length;
  };

  // ---------- FINAL RANK ----------
  jobs = jobs.map((job) => {
    let geoBoost = 0;

    if (userLat && userLng && job.location?.lat && job.location?.lng) {
      const km = haversineKm(
        userLat,
        userLng,
        job.location.lat,
        job.location.lng,
      );

      if (km <= 200) {
        geoBoost = Math.max(0, 1 - km / 200);
      }
    }

    const locBoost = locationDecay(job);

    const ctr = ctrMap[job._id.toString()] || 0;
    const views = jobViewsMap[job._id.toString()] || 0;

    const skillMatch = skillScore(job.skills || job.mustHaveSkills) * 0.5;

    return {
      ...job,
      jobViews: views,
      finalScore:
        ctr +
        geoBoost * 0.3 +
        locBoost +
        skillMatch +
        Math.log(views + 1) * 0.05, // popularity
    };
  });

  // ---------- HUMAN SORT ----------
  jobs.sort((a, b) => {
    const aLoc = locationDecay(a);
    const bLoc = locationDecay(b);

    if (aLoc !== bLoc) return bLoc - aLoc;
    return b.finalScore - a.finalScore;
  });

  return jobs;
}

export async function fetchAndUpsertMoreExternalJobs(profile) {
  try {
    const queries = buildExternalQueries(profile.titles, profile.skills);

    if (!queries.length) return;

    const city = profile.location?.city;
    const state = profile.location?.state;

    const results = await Promise.allSettled(
      queries.map((q) => fetchExternalJobsCached(q, 'IN', state, city)),
    );

    const allExternalJobs = [];

    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        r.value.forEach((apiJob) => {
          const job = transformRapidApiJob(apiJob, queries[i]);

          // ---------- RELEVANCE FILTER ----------
          if (!isRelevantJob(job.title, profile.titles)) return;

          allExternalJobs.push(job);
        });
      }
    });

    if (!allExternalJobs.length) {
      console.log('No relevant external jobs found.');
      return;
    }

    const deduped = dedupeByTitleCompany(allExternalJobs);

    await upsertExternalJobs(deduped);
  } catch (err) {
    console.error('External sync failed:', err);
  }
}

async function getFallbackJobs(profile, excludeIds, limit = 50) {
  const titles = profile.titles || [];

  const titleRegex = titles.map((t) => ({
    title: { $regex: t, $options: 'i' },
  }));

  const query = {
    isActive: true,
    _id: { $nin: excludeIds },
    origin: 'EXTERNAL',
  };

  if (titleRegex.length) {
    query.$or = titleRegex;
  }

  return Job.find(query).sort({ jobPostedAt: -1 }).limit(limit).lean();
}

function getTimeBucket(intervalMinutes = 10) {
  return Math.floor(Date.now() / (intervalMinutes * 60 * 1000));
}

export async function getTop4DashboardJobs(profile) {
  const userId = profile.userId || profile._id;
  if (!userId) throw new Error('User ID missing for dashboard jobs');

  const bucket = getTimeBucket(10); // rotates every 10 min
  const cacheKey = makeTop4Key(userId.toString(), bucket);

  // ---------- 1️⃣ Redis first ----------
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // ---------- 2️⃣ Get high-quality pool ----------
  const allJobs = await getLocalRecommendedJobs(profile);

  if (!allJobs.length) return [];

  // Take only top 30 relevant jobs
  const pool = allJobs.slice(0, 30);

  // ---------- 3️⃣ Stable shuffle ----------
  const shuffled = stableShuffle(pool, `${userId}:${bucket}`);

  const top4 = shuffled.slice(0, 4);

  // ---------- 4️⃣ Cache briefly ----------
  await redisClient.set(
    cacheKey,
    JSON.stringify(top4),
    600, // 10 minutes
  );

  return top4;
}
