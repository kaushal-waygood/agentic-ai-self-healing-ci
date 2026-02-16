
import { config } from 'dotenv';
config();

import '@/ai/flows/tailored-application.ts';
import '@/ai/flows/cv-generation.ts';
import '@/ai/flows/ai-job-matching-score.ts';
import '@/ai/flows/ai-assistant.ts';
import '@/ai/flows/parse-cv-flow.ts';
import '@/ai/flows/cover-letter-generation.ts';
import '@/ai/flows/extract-job-details-flow.ts';
import '@/ai/flows/format-job-description-flow.ts';
import '@/ai/flows/get-job-details-flow.ts';
import '@/ai/flows/auto-apply-agent-flow.ts';
import '@/ai/flows/search-jobs-flow.ts';
import '@/ai/flows/process-incoming-email-flow.ts';
import '@/ai/flows/email-draft-generation.ts';
import '@/ai/flows/parse-job-from-file-flow.ts';
