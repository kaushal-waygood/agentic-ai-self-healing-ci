import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mockOrganizations, mockUsers } from '@/lib/data/user';
import { mockJobListings, JobListing } from '@/lib/data/jobs';
import { randomUUID } from 'crypto';

// Zod schema for validating the incoming job posting data
const postJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  companyName: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  jobUrl: z.string().url('A valid job URL is required'),
  employmentType: z
    .enum(['FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERN'])
    .optional(),
  salary: z.string().optional(),
});

export async function POST(request: Request) {
  // 1. Authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid API key.' },
      { status: 401 },
    );
  }
  const apiKey = authHeader.split(' ')[1];

  const organization = mockOrganizations.find((org) => org.apiKey === apiKey);

  if (!organization) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid API key.' },
      { status: 401 },
    );
  }

  // 2. Validation
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body. Must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = postJobSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid job data.', details: validation.error.format() },
      { status: 400 },
    );
  }

  const jobData = validation.data;

  // 3. Processing
  const newJob: JobListing = {
    id: randomUUID(),
    title: jobData.title,
    company: jobData.companyName,
    location: jobData.location,
    description: jobData.description,
    jobUrl: jobData.jobUrl,
    type: jobData.employmentType ?? null,
    salary: jobData.salary,
    status: 'pending_review', // All jobs from API enter the moderation queue
    postedByOrgId: organization.id,
    postedDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
    publisher: organization.name,
    activelyHiring: true,
    earlyApplicant: true,
  };

  mockJobListings.unshift(newJob);

  return NextResponse.json(
    {
      message: 'Job posted successfully and is pending review.',
      jobId: newJob.id,
    },
    { status: 201 },
  );
}
