import { z } from 'zod';

export type JobStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'archived';

interface Location {
  city: string;
  postalCode: string;
  lat?: number;
  lng?: number;
}

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: Location;
  type: string | null;
  postedDate: string;
  description: string;
  status: JobStatus; // New field for moderation workflow
  postedByOrgId?: string; // New field to link to the posting organization
  salary?: string | null;
  aiMatchScore?: number;
  companyLogo?: string | null;
  activelyHiring: boolean | null;
  experienceRequired?: string | null;
  earlyApplicant: boolean;
  jobUrl?: string | null;
  publisher?: string | null;
  highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  } | null;
  countryCode?: string | null;
};

// This array acts as our in-memory database/cache for job listings.
// It's populated by the search flow and enriched by the details flow.

// By attaching the mockJobListings array to the global object in development,
// we ensure that it persists across Next.js hot reloads.
declare global {
  // Use a more unique name to avoid potential conflicts.
  // eslint-disable-next-line no-var
  var __mockJobListings: JobListing[] | undefined;
}

export let mockJobListings: JobListing[];

if (process.env.NODE_ENV === 'production') {
  // In production, always start with an empty list.
  mockJobListings = [];
} else {
  // In development, use the global object to preserve state across reloads.
  if (!globalThis.__mockJobListings) {
    mockJobListings = [];
  }
  mockJobListings = globalThis.__mockJobListings;
}

// Zod schema for JobListing - useful for validating API responses or flow outputs
export const JobListingHighlightsSchema = z
  .object({
    Qualifications: z.array(z.string()).optional(),
    Responsibilities: z.array(z.string()).optional(),
    Benefits: z.array(z.string()).optional(),
  })
  .nullable()
  .optional();

export const JobListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  type: z.string().nullable(),
  postedDate: z.string(),
  description: z.string(),
  status: z.enum([
    'draft',
    'pending_review',
    'published',
    'rejected',
    'archived',
  ]),
  postedByOrgId: z.string().optional(),
  salary: z.string().nullable().optional(),
  aiMatchScore: z.number().optional(),
  companyLogo: z.string().nullable().optional(),
  activelyHiring: z.boolean().nullable(),
  experienceRequired: z.string().nullable().optional(),
  earlyApplicant: z.boolean(),
  jobUrl: z.string().url().nullable().optional(),
  publisher: z.string().nullable().optional(),
  highlights: JobListingHighlightsSchema,
  countryCode: z.string().nullable().optional(),
});

export const JobListingsArraySchema = z.array(JobListingSchema);
