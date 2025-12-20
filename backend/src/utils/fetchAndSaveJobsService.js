import axios from 'axios';
import slugify from 'slugify';
import { Job } from '../models/jobs.model.js';
import { genAIRequest as genAI } from '../config/gemini.js';
import { config } from '../config/config.js';

export const extractJobDetailsWithAI = async (rawDescription) => {
  if (!rawDescription || rawDescription.trim() === '') {
    return { error: 'Input description is empty.' };
  }
  const prompt = `
    You are an expert HR data extraction agent. Parse the raw job description below.
    Your response MUST be a single, minified JSON object without any markdown formatting.
    If a specific piece of information cannot be found, the value for that key should be null.
    Schema to follow: { "jobTitle": "...", "location": "...", "experience": [...], "responsibilities": [...], "qualifications": [...] }
    Raw text: ${rawDescription}`;

  try {
    const resultText = await genAI(prompt, {
      userId: req.user?._id,
      endpoint: req.endpoint,
    });
    const cleanedResponse = resultText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    throw error;
  }
};

export const extractJobDetailsWithRetry = async (
  description,
  maxRetries = 3,
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await extractJobDetailsWithAI(description);
    } catch (error) {
      if (error.status === 503) {
        if (attempt === maxRetries) {
          return {
            error: `AI service unavailable after ${maxRetries} attempts.`,
          };
        }
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `AI service unavailable. Attempt ${attempt}/${maxRetries}. Retrying in ${
            delay / 1000
          }s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return { error: `A non-retryable AI error occurred: ${error.message}` };
      }
    }
  }
};

const activeFetches = new Set();

export const fetchAndSaveJobsService = async (query, page = 1) => {
  const lockId = `${query}-page-${page}`;
  if (activeFetches.has(lockId)) {
    console.log(`Fetch for "${lockId}" is already in progress. Skipping.`);
    return 0;
  }
  console.log(`Fetching jobs for query: "${query}", page: ${page}`);

  try {
    activeFetches.add(lockId);
    console.log(`Starting job fetch for query: "${query}", page: ${page}`);

    const response = await axios.get(config.rapidJobApi, {
      params: { query, page },
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    console.log(
      `Received ${response.data.data.length} jobs for query: "${query}", page: ${page}`,
    );

    const externalJobs = response.data.data;
    if (!externalJobs || externalJobs.length === 0) {
      console.log(
        `No new external jobs found on page ${page} for query: "${query}"`,
      );
      return 0;
    }

    const jobsToCreate = externalJobs.filter((job) => job && job.job_id);
    const bulkOperations = [];

    if (jobsToCreate.length > 0) {
      const aiPromises = jobsToCreate.map((job) =>
        extractJobDetailsWithRetry(job.job_description).then((details) => ({
          job,
          details,
        })),
      );
      const aiResults = await Promise.all(aiPromises);

      for (const { job, details } of aiResults) {
        if (details.error) {
          console.error(
            `Could not process job ID ${job.job_id}:`,
            details.error,
          );
          continue;
        }

        const title = details.jobTitle || job.job_title;
        if (!title) {
          console.warn(`Skipping job ID ${job.job_id} due to missing title.`);
          continue;
        }

        const baseSlug = slugify(title, {
          lower: true,
          strict: true,
          trim: true,
        });
        const slug = `${baseSlug}-${job.job_id.slice(-6)}`;

        bulkOperations.push({
          updateOne: {
            filter: { jobId: job.job_id },
            update: {
              // --- Fields that should be updated every time ---
              $set: {
                title: title,
                description: job.job_description,
                responsibilities: details.responsibilities || [],
                qualifications: details.qualifications || [],
                experience: details.experience || [],
                jobTypes: job.job_employment_type
                  ? [job.job_employment_type]
                  : [],
                company: job.employer_name,
                logo: job.employer_logo,
                applyMethod: { method: 'URL', url: job.job_apply_link },
                salary: {
                  min: job.job_min_salary || null,
                  max: job.job_max_salary || null,
                  period: job.job_salary_period || null,
                },
                location: {
                  city: details.location || job.job_city,
                  lat: job.job_latitude,
                  lng: job.job_longitude,
                },
                country: job.job_country,
              },
              // --- Add the search query to the list without duplicates ---
              $addToSet: {
                queries: query,
              },
              // --- Fields that are set ONLY when the job is first created ---
              $setOnInsert: {
                slug: slug,
                jobId: job.job_id,
                origin: 'EXTERNAL',
              },
            },
            upsert: true,
          },
        });
      }
    }

    if (bulkOperations.length > 0) {
      const result = await Job.bulkWrite(bulkOperations, { ordered: false });
      console.log(
        `${result.upsertedCount} new jobs created and ${result.modifiedCount} updated for query: "${query}".`,
      );
      return result.upsertedCount || 0;
    }

    return 0;
  } catch (err) {
    // This will now only catch critical, non-duplicate errors
    console.error(
      `A critical error occurred in job fetch for query "${query}":`,
      err,
    );
    return 0;
  } finally {
    activeFetches.delete(lockId);
  }
};
