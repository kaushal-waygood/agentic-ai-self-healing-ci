
'use server';

/**
 * @fileOverview This file defines the main Genkit flow for searching jobs.
 * It fetches jobs from the JSearch API and saves new results to the
 * application's in-memory job store.
 */

import { ai } from '@/ai/genkit';
import { JSearchApiService, JSearchApiError } from '@/services/job-search-service';
import { JobSearchFlowInput, JobSearchFlowInputSchema } from '@/lib/schemas/job-search-schema';
import { JobListing, JobListingsArraySchema, mockJobListings } from '@/lib/data/jobs';

export async function searchJobsFlow(input: JobSearchFlowInput): Promise<JobListing[]> {
  return jobSearchOrchestrationFlow(input);
}

const jobSearchOrchestrationFlow = ai.defineFlow(
  {
    name: 'jobSearchOrchestrationFlow',
    inputSchema: JobSearchFlowInputSchema,
    outputSchema: JobListingsArraySchema,
  },
  async (input) => {
    console.log("Fetching jobs from JSearch API with input:", input);
    const api = await JSearchApiService.getInstance();
    
    try {
        const apiResults = await api.searchJobs(input);
        
        console.log(`Fetched ${apiResults.length} jobs from the API.`);
        
        // Save new, unique jobs to our "database" (mockJobListings array)
        const existingJobIds = new Set(mockJobListings.map(j => j.id));
        const newJobsToSave = apiResults.filter(job => !existingJobIds.has(job.id));
        
        if (newJobsToSave.length > 0) {
            mockJobListings.unshift(...newJobsToSave); // Add new jobs to the beginning
            console.log(`Saved ${newJobsToSave.length} new jobs to mockJobListings.`);
        }

        // Return the immediate search results to the search page.
        // The cumulative saved jobs can be viewed on the "Job Listings" page.
        return apiResults;
    } catch (error) {
        if (error instanceof JSearchApiError) {
            // Re-throw the specific API error to be caught by the Next.js error boundary
            throw error;
        }
        // For other unexpected errors, log them and return an empty array to prevent a crash
        console.error("[jobSearchOrchestrationFlow] Unexpected error:", error);
        return [];
    }
  }
);
