import { Student } from '../models/student.model.js';
import { Job } from '../models/jobs.model.js';
import { calculateMatchScore, convertSalaryToYearly } from './jobUtils.js';
import axios from 'axios';
import mongoose from 'mongoose';
import { config } from '../config/config.js';

export const getRecommendedJobs = async (
  studentId,
  additionalFilter = {},
  limit = 50,
) => {
  try {
    // Get student preferences, job role, and skills
    const student = await Student.findById(studentId)
      .select('jobPreferences jobRole skills experience education')
      .lean();

    if (!student) {
      throw new Error('Student not found');
    }

    const preferences = student.jobPreferences || {};
    const jobRole = student.jobRole;
    const studentSkills = student.skills || [];
    const studentExperience = student.experience || [];
    const studentEducation = student.education || [];

    // Build basic filter
    const filter = {
      isActive: true,
      ...additionalFilter,
    };

    // If no preferences exist, use jobRole and skills to find relevant jobs
    if (!preferences || Object.keys(preferences).length === 0) {
      const searchTerms = [];

      if (jobRole) {
        searchTerms.push(jobRole);
      }

      // Add skills as search terms
      if (studentSkills.length) {
        studentSkills.forEach((skill) => {
          searchTerms.push(skill.skill);
        });
      }

      // Add experience job titles as search terms
      if (studentExperience.length) {
        studentExperience.forEach((exp) => {
          if (exp.title) searchTerms.push(exp.title);
          if (exp.designation) searchTerms.push(exp.designation);
        });
      }

      // Add education fields as search terms
      if (studentEducation.length) {
        studentEducation.forEach((edu) => {
          if (edu.fieldOfStudy) searchTerms.push(edu.fieldOfStudy);
          if (edu.degree) searchTerms.push(edu.degree);
        });
      }

      // Create a unique list of search terms
      const uniqueSearchTerms = [
        ...new Set(searchTerms.filter((term) => term)),
      ];

      if (uniqueSearchTerms.length) {
        filter.$or = uniqueSearchTerms.map((term) => ({
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
            { qualifications: { $regex: term, $options: 'i' } },
            { tags: { $regex: term, $options: 'i' } },
          ],
        }));
      }
    } else {
      // Original preference-based filtering logic
      // Location
      if (preferences.isRemote) {
        filter.isRemote = true;
      } else if (preferences.preferedCountries?.length) {
        filter.country = {
          $in: preferences.preferedCountries.map((c) => new RegExp(c, 'i')),
        };
      }

      // Job Types
      if (preferences.preferedJobTypes?.length) {
        filter.jobTypes = { $in: preferences.preferedJobTypes };
      }

      // Job Titles - use preferred titles or fallback to jobRole
      if (preferences.preferedJobTitles?.length) {
        filter.$or = preferences.preferedJobTitles.map((title) => ({
          title: { $regex: title, $options: 'i' },
        }));
      } else if (jobRole) {
        filter.$or = [{ title: { $regex: jobRole, $options: 'i' } }];
      }

      // Salary
      if (preferences.preferedSalary?.min) {
        const minSalary = convertSalaryToYearly(
          preferences.preferedSalary.min,
          preferences.preferedSalary.period,
        );
        filter['salary.min'] = { $gte: minSalary };
      }

      // Experience Level
      if (preferences.preferedExperienceLevel) {
        let experienceValue;
        switch (preferences.preferedExperienceLevel) {
          case 'ENTRY_LEVEL':
            experienceValue = 0;
            break;
          case 'MID_LEVEL':
            experienceValue = 3;
            break;
          case 'SENIOR':
            experienceValue = 5;
            break;
          case 'EXPERT':
            experienceValue = 8;
            break;
          default:
            experienceValue = 0;
        }
        filter.experience = { $lte: experienceValue };
      }

      // Must-have skills
      if (preferences.mustHaveSkills?.length) {
        filter.$and = preferences.mustHaveSkills.map((skillObj) => ({
          $or: [
            { qualifications: { $regex: skillObj.skill, $options: 'i' } },
            { description: { $regex: skillObj.skill, $options: 'i' } },
            { tags: { $regex: skillObj.skill, $options: 'i' } },
          ],
        }));
      }
    }

    // 1. First try to get jobs from MongoDB
    const mongoJobs = await Job.find(filter).limit(limit * 2); // Get more to allow for filtering

    let jobsWithScores = mongoJobs
      .map((job) => ({
        job: job.toObject ? job.toObject() : job,
        score: calculateMatchScore(
          job,
          preferences,
          jobRole,
          studentSkills,
          studentExperience,
          studentEducation,
        ),
        source: 'mongo',
      }))
      .filter((item) => item.score > 0) // Only keep jobs with score > 0
      .sort((a, b) => b.score - a.score);

    // 2. If no matches in MongoDB or all scores are 0, try external API
    if (jobsWithScores.length === 0) {
      console.log('No matching jobs in MongoDB, trying external API...');

      // Build API query parameters based on available data
      const queryParams = {};

      if (jobRole) {
        queryParams.query = jobRole;
      } else if (studentSkills.length) {
        queryParams.query = studentSkills.map((s) => s.skill).join(' OR ');
      }

      if (!queryParams.query) {
        console.log('No search terms available - skipping external API');
        return [];
      }

      if (preferences.isRemote) {
        queryParams.remote_jobs_only = true;
      }

      if (preferences.preferedCountries?.length) {
        queryParams.country = preferences.preferedCountries.join(',');
      }

      console.log('API query params:', queryParams);

      console.log(
        'check seconds steps ..... processing job discovery for student',
        queryParams,
      );

      try {
        const apiResponse = await axios.get(config.rapidJobApi, {
          params: {
            ...queryParams,
            num_pages: 1,
          },
          headers: {
            'X-RapidAPI-Key': config.rapidApiKey,
            'X-RapidAPI-Host': config.rapidApiHost,
          },
        });

        const apiJobs = apiResponse.data.data || [];

        jobsWithScores = apiJobs
          .map((apiJob) => {
            try {
              const transformedJob = transformApiJobToSchema(apiJob);
              return {
                job: transformedJob,
                score: calculateMatchScore(
                  transformedJob,
                  preferences,
                  jobRole,
                  studentSkills,
                  studentExperience,
                  studentEducation,
                ),
                source: 'api',
              };
            } catch (transformError) {
              console.error(
                'Error transforming API job:',
                transformError.message,
              );
              console.log('Problematic API job data:', {
                job_id: apiJob.job_id,
                job_title: apiJob.job_title,
                employer_name: apiJob.employer_name,
              });
              return null;
            }
          })
          .filter((job) => job && job.score > 0)
          .sort((a, b) => b.score - a.score);

        console.log(
          `Found ${jobsWithScores.length} valid jobs from external API`,
        );
      } catch (apiError) {
        console.error('Failed to fetch jobs from external API:', apiError);
        return [];
      }
    }

    // Ensure all jobs have proper IDs before returning
    const finalJobs = jobsWithScores.map((item) => {
      if (!item.job._id) {
        item.job._id = new mongoose.Types.ObjectId();
      }
      return item.job;
    });

    return finalJobs.slice(0, limit); // Return up to the limit
  } catch (error) {
    console.error('Error in getRecommendedJobs:', error);
    throw error;
  }
};

const transformApiJobToSchema = (apiJob) => {
  const jobId = new mongoose.Types.ObjectId();

  return {
    _id: jobId,
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
      ? [apiJob.job_employment_type]
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
    qualifications: apiJob.job_highlights?.qualifications || '',
    tags: apiJob.job_highlights?.key_requirements || [],
    externalId: apiJob.job_id || null,
  };
};
