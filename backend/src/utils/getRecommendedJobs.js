// src/utils/getRecommendedJobs.js
import mongoose from 'mongoose';
import axios from 'axios';
import { Student } from '../models/student.model.js';
import { Job } from '../models/jobs.model.js';
import {
  calculateMatchScore,
  convertSalaryToYearly,
} from '../utils/jobUtils.js';
import { config } from '../config/config.js';

// --- (generateSearchTerms and transformApiJobToSchema functions remain the same) ---
const generateSearchTerms = (student) => {
  const terms = new Set();

  if (student.jobRole) terms.add(student.jobRole);
  student.skills?.forEach((s) => terms.add(s.skill));
  student.experience?.forEach((exp) => {
    if (exp.title) terms.add(exp.title);
    if (exp.designation) terms.add(exp.designation);
  });
  student.education?.forEach((edu) => {
    if (edu.fieldOfStudy) terms.add(edu.fieldOfStudy);
    if (edu.degree) terms.add(edu.degree);
  });
  student.jobPreferences?.mustHaveSkills?.forEach((s) => terms.add(s.skill));

  return Array.from(terms).join(' ');
};

const transformApiJobToSchema = (apiJob) => {
  if (!apiJob || !apiJob.job_id) return null;

  return {
    title: apiJob.job_title || 'No title provided',
    description: apiJob.job_description || '',
    company: apiJob.employer_name || 'Unknown company',
    isRemote: apiJob.job_is_remote || false,
    country: apiJob.job_country || '',
    location: {
      city: apiJob.job_city || '',
      state: apiJob.job_state || '',
    },
    salary: apiJob.job_min_salary
      ? {
          min: Number(apiJob.job_min_salary),
          max: Number(apiJob.job_max_salary || apiJob.job_min_salary),
          period: apiJob.job_salary_period || 'YEAR',
          currency: apiJob.job_salary_currency || 'USD',
        }
      : null,
    applyMethod: {
      method: 'URL',
      url: apiJob.job_apply_link || '',
    },
    jobTypes: apiJob.job_employment_type
      ? [apiJob.job_employment_type.toUpperCase()]
      : ['FULL_TIME'],
    experience: apiJob.job_required_experience?.required_experience_in_months
      ? Math.floor(
          apiJob.job_required_experience.required_experience_in_months / 12,
        )
      : 0,
    postedAt: apiJob.job_posted_at_timestamp
      ? new Date(apiJob.job_posted_at_timestamp * 1000)
      : new Date(),
    source: 'api',
    isActive: true,
    qualifications: apiJob.job_highlights?.Qualifications?.join('\n') || '',
    tags: apiJob.job_highlights?.Responsibilities || [],
    jobId: apiJob.job_id,
  };
};

export const getRecommendedJobs = async ({
  studentId,
  agentConfig,
  studentProfile,
  appliedJobIds,
  limit = 50,
}) => {
  console.log(
    `🔍 [getRecommendedJobs] Fetching recommended jobs for student ${studentId}`,
  );
  try {
    const student =
      studentProfile || (await Student.findById(studentId).lean());
    if (!student) throw new Error('Student not found');

    const searchString = generateSearchTerms(student);
    const preferences = student.jobPreferences || {};
    const filter = { isActive: true, ...agentConfig };

    if (appliedJobIds.length > 0) {
      filter._id = {
        $nin: appliedJobIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (searchString) {
      filter.$text = { $search: searchString };
    }

    if (preferences.isRemote) filter.isRemote = true;
    if (preferences.preferedCountries?.length)
      filter.country = { $in: preferences.preferedCountries };
    if (preferences.preferedJobTypes?.length)
      filter.jobTypes = { $in: preferences.preferedJobTypes };
    if (preferences.preferedSalary?.min) {
      const minSalary = convertSalaryToYearly(
        preferences.preferedSalary.min,
        preferences.preferedSalary.period,
      );
      filter['salary.min'] = { $gte: minSalary };
    }

    let query = Job.find(filter);

    if (filter.$text) {
      query = query
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
    } else {
      query = query.sort({ postedAt: -1 });
    }

    const mongoJobs = await query.limit(limit).lean();
    let finalJobs = mongoJobs;

    if (finalJobs.length < limit) {
      const apiQuery = agentConfig.jobTitle;

      // ✨ FIX 2: Check if apiQuery has a value before making the call
      if (apiQuery) {
        console.log(
          `Found ${finalJobs.length} local jobs. Querying API for ${
            limit - finalJobs.length
          } more with query: "${apiQuery}"`,
        );
        try {
          const apiResponse = await axios.get(config.rapidJobApi, {
            params: { query: apiQuery, num_pages: 1 }, // Use the defined variable
            headers: {
              'X-RapidAPI-Key': config.rapidApiKey,
              'X-RapidAPI-Host': config.rapidApiHost,
            },
          });

          const apiJobsData = apiResponse.data.data || [];
          if (apiJobsData.length > 0) {
            const transformedJobs = apiJobsData
              .map(transformApiJobToSchema)
              .filter(Boolean);

            const operations = transformedJobs.map((job) => ({
              updateOne: {
                filter: { externalId: job.externalId },
                update: { $set: job },
                upsert: true,
              },
            }));

            if (operations.length > 0) {
              await Job.bulkWrite(operations);
              console.log(`Upserted ${operations.length} jobs from the API.`);
            }

            const existingIds = new Set(finalJobs.map((j) => j.externalId));
            const newUniqueApiJobs = transformedJobs.filter(
              (j) => !existingIds.has(j.jobId),
            );
            finalJobs = [...finalJobs, ...newUniqueApiJobs];
          }
        } catch (apiError) {
          console.error(
            `Failed to fetch jobs from external API: ${apiError.message}`,
          );
        }
      } else {
        console.log(
          `[Worker] Skipping external API call for student ${studentId} due to empty search query.`,
        );
      }
    }

    const jobsWithScores = finalJobs.map((job) => ({
      job,
      score: calculateMatchScore(job, student),
    }));

    return jobsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        ...item.job,
        _id: item.job._id || new mongoose.Types.ObjectId(),
      }));
  } catch (error) {
    console.error('Error in getRecommendedJobs:', error);
    throw error;
  }
};
