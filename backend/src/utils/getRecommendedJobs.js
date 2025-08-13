// utils/getRecommendedJobs.js
import { Student } from '../models/student.model.js';
import { Job } from '../models/jobs.model.js';
import { calculateMatchScore, convertSalaryToYearly } from './jobUtils.js';
import axios from 'axios';

export const getRecommendedJobs = async (
  studentId,
  additionalFilter = {},
  limit = 50,
) => {
  try {
    // Get student preferences
    const student = await Student.findById(studentId).select('jobPreferences');
    if (!student) {
      throw new Error('Student not found');
    }

    const preferences = student.jobPreferences;

    // Build basic filter
    const filter = {
      isActive: true,
      ...additionalFilter,
    };

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

    // Job Titles
    if (preferences.preferedJobTitles?.length) {
      filter.$or = preferences.preferedJobTitles.map((title) => ({
        title: { $regex: title, $options: 'i' },
      }));
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

    // 1. First try to get jobs from MongoDB
    const mongoJobs = await Job.find(filter).limit(limit);
    let jobsWithScores = mongoJobs
      .map((job) => ({
        job,
        score: calculateMatchScore(job, preferences),
        source: 'mongo',
      }))
      .filter((item) => item.score > 0) // Only keep jobs with score > 0
      .sort((a, b) => b.score - a.score);

    // 2. If no matches in MongoDB or all scores are 0, try external API
    if (jobsWithScores.length === 0) {
      console.log('No matching jobs in MongoDB, trying external API...');

      try {
        const apiResponse = await axios.get(
          'https://jsearch.p.rapidapi.com/search',
          {
            params: {
              query: preferences.preferedJobTitles?.join(' OR ') || '',
              ...(preferences.isRemote && { remote_jobs_only: true }),
              ...(preferences.preferedCountries?.length && {
                country: preferences.preferedCountries.join(','),
              }),
              num_pages: 1,
            },
            headers: {
              'X-RapidAPI-Key':
                '481481f3c2msh0f834e29ff85a12p112cf0jsnf6269e369239',
              'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            },
          },
        );

        const apiJobs = apiResponse.data.data || [];

        jobsWithScores = apiJobs.map((job) => ({
          job: transformApiJobToSchema(job), // Transform API response to match your schema
          score: calculateMatchScore(job, preferences),
          source: 'api',
        }));

        return jobsWithScores;
      } catch (apiError) {
        console.error('Failed to fetch jobs from external API:', apiError);
        // Return empty array if API fails
        return [];
      }
    }

    return jobsWithScores.slice(0, limit); // Return up to the limit
  } catch (error) {
    console.error('Error in getRecommendedJobs:', error);
    throw error;
  }
};

// Helper function to transform API job to your schema
function transformApiJobToSchema(apiJob) {
  return {
    title: apiJob.job_title,
    description: apiJob.job_description,
    company: apiJob.employer_name,
    isRemote: apiJob.job_is_remote,
    country: apiJob.job_country,
    location: {
      city: apiJob.job_city,
    },
    salary: {
      min: apiJob.job_min_salary,
      max: apiJob.job_max_salary,
      period: apiJob.job_salary_period || 'YEAR',
    },
    // Add other fields as needed
    applyMethod: {
      method: 'URL',
      url: apiJob.job_apply_link,
    },
  };
}
