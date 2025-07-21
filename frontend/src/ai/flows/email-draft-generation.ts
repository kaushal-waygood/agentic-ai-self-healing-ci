
'use server';
/**
 * @fileOverview Generates a professional email draft for a job application.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const EmailDraftInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job being applied for.'),
  companyName: z.string().describe('The name of the company.'),
  userName: z.string().describe('The name of the applicant.'),
  refinedCvHtml: z.string().describe('The final, user-approved, tailored CV in HTML format.'),
  tailoredCoverLetterHtml: z.string().describe('The final, user-approved, tailored cover letter in HTML format.'),
});
export type EmailDraftInput = z.infer<typeof EmailDraftInputSchema>;

export const EmailDraftOutputSchema = z.object({
  emailSubject: z.string().describe('A professional subject line for the email.'),
  emailBody: z.string().describe('The full, ready-to-send body of the email. Use newlines for paragraphs.'),
});
export type EmailDraftOutput = z.infer<typeof EmailDraftOutputSchema>;

export async function generateEmailDraft(input: EmailDraftInput): Promise<EmailDraftOutput> {
  return generateEmailDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailDraftPrompt',
  input: { schema: EmailDraftInputSchema },
  output: { schema: EmailDraftOutputSchema },
  prompt: `You are an expert career coach helping a user named {{{userName}}} draft a job application email.

**Context:**
- **Job Title:** {{{jobTitle}}}
- **Company Name:** {{{companyName}}}
- The user has already prepared a tailored CV and Cover Letter for this application.

**Your Tasks:**
1.  **Create Email Subject:** Generate a concise and professional subject line. It should follow the format: "Application for {{{jobTitle}}} - {{{userName}}}".
2.  **Draft Email Body:** Write a professional but brief email.
    - Address it to "Dear Hiring Team,".
    - State that the user is applying for the "{{{jobTitle}}}" position.
    - Mention that their tailored CV and cover letter are attached for review.
    - Express enthusiasm for the opportunity.
    - End with a professional closing (e.g., "Sincerely," followed by the user's name).
    - Ensure the output is a plain text string with appropriate newlines for paragraph breaks. Do not use HTML.

Return the emailSubject and emailBody.
`,
});

const generateEmailDraftFlow = ai.defineFlow(
  {
    name: 'generateEmailDraftFlow',
    inputSchema: EmailDraftInputSchema,
    outputSchema: EmailDraftOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate the email draft.');
    }
    return output;
  }
);
