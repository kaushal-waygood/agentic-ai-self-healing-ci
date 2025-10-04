import axios from 'axios';
import { Job } from '../models/jobs.model.js'; // Adjust path as needed
import { config } from '../config/config.js'; // Adjust path as needed
import redisClient from '../config/redis.js'; // Adjust path as needed
import {
  extractExperience,
  extractQualificationsFromDescription,
  extractResponsibilitiesFromDescription,
} from '../utils/exprienceExtractor.js';
import { genAI } from '../config/gemini.js';

const formatJobDescriptionWithAI = (rawDescription) => {
  if (!rawDescription || rawDescription.trim() === '') {
    return rawDescription;
  }

  const prompt = `
    You are an expert HR content formatter. Your task is to take the following raw job description text and reformat it into clean, well-structured HTML.

    Follow these rules strictly:
    1. Use <h2> headings for major sections like "Responsibilities", "Qualifications", "Skills", or "Requirements".
    1.5 Use valid spacing like <br>, padding or margin — use your creativity.
    2. Use <ul> and <li> tags for bulleted lists.
    3. Use <strong> tags to make key technologies, skills, and important phrases bold (e.g., "Java 11+", "Spring Boot", "Angular 17+", "Microservices").
    4. Do NOT add any information that is not present in the original text.
    5. Do NOT write any introductory or concluding paragraphs. Only output the formatted HTML.

    Here is the raw text:
    ---
    ${rawDescription}
    ---
  `;

  return genAI(prompt);
};

export const fetchAndSaveJobsService = async (query) => {
  if (!query) {
    console.log('Skipping job fetch: Query is empty.');
    return;
  }

  console.log(`Starting background job fetch for query: "${query}"`);

  try {
    const response = await axios.get(config.rapidJobApi, {
      params: { query, page: 1, num_pages: 1 },
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    const jobs = response.data.data;
    if (!jobs || jobs.length === 0) {
      console.log(`No external jobs found for query: "${query}"`);
      return;
    }

    let savedCount = 0;

    for (const job of jobs) {
      const formattedDescription = await formatJobDescriptionWithAI(
        job.job_description,
      );

      const updateResult = await Job.updateOne(
        { jobId: job.job_id },
        {
          $setOnInsert: {
            jobId: job.job_id,
            origin: 'EXTERNAL',
            logo: job.employer_logo,
            experience: extractExperience(job.job_description),
            qualification: extractQualificationsFromDescription(
              job.job_description,
            ),
            title: job.job_title,
            description: formattedDescription,
            responsibilities: extractResponsibilitiesFromDescription(
              job.job_description,
            ),
            jobTypes: job.job_employment_types,
            company: job.employer_name,
            applyMethod: {
              method: 'URL',
              url: job.job_apply_link,
            },
            salary: {
              min: job.job_min_salary || 0,
              max: job.job_max_salary || 0,
              period: job.job_salary_period || 'YEAR',
            },
            location: {
              city: job.job_city,
              postalCode: job.job_postal_code || '',
              lat: job.job_latitude,
              lng: job.job_longitude,
            },
            jobAddress: job.job_location,
            country: job.job_country,
            tags: job.job_benefits || [],
            queries: [query],
            createdAt: new Date(),
          },
          $addToSet: {
            queries: query,
          },
        },
        { upsert: true },
      );

      if (updateResult.upsertedCount > 0) {
        savedCount++;
      }
    }

    if (savedCount > 0) {
      console.log(
        `${savedCount} new jobs saved for query: "${query}". Invalidating cache.`,
      );
      await redisClient.invalidateAllJobsCache?.();
    } else {
      console.log(`No new jobs to save for query: "${query}".`);
    }
  } catch (err) {
    console.error(
      `Error in background job fetch for query "${query}":`,
      err.message,
    );
  }
};
