import axios from 'axios';
import { Job } from '../models/jobs.model.js';
import { config } from '../config/config.js';
import redisClient from '../config/redis.js';

import { genAI } from '../config/gemini.js';

export const extractJobDetailsWithAI = async (rawDescription) => {
  if (!rawDescription || rawDescription.trim() === '') {
    return { error: 'Input description is empty.' };
  }

  // The original prompt asking for markdown text is kept as is.
  const prompt = `
  You are an expert HR data extraction agent. Your task is to parse the raw, unstructured job description text provided below and extract the key information into a structured HTML output with specific inline CSS for rich text formatting.

Follow these rules strictly:
The output MUST be a single block of HTML code. Do NOT include <html>, <head>, or <body> tags. The entire output should be wrapped in a single parent <div> for easy embedding.
Use <div> elements for each major section. To create visual separation between sections, apply a bottom margin of 16px to each section's <div> (e.g., <div style="margin-bottom: 16px;">).
Section titles (e.g., "Location:", "Key Responsibilities:") MUST be placed within a <p> tag styled to be bold and slightly larger. Use the following style: style="font-size: 16px; font-weight: 700; margin-bottom: 8px;".
For sections containing lists (like Responsibilities, Qualifications, Benefits), use an unordered list (<ul>) with list items (<li>).
Style the <ul> tag to have a left padding of 20px for indentation: style="padding-left: 20px; margin: 0;".
Style each <li> tag to ensure tight spacing between bullet points: style="margin-bottom: 4px;".
For paragraph-style sections (like About Company), place the text within a <p> tag. Style it with a line height of 1.5 for readability and no extra margins: style="margin: 0; line-height: 1.5;".
Simple string sections (like Location, Job Type, Pay) should be in a plain <p> tag with no extra margins: style="margin: 0;".
If a specific piece of information cannot be found in the text, omit that entire section's <div> from the output.
Do NOT add any information, sections, or HTML comments that are not present in the original text.
Do NOT write any introductory or concluding text. Only output the formatted HTML code.
Ignore any irrelevant text like email signatures, confidentiality notices, or boilerplate legal text.
Preserve original formatting details like currency symbols, ranges, and parentheses.
Output Structure to follow (only include sections with available data, in this order if present):(Parent <div> wrapping everything)<div style="margin-bottom: 16px;"><p style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Full Job Description</p></div>

<div style="margin-bottom: 16px;"><p style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Location:</p><p style="margin: 0;">string</p></div>

<div style="margin-bottom: 16px;"><p style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Experience:</p><p style="margin: 0;">string</p></div>

<div style="margin-bottom: 16px;"><p style="margin: 0; line-height: 1.5;">(Paragraph about the company/role here)</p></div>

<div style="margin-bottom: 16px;"><p style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Key Responsibilities:</p><ul style="padding-left: 20px; margin: 0;"><li style="margin-bottom: 4px;">string</li><li style="margin-bottom: 4px;">string</li></ul></div>

(Continue this HTML structure for all other potential sections like Requirements, Nice-to-Haves, Job Type, Pay, Benefits, etc.)

(Closing parent </div>)

Here is the raw text to parse:
${rawDescription}`;

  // --- MODIFICATION ---
  // The logic now parses the markdown response instead of trying to parse JSON.
  try {
    const markdownResponse = await genAI(prompt);
    const jobDetails = {};

    // A map to convert markdown titles to JSON keys.
    const keyMap = {
      'Job Title': 'jobTitle',
      Location: 'location',
      Experience: 'experience',
      'About Company': 'aboutCompany',
      'About Role': 'aboutRole',
      'Key Responsibilities': 'responsibilities',
      Responsibilities: 'responsibilities',
      Requirements: 'qualifications',
      Qualifications: 'qualifications',
      'Nice-to-Haves': 'niceToHaves',
      'Job Type': 'jobType',
      Pay: 'pay',
      Benefits: 'benefits',
      'Work Location': 'workLocation',
    };

    // Regex to find sections: **Title:** followed by content.
    const sections = markdownResponse.split(/\n(?=\*\*)/);

    for (const section of sections) {
      const lines = section.trim().split('\n');
      const titleLine = lines.shift() || '';
      const content = lines.join('\n').trim();

      // Extract title from format like **Title:**
      const titleMatch = titleLine.match(/\*\*(.*?):\*\*/);
      if (!titleMatch) continue;

      const title = titleMatch[1];
      const jsonKey = keyMap[title];

      if (jsonKey) {
        // Check if the content is a list of bullet points
        if (content.startsWith('- ')) {
          jobDetails[jsonKey] = content
            .split('\n')
            .map((line) => line.replace(/^- /, '').trim())
            .filter(Boolean); // Filter out any empty lines
        } else {
          // Otherwise, it's a plain string
          jobDetails[jsonKey] = content;
        }
      }
    }

    return jobDetails;
  } catch (error) {
    console.error('Failed during AI call or parsing markdown:', error);
    return { error: 'Failed to process AI response.' };
  }
};

export const fetchAndSaveJobsService = async (query) => {
  if (!query) {
    console.log('Skipping job fetch: Query is empty.');
    return 0;
  }
  console.log(`Starting job fetch for query: "${query}"`);

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
      console.log(`No new external jobs found for query: "${query}"`);
      return 0;
    }

    let savedCount = 0;
    for (const job of jobs) {
      const existing = await Job.findOne({ jobId: job.job_id });
      if (existing) {
        await Job.updateOne(
          { jobId: job.job_id },
          { $addToSet: { queries: query } },
        );
        continue;
      }

      const extractedDetails = await extractJobDetailsWithAI(
        job.job_description,
      );

      if (extractedDetails.error) {
        console.error(
          `Could not parse job ID ${job.job_id} with AI:`,
          extractedDetails.error,
        );
        continue;
      }

      const newJob = new Job({
        jobId: job.job_id,
        origin: 'EXTERNAL',
        logo: job.employer_logo,
        title: extractedDetails.jobTitle || job.job_title,
        description: job.job_description,
        responsibilities: extractedDetails.responsibilities || [],
        qualifications: extractedDetails.qualifications || [],
        experience: extractedDetails.experience || [],
        jobTypes: job.job_employment_types,
        company: job.employer_name,
        applyMethod: { method: 'URL', url: job.job_apply_link },
        salary: {
          min: job.job_min_salary || 0,
          max: job.job_max_salary || 0,
          period: job.job_salary_period || 'YEAR',
        },
        location: {
          city: extractedDetails.location || job.job_city,
          postalCode: job.job_postal_code || '',
          lat: job.job_latitude,
          lng: job.job_longitude,
        },
        country: job.job_country,
        tags: job.job_benefits || [],
        queries: [query],
      });

      await newJob.save();
      savedCount++;
    }

    if (savedCount > 0) {
      console.log(`${savedCount} new jobs saved for query: "${query}".`);
      await redisClient.invalidateAllJobsCache?.();
    }
    return savedCount;
  } catch (err) {
    console.error(`Error in job fetch for query "${query}":`, err.message);
    return 0;
  }
};
