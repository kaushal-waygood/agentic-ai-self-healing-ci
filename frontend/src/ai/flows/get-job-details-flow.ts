'use server';

/**
 * @fileOverview A flow to get the full details of a specific job, with caching.
 * - getJobDetails - A function that fetches job details, formats them, and caches the result.
 * - GetJobDetailsInput - The input type for the getJobDetails function.
 * - GetJobDetailsOutput - The return type for the getJobDetails function (JobListing from data/jobs).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  JSearchApiService,
  JSearchApiError,
} from '@/services/job-search-service';
import {
  JobListingSchema,
  type JobListing,
  mockJobListings,
} from '@/lib/data/jobs';
import { formatJobDescription } from './format-job-description-flow';

const GetJobDetailsInputSchema = z.object({
  jobId: z.string(),
});
export type GetJobDetailsInput = z.infer<typeof GetJobDetailsInputSchema>;

export type GetJobDetailsOutput = JobListing;

export async function getJobDetails(
  input: GetJobDetailsInput,
): Promise<GetJobDetailsOutput | null> {
  return getJobDetailsFlow(input);
}

const getJobDetailsFlow = ai.defineFlow(
  {
    name: 'getJobDetailsFlow',
    inputSchema: GetJobDetailsInputSchema,
    outputSchema: JobListingSchema.nullable(),
  },
  async ({ jobId }) => {
    // 1. Check cache first for a fully formatted job
    const cachedJob = mockJobListings.find((j) => j.id === jobId);
    // A formatted job will have HTML tags like <h4> in its description.
    if (
      cachedJob &&
      cachedJob.description &&
      cachedJob.description.includes('<h4>')
    ) {
      return cachedJob;
    }

    try {
      // 2. If not in cache or not formatted, fetch from the API
      const api = await JSearchApiService.getInstance();
      const jobDetails = await api.getJobDetails(jobId);

      if (!jobDetails) {
        console.error(
          `[getJobDetailsFlow] Failed to get details for job ${jobId}.`,
        );
        return null;
      }

      // 3. Format the description
      let formattedDescription = jobDetails.description; // Default to original
      try {
        const formatResult = await formatJobDescription({
          rawDescription: jobDetails.description,
        });
        formattedDescription = formatResult.formattedDescription;
      } catch (error) {
        console.error(
          `[getJobDetailsFlow] Failed to format description for job ${jobId}, using fallback.`,
          error,
        );
        formattedDescription = `<p>${jobDetails.description.replace(
          /\n/g,
          '<br />',
        )}</p>`;
      }

      // 4. Create the complete, formatted job object
      const finalJob: JobListing = {
        ...jobDetails,
        description: formattedDescription,
      };

      // 5. Update or add to the cache
      const existingJobIndex = mockJobListings.findIndex((j) => j.id === jobId);
      if (existingJobIndex > -1) {
        mockJobListings[existingJobIndex] = finalJob;
      } else {
        mockJobListings.push(finalJob);
      }

      // 6. Return the final object
      return finalJob;
    } catch (error) {
      if (error instanceof JSearchApiError) {
        console.error(
          `[getJobDetailsFlow] JSearch API is down. Could not fetch job ${jobId}.`,
          error.message,
        );
      } else {
        console.error(
          `[getJobDetailsFlow] An unexpected error occurred while fetching job ${jobId}.`,
          error,
        );
      }
      // Return null to gracefully handle the error in the UI (e.g., show a 'not found' page)
      return null;
    }
  },
);
