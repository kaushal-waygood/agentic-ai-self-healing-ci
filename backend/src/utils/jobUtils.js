// src/utils/jobUtils.js
import axios from 'axios';
import slugify from 'slugify';
import { config } from '../config/config.js';
import { Job } from '../models/jobs.model.js';

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9+.# ]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

const PERIOD_TO_YEAR = { HOUR: 2080, DAY: 260, WEEK: 52, MONTH: 12, YEAR: 1 };

const normalizePeriod = (p) => {
  if (!p) return 'YEAR';
  const up = String(p).toUpperCase();
  if (PERIOD_TO_YEAR[up]) return up;
  if (up.includes('HOURL')) return 'HOUR';
  if (up.includes('DAIL')) return 'DAY';
  if (up.includes('WEEK')) return 'WEEK';
  if (up.includes('MONTH')) return 'MONTH';
  if (up.includes('YEAR')) return 'YEAR';
  return 'YEAR';
};

const makeSlug = (title) =>
  `${slugify(title || 'job', {
    lower: true,
    strict: true,
    trim: true,
  })}-${Math.random().toString(36).slice(2, 7)}`;

// lightweight fallbacks if API lacks highlights
const extractExperienceFromDescription = (text) => {
  const t = norm(text);
  const m = t.match(/(\d+)\s*\+?\s*(year|yr)/);
  return m ? [`${m[1]}+ years`] : [];
};
const extractQualificationsFromDescription = (text) => {
  const t = String(text || '');
  const lines = t
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  return lines
    .filter(
      (l) => /^-|\*|\u2022/.test(l) || /qualification|requirement/i.test(l),
    )
    .slice(0, 12);
};
const extractResponsibilitiesFromDescription = (text) => {
  const t = String(text || '');
  const lines = t
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  return lines
    .filter((l) => /^-|\*|\u2022/.test(l) || /responsibilit/i.test(l))
    .slice(0, 12);
};

export const convertSalaryToYearly = (amount, period = 'YEAR') => {
  if (amount == null) return null;
  const p = normalizePeriod(period);
  return Number(amount) * PERIOD_TO_YEAR[p];
};

export const calculateMatchScore = (job, student) => {
  try {
    const W = {
      title: 35,
      must: 25,
      skills: 20,
      salary: 10,
      type: 5,
      remote: 5,
    };
    let score = 0,
      max = 0;

    const title = norm(job?.title);
    const desc = norm(job?.description);
    const jobSignals = new Set(
      uniq([
        ...toArray(job?.qualifications).map(norm),
        ...toArray(job?.responsibilities).map(norm),
        ...toArray(job?.tags).map(norm),
        ...title.split(' ').filter(Boolean),
        ...desc.split(' ').filter(Boolean),
      ]),
    );

    const prefs = student?.jobPreferences || {};

    // Title relevance: preferred titles + role
    const titleNeedles = uniq([
      ...(prefs?.preferredJobTitles || []),
      student?.jobRole,
    ])
      .filter(Boolean)
      .map(norm);
    const titleHit = titleNeedles.some(
      (t) => title.includes(t) || jobSignals.has(t),
    );
    score += titleHit ? W.title : 0;
    max += W.title;

    // Must-have skills
    const mustSkills = uniq([
      ...(prefs?.mustHaveSkills || []).map((s) => s?.skill),
    ])
      .filter(Boolean)
      .map(norm);

    const studentSkills = uniq([
      ...(student?.skills || []).map((s) => s?.skill),
    ])
      .filter(Boolean)
      .map(norm);

    const mustHits = mustSkills.filter(
      (m) =>
        jobSignals.has(m) ||
        [...jobSignals].some((js) => js.includes(m) || m.includes(js)),
    ).length;
    const mustScore = mustSkills.length
      ? (mustHits / mustSkills.length) * W.must
      : 0;
    score += mustScore;
    max += W.must;

    // General skills (lenient)
    const skillHits = studentSkills.filter(
      (s) =>
        jobSignals.has(s) ||
        [...jobSignals].some((js) => js.includes(s) || s.includes(js)),
    ).length;
    const denom = Math.max(6, studentSkills.length || 1);
    score += (skillHits / denom) * W.skills;
    max += W.skills;

    // Employment type
    const preferredTypes = (prefs?.preferredJobTypes || []).map(norm);
    const jobTypes = (job?.jobTypes || []).map(norm);
    const typeHit =
      preferredTypes.length === 0 ||
      jobTypes.some((t) => preferredTypes.includes(t));
    score += typeHit ? W.type : 0;
    max += W.type;

    // Remote preference
    const wantsRemote = !!prefs?.isRemote;
    const remoteOk = wantsRemote ? !!job?.isRemote : true;
    score += remoteOk ? W.remote : 0;
    max += W.remote;

    // Salary fit (neutral if missing)
    const prefMin = prefs?.preferredSalary?.min ?? null;
    const prefPeriod = prefs?.preferredSalary?.period || 'YEAR';
    if (prefMin != null) {
      const prefMinYear = convertSalaryToYearly(prefMin, prefPeriod);
      const jobMinYear =
        job?.salary?.min != null
          ? convertSalaryToYearly(job.salary.min, job.salary.period || 'YEAR')
          : null;
      const salOK = jobMinYear == null || jobMinYear >= prefMinYear;
      score += salOK ? W.salary : 0;
      max += W.salary;
    } else {
      score += W.salary;
      max += W.salary;
    }

    const final = max > 0 ? Math.round((score / max) * 100) : 0;
    console.log(`   Final Score: ${final}/100`);
    return final;
  } catch (err) {
    console.error('❌ Error in calculateMatchScore:', err);
    return 0;
  }
};

// Optional REST util you already had, now aligned.
// Keep it if you’re using the REST route; otherwise ignore.
export async function getFallbackJobsFromRapidAPI(req, res, preferencesRaw) {
  try {
    const preferences = preferencesRaw || {};
    const preferredJobTitles = preferences.preferredJobTitles || [];
    const mustHaveSkills = preferences.mustHaveSkills || [];
    const isRemote = !!preferences.isRemote;
    const preferredCountries = preferences.preferredCountries || [];
    const preferredCities = preferences.preferredCities || [];

    const qp = [];
    if (preferredJobTitles.length)
      qp.push(`(${preferredJobTitles.join(' OR ')})`);
    if (mustHaveSkills.length)
      qp.push(
        `(${mustHaveSkills
          .map((s) => s.skill)
          .filter(Boolean)
          .join(' OR ')})`,
      );
    if (!isRemote && (preferredCountries.length || preferredCities.length)) {
      const locs = uniq([...preferredCountries, ...preferredCities]);
      qp.push(`location:(${locs.join(' OR ')})`);
    }
    const query = qp.join(' AND ') || 'Software Engineer';

    const page = parseInt(req?.query?.page || 1, 10);
    const limit = parseInt(req?.query?.limit || 10, 10);

    const response = await axios.get(config.rapidJobApi, {
      params: { query, page, num_pages: 20 },
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    const externalJobs = response?.data?.data || [];
    const upserted = [];

    for (const j of externalJobs) {
      const jobId = j.job_id;
      if (!jobId) continue;

      const jobTypes = uniq([
        ...toArray(j.job_employment_types),
        ...(j.job_employment_type ? [j.job_employment_type] : []),
      ])
        .filter(Boolean)
        .map(String);

      const salaryPeriod = normalizePeriod(j.job_salary_period);
      const qualifications = toArray(j.job_highlights?.Qualifications)
        .flat()
        .filter(Boolean);
      const responsibilities = toArray(j.job_highlights?.Responsibilities)
        .flat()
        .filter(Boolean);

      const doc = {
        jobId,
        origin: 'EXTERNAL',
        slug: makeSlug(j.job_title || 'job'),
        title: j.job_title || 'Untitled role',
        description: j.job_description || '',
        company: j.employer_name || 'Unknown company',
        logo: j.employer_logo || undefined,
        jobTypes,
        qualifications: qualifications.length
          ? qualifications
          : extractQualificationsFromDescription(j.job_description),
        responsibilities: responsibilities.length
          ? responsibilities
          : extractResponsibilitiesFromDescription(j.job_description),
        experience: extractExperienceFromDescription(j.job_description),
        isRemote: !!j.job_is_remote,
        salary:
          j.job_min_salary != null || j.job_max_salary != null
            ? {
                min:
                  j.job_min_salary != null
                    ? Number(j.job_min_salary)
                    : undefined,
                max:
                  j.job_max_salary != null
                    ? Number(j.job_max_salary)
                    : undefined,
                period: salaryPeriod,
              }
            : undefined,
        country: j.job_country || '',
        location: {
          city: j.job_city || '',
          state: j.job_state || '',
          postalCode: j.job_postal_code || '',
          lat: j.job_latitude != null ? Number(j.job_latitude) : undefined,
          lng: j.job_longitude != null ? Number(j.job_longitude) : undefined,
        },
        applyMethod: { method: 'URL', url: j.job_apply_link || '' },
        postedAt: j.job_posted_at_timestamp
          ? new Date(j.job_posted_at_timestamp * 1000)
          : new Date(),
        tags: j.job_benefits || [],
        queries: [query],
        isActive: true,
      };

      const saved = await Job.findOneAndUpdate(
        { jobId },
        { $set: doc, $addToSet: { queries: query } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean();

      upserted.push(saved);
    }

    const jobsWithScores = upserted
      .map((job) => ({
        ...job,
        matchScore: calculateMatchScore(job, { jobPreferences: preferences }),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    const paginated = jobsWithScores.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      success: true,
      jobs: paginated,
      pagination: {
        total: jobsWithScores.length,
        page,
        limit,
        totalPages: Math.ceil(jobsWithScores.length / limit) || 0,
      },
      source: 'external',
      message: jobsWithScores.length
        ? 'Showing external job listings that match your preferences'
        : 'No matching jobs found in our database or external sources',
    });
  } catch (error) {
    const page = parseInt(req?.query?.page || 1, 10);
    const limit = parseInt(req?.query?.limit || 10, 10);
    console.error(
      'Error fetching fallback jobs from RapidAPI:',
      error?.message || error,
    );
    return res.status(200).json({
      success: true,
      jobs: [],
      pagination: { total: 0, page, limit, totalPages: 0 },
      source: 'none',
      message:
        'No matching jobs found. Try adjusting your preferences or check back later.',
    });
  }
}
