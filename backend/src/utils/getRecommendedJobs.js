// src/utils/getRecommendedJobs.js
import mongoose from 'mongoose';
import axios from 'axios';
import slugify from 'slugify';
import { Student } from '../models/student.model.js';
import { Job } from '../models/jobs.model.js';
import { calculateMatchScore, convertSalaryToYearly } from './jobUtils.js';
import { config } from '../config/config.js';

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const mapSalaryPeriod = (p) => {
  if (!p) return 'YEAR';
  const up = String(p).toUpperCase();
  if (['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'].includes(up)) return up;
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

const extractEmails = (text) => {
  if (!text) return [];
  const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  return (text.match(re) || []).map((e) => e.trim());
};

const generateSearchTerms = (student) => {
  const terms = new Set();
  if (student.jobRole) terms.add(student.jobRole);
  student.skills?.forEach((s) => s?.skill && terms.add(s.skill));
  student.experience?.forEach((exp) => {
    if (exp?.title) terms.add(exp.title);
    if (exp?.designation) terms.add(exp.designation);
  });
  student.education?.forEach((edu) => {
    if (edu?.fieldOfStudy) terms.add(edu.fieldOfStudy);
    if (edu?.degree) terms.add(edu.degree);
  });
  student.jobPreferences?.mustHaveSkills?.forEach(
    (s) => s?.skill && terms.add(s.skill),
  );
  return Array.from(terms).join(' ');
};

// transform RapidAPI job to our Job schema
const transformApiJobToSchema = (apiJob) => {
  if (!apiJob || !apiJob.job_id) return null;

  const min =
    apiJob.job_min_salary != null ? Number(apiJob.job_min_salary) : undefined;
  const maxRaw =
    apiJob.job_max_salary != null ? Number(apiJob.job_max_salary) : undefined;
  const max = maxRaw ?? min;
  const title = apiJob.job_title || 'No title provided';

  // collect possible emails
  const emails = new Set();

  // mailto in apply link
  if (
    apiJob.job_apply_link &&
    apiJob.job_apply_link.toLowerCase().startsWith('mailto:')
  ) {
    const raw = apiJob.job_apply_link.replace(/^mailto:/i, '');
    emails.add(raw.split('?')[0].trim());
  }

  // from description
  extractEmails(apiJob.job_description).forEach((e) => emails.add(e));

  // from highlights
  const hiTxt = [
    ...(toArray(apiJob.job_highlights?.Qualifications) || []),
    ...(toArray(apiJob.job_highlights?.Responsibilities) || []),
  ]
    .flat()
    .filter(Boolean)
    .join('\n');
  extractEmails(hiTxt).forEach((e) => emails.add(e));

  // build apply method preferring EMAIL when found
  let applyMethod = { method: 'URL', url: apiJob.job_apply_link || '' };
  const firstEmail = [...emails][0];
  if (firstEmail) {
    applyMethod = {
      method: 'EMAIL',
      email: firstEmail,
      url: apiJob.job_apply_link || '',
    };

    if (process.env.DEBUG_JOBS === '1') {
      console.log('[ApplyEmail]', title, '->', firstEmail);
    }
  }

  return {
    jobId: apiJob.job_id,
    origin: 'EXTERNAL',
    slug: makeSlug(title),
    title,
    description: apiJob.job_description || '',
    company: apiJob.employer_name || 'Unknown company',
    isRemote: Boolean(apiJob.job_is_remote),
    country: apiJob.job_country || '',
    location: {
      city: apiJob.job_city || '',
      state: apiJob.job_state || '',
    },
    salary:
      min != null || max != null
        ? { min, max, period: mapSalaryPeriod(apiJob.job_salary_period) }
        : undefined,
    applyMethod,
    jobTypes: toArray(apiJob.job_employment_type?.toUpperCase?.()),
    experience:
      apiJob.job_required_experience?.required_experience_in_months != null
        ? [
            `${Math.floor(
              apiJob.job_required_experience.required_experience_in_months / 12,
            )}+ years`,
          ]
        : [],
    postedAt: apiJob.job_posted_at_timestamp
      ? new Date(apiJob.job_posted_at_timestamp * 1000)
      : new Date(),
    qualifications: toArray(apiJob.job_highlights?.Qualifications).flat(),
    responsibilities: toArray(apiJob.job_highlights?.Responsibilities).flat(),
    tags: toArray(apiJob.job_highlights?.Responsibilities).flat(),
    isActive: true,
  };
};

const buildApiQuery = (agentConfig, student, searchString) => {
  const role = String(
    agentConfig.jobTitle || student.jobRole || '',
  ).toLowerCase();
  const teachingTitles = [
    'Web Development Instructor',
    'Coding Instructor',
    'Programming Instructor',
    'Web Development Trainer',
    'Coding Teacher',
    'Lecturer',
    'Faculty',
  ];
  if (
    role.includes('teach') ||
    role.includes('instructor') ||
    role.includes('trainer')
  ) {
    return `(${teachingTitles.join(
      ' OR ',
    )}) AND (HTML OR CSS OR JavaScript OR React OR Node)`;
  }
  return (
    agentConfig.jobTitle ||
    student.jobRole ||
    searchString ||
    'Software Engineer'
  );
};

export const getRecommendedJobs = async ({
  studentId,
  agentConfig = {},
  studentProfile,
  appliedJobIds = [],
  limit = 50,
}) => {
  console.log(
    `🔍 [getRecommendedJobs] Fetching recommended jobs for student ${studentId}`,
  );

  const student = studentProfile || (await Student.findById(studentId).lean());
  if (!student) throw new Error('Student not found');

  const searchString = generateSearchTerms(student);
  const preferences = student.jobPreferences || {};

  // Build filter from agentConfig
  const filter = { isActive: true };
  if (agentConfig.country) filter.country = agentConfig.country;
  if (agentConfig.isRemote) filter.isRemote = true;
  if (agentConfig.employmentType)
    filter.jobTypes = { $in: [agentConfig.employmentType] };
  if (agentConfig.jobTitle)
    filter.title = { $regex: agentConfig.jobTitle, $options: 'i' };

  if (appliedJobIds?.length) filter._id = { $nin: appliedJobIds };
  if (searchString) filter.$text = { $search: searchString };

  // Preferences
  if (preferences.isRemote) filter.isRemote = true;
  if (preferences.preferredCountries?.length)
    filter.country = { $in: preferences.preferredCountries };
  if (preferences.preferredJobTypes?.length) {
    if (!filter.jobTypes) filter.jobTypes = { $in: [] };
    const existing = filter.jobTypes.$in || [];
    filter.jobTypes.$in = [
      ...new Set([...existing, ...preferences.preferredJobTypes]),
    ];
  }
  if (preferences.preferredSalary?.min != null) {
    const minSalary = convertSalaryToYearly(
      preferences.preferredSalary.min,
      preferences.preferredSalary.period,
    );
    filter['salary.min'] = { $gte: minSalary };
  }

  // Query local
  let query = Job.find(filter);
  if (filter.$text) {
    query = query
      .select({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } });
  } else {
    query = query.sort({ postedAt: -1, createdAt: -1 });
  }
  let finalJobs = await query.limit(limit).lean();

  // Optional: show local titles
  if (process.env.DEBUG_JOBS === '1') {
    console.log(
      '[Local Titles]',
      finalJobs.map(
        (j) => `${j.title} @ ${j.company} [${j.origin || 'HOSTED'}]`,
      ),
    );
  }

  // Fallback to API
  if (finalJobs.length < limit) {
    const apiQuery = buildApiQuery(agentConfig, student, searchString);
    if (apiQuery) {
      console.log(
        `Found ${finalJobs.length} local jobs. Querying API for ${
          limit - finalJobs.length
        } more with query: "${apiQuery}"`,
      );
      try {
        const apiResponse = await axios.get(config.rapidJobApi, {
          params: { query: apiQuery, num_pages: 1 },
          headers: {
            'X-RapidAPI-Key': config.rapidApiKey,
            'X-RapidAPI-Host': config.rapidApiHost,
          },
        });

        const apiJobsData = apiResponse?.data?.data || [];

        if (process.env.DEBUG_JOBS === '1') {
          console.log(
            '[API Raw Titles]',
            apiJobsData.map((x) => `${x.job_title} @ ${x.employer_name}`),
          );
        }

        const transformed = apiJobsData
          .map(transformApiJobToSchema)
          .filter(Boolean);

        if (process.env.DEBUG_JOBS === '1') {
          console.log(
            '[API Transformed Titles]',
            transformed.map((x) => `${x.title} @ ${x.company}`),
          );
        }

        if (transformed.length) {
          const operations = transformed.map((job) => ({
            updateOne: {
              filter: { jobId: job.jobId },
              update: { $set: job },
              upsert: true,
            },
          }));
          const result = await Job.bulkWrite(operations);
          console.log(
            '[API Upsert]',
            'matched:',
            result.matchedCount,
            'modified:',
            result.modifiedCount,
            'upserted:',
            result.upsertedCount,
          );

          const saved = await Job.find({
            jobId: { $in: transformed.map((j) => j.jobId) },
          }).lean();
          const existingIds = new Set(finalJobs.map((j) => String(j._id)));
          const extra = saved.filter((j) => !existingIds.has(String(j._id)));
          finalJobs = [...finalJobs, ...extra].slice(0, limit);

          if (process.env.DEBUG_JOBS === '1') {
            console.log(
              '[Local+API Combined]',
              finalJobs.map(
                (j) => `${j.title} @ ${j.company} [${j.origin || 'HOSTED'}]`,
              ),
            );
          }
        }
      } catch (e) {
        console.error(`Failed to fetch jobs from external API: ${e.message}`);
      }
    }
  }

  // Score and return
  const jobsWithScores = finalJobs.map((job) => ({
    job,
    score: calculateMatchScore(job, student),
  }));

  if (process.env.DEBUG_JOBS === '1') {
    const preview = jobsWithScores
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(20, jobsWithScores.length))
      .map(({ job, score }) => ({
        id: String(job._id || ''),
        origin: job.origin || 'HOSTED',
        title: job.title,
        company: job.company || '',
        country: job.country || '',
        city: job.location?.city || '',
        type: (job.jobTypes || []).join(','),
        isRemote: !!job.isRemote,
        score,
      }));
    console.log('[Recommended Preview]', preview);
  }

  return jobsWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.job);
};
