
'use server';

/**
 * @fileOverview An AI flow to process an incoming email and determine if it's a relevant job application response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { MockApplication } from '@/lib/data/applications';

const ApplicationStatusSchema = z.enum(['Draft', 'Sent', 'Viewed', 'Interviewing', 'Offer Extended', 'Rejected', 'Error', 'Applied', 'AI-Drafted']);

const ProcessEmailInputSchema = z.object({
  emailContent: z.string().describe("The full raw text content of the incoming email."),
  userApplications: z.array(z.object({
    id: z.string(),
    jobTitle: z.string(),
    company: z.string(),
  })).describe("A list of the user's current job applications to check against."),
});
export type ProcessEmailInput = z.infer<typeof ProcessEmailInputSchema>;

const ProcessEmailOutputSchema = z.object({
  isRelevant: z.boolean().describe("True if the email is a direct reply to one of the user's applications."),
  applicationId: z.string().optional().describe("The ID of the matching application, if relevant."),
  newStatus: ApplicationStatusSchema.optional().describe("The suggested new status for the application based on the email's intent (e.g., 'Interviewing', 'Rejected')."),
  summary: z.string().optional().describe("A one-sentence summary of the email's key message (e.g., 'Recruiter wants to schedule a 30-minute screening call.')."),
});
export type ProcessEmailOutput = z.infer<typeof ProcessEmailOutputSchema>;


export async function processIncomingEmail(input: ProcessEmailInput): Promise<ProcessEmailOutput> {
  return processIncomingEmailFlow(input);
}


const prompt = ai.definePrompt({
  name: 'processIncomingEmailPrompt',
  input: { schema: ProcessEmailInputSchema },
  output: { schema: ProcessEmailOutputSchema },
  prompt: `You are an AI assistant for a job application platform called CareerPilot. Your task is to analyze an incoming email and determine if it is a response to a job application the user has sent.

**Context:**
- The user has sent applications for the following jobs:
  {{#each userApplications}}
  - Application ID: {{id}}, Role: {{jobTitle}} at {{company}}
  {{/each}}
- Here is the content of the new email:
  {{{emailContent}}}

**Your Analysis Steps:**
1.  **Relevance Check:** Read the email content (from, subject, body) and determine if it is a direct response to any of the user's applications listed above. Check for matching company names and job titles. If it is not relevant (e.g., spam, newsletter), set 'isRelevant' to false and return.
2.  **Intent Classification:** If the email is relevant, identify its primary intent and map it to a new application status.
    *   If it mentions scheduling a call, screening, or an interview -> 'Interviewing'
    *   If it explicitly says they are not moving forward -> 'Rejected'
    *   If it asks for more information or confirms receipt -> 'Viewed'
    *   If it is a job offer -> 'Offer Extended'
    *   If none of these, keep the original status by not setting the 'newStatus' field.
3.  **Summarization:** Create a concise, one-sentence summary of the email's key point or call to action. For example: "The recruiter from [Company] wants to schedule an interview for the [Job Title] role."

Return the structured output. If the email is not relevant, only return \`{ isRelevant: false }\`.`,
});


const processIncomingEmailFlow = ai.defineFlow(
  {
    name: 'processIncomingEmailFlow',
    inputSchema: ProcessEmailInputSchema,
    outputSchema: ProcessEmailOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to process the incoming email.");
    }
    return output;
  }
);
