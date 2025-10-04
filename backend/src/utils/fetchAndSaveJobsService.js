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
   You are an expert HR data extraction agent. Your task is to parse the raw, unstructured job description text provided below and extract the key information into a structured, formatted text output.

    Follow these rules strictly:
    1.  The output MUST be a cleanly formatted text using markdown elements where appropriate (e.g., bold for section titles using **text**, bullet points for lists using '- ').
    2.  Organize the extracted information into sections based on the structure provided below. Add exactly one empty line between each major section (after the last bullet or paragraph of a section and before the next section title) for readability and visual separation.
    3.  For sections that contain lists (like Responsibilities, Qualifications, Benefits), format them as bullet points starting with '- '. Each distinct point or item from the text should be a separate bullet on its own line. Indent bullet points slightly by ensuring they follow standard markdown indentation (e.g., no leading spaces before the '-', but allow natural rendering for slight inset).
    4.  If a specific piece of information cannot be found in the text, omit that entire section from the output.
    5.  Do NOT add any information, sections, or notes that are not present in the original text.
    6.  Do NOT write any introductory or concluding text. Only output the formatted text.
    7.  Ignore any irrelevant text like email signatures, confidentiality notices, or boilerplate legal text.
    8.  Preserve original formatting details like currency symbols, ranges, and parentheses (e.g., for preferred experience). Ensure consistent capitalization and punctuation as in the source.
    9.  Use bold markdown (**text**) for section titles, followed immediately by a colon if present in the structure (e.g., **Nice-to-Haves:**). Do not add extra spaces or padding around section titles beyond standard markdown. Ensure the overall output has clean left alignment with no unnecessary left/right padding, mimicking a professional document layout.
    10. For paragraph-style sections (e.g., About Company), use plain text without bullets, wrapping naturally across lines for readability. Add a single empty line after paragraphs before the next section if needed for spacing.
    11. Ensure bullet points have no extra spaces between them (one per line), but maintain visual flow with the heading directly above the first bullet, no empty line between heading and first bullet.

    Output Structure to follow (only include sections with available data, in this order if present):
    **Full Job Description**

    **Location:** string

    **Experience:** string

    (Paragraph about the company/role here, if present)

    **Key Responsibilities:**
    - string
    - string

    **Requirements:**
    - string
    - string

    **Nice-to-Haves:**
    - string
    - string

    (Additional extracted sections like Experience details, if separate)

    **Job Type:** string

    **Pay:** string

    **Benefits:**
    - string
    - string

    **Application Question(s):**
    - string
    - string

    **Experience:**
    - string
    - string

    **Work Location:** string

    (Add these additional sections if present in the text, formatted similarly with bold titles and colons:)
    **Job Title:** string

    **Date Posted:** string

    **Department:** string

    **Business Line:** string

    **Reports To (Direct):** string

    **Reports To (Functional):** string

    **Grade:** string

    **Direct Reports:** number

    **About Company:** string (paragraph format, no bullets)

    **About Role:** string (paragraph format, no bullets)

    **Responsibilities:**
    - string
    - string

    **Qualifications:**
    - string
    - string

    **Academic Requirements:**
    - string
    - string

    **Deliverables:**
    - string
    - string

    **Diversity & Inclusion:** string (paragraph format, no bullets)

    **Day-to-Day Tasks:**
    - string
    - string

    **Work Mode:** string

    ---
    Here is the raw text to parse:
    ---
    ${rawDescription}
    ---`;

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
