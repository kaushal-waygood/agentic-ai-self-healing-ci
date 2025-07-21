export type MockApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  dateApplied: string;
  status:
    | 'Draft'
    | 'Sent'
    | 'Viewed'
    | 'Interviewing'
    | 'Offer Extended'
    | 'Rejected'
    | 'Error'
    | 'Applied'
    | 'AI-Drafted';
  // New fields to link generated documents
  savedCvId?: string;
  savedCoverLetterId?: string;
  emailDraft?: string;
  // New field for AI-generated notes from email replies
  notes?: string[];
  // New field to store the state of the application wizard
  wizardState?: any;
};

const initialMockApplications: MockApplication[] = [];

// By attaching the mockApplications array to the global object in development,
// we ensure that it persists across Next.js hot reloads.
declare global {
  // Use a more unique name to avoid potential conflicts.
  // eslint-disable-next-line no-var
  var __mockApplications: MockApplication[] | undefined;
}

export let mockApplications: MockApplication[];

if (process.env.NODE_ENV === 'production') {
  // In production, always start with the initial list.
  mockApplications = initialMockApplications;
} else {
  // In development, use the global object to preserve state across reloads.
  if (!globalThis.__mockApplications) {
    globalThis.__mockApplications = initialMockApplications;
  }
  mockApplications = globalThis.__mockApplications;
}
