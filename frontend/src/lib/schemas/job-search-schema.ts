
import { z } from 'zod';

// Define and export the input schema. This is the single source of truth.
export const JobSearchFlowInputSchema = z.object({
  query: z.string().min(1, "Search query is required."),
  country: z.string().optional(),
  language: z.string().optional(),
  datePosted: z.enum(['all', 'today', '3days', 'week', 'month']).optional().default('all'),
  workFromHome: z.boolean().optional().default(false),
  employmentTypes: z.array(z.string()).optional().default([]), // e.g., ['FULLTIME', 'CONTRACTOR']
  jobRequirements: z.array(z.string()).optional().default([]), // e.g., ['no_degree', 'under_3_years_experience']
  radius: z.number().min(0).optional(),
  excludeJobPublishers: z.string().optional(), // Comma-separated string
  page: z.number().optional(),
});

// Export the type derived from the schema
export type JobSearchFlowInput = z.infer<typeof JobSearchFlowInputSchema>;
