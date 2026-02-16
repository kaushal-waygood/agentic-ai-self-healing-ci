'use server';

/**
 * @fileOverview AI-powered document generation for job applications.
 *
 * - generateTailoredApplication - Generates a tailored CV, cover letter, and email for a job application.
 * - TailoredApplicationInput - The input type for the generateTailoredApplication function.
 * - TailoredApplicationOutput - The return type for the generateTailoredApplication function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TailoredApplicationInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job being applied for.'),
  jobDescription: z
    .string()
    .describe('The full description of the job posting.'),
  userCv: z
    .string()
    .describe(
      'The user provided CV as an HTML string. This may also contain additional context like cover letter templates or instructions.',
    ),
  userNarratives: z
    .string()
    .optional()
    .describe(
      'Optional narratives about challenging situations the user overcame, significant achievements, and any appreciation received.',
    ),
  userName: z.string().describe('The name of the user.'),
  companyName: z.string().describe('The name of the company being applied to.'),
});
export type TailoredApplicationInput = z.infer<
  typeof TailoredApplicationInputSchema
>;

const TailoredApplicationOutputSchema = z.object({
  tailoredCv: z
    .string()
    .describe(
      'The tailored CV for the job application, as an HTML string. This should be an improved version of the original CV, highlighting skills relevant to the job description.',
    ),
  coverLetter: z
    .string()
    .describe(
      'The cover letter for the job application, as an HTML string with <p> tags. This should be a standard professional cover letter.',
    ),
  emailDraft: z
    .string()
    .describe(
      'The email draft for the job application, ready to be sent. It should mention the attached CV and cover letter.',
    ),
});
export type TailoredApplicationOutput = z.infer<
  typeof TailoredApplicationOutputSchema
>;

export async function generateTailoredApplication(
  input: TailoredApplicationInput,
): Promise<TailoredApplicationOutput> {
  return tailoredApplicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tailoredApplicationPrompt',
  input: { schema: TailoredApplicationInputSchema },
  output: { schema: TailoredApplicationOutputSchema },
  prompt: `You are an expert AI career coach helping a user named {{{userName}}} apply for a job.

**Job Details:**
- **Job Title:** {{{jobTitle}}}
- **Company Name:** {{{companyName}}}
- **Job Description:**
  {{{jobDescription}}}

**User Information & Instructions:**
- **User's CV and Context:**
  {{{userCv}}}
  *Note: The user's CV content might be accompanied by specific instructions or a cover letter template, which you must follow.*

{{#if userNarratives}}
- **User's Narratives (for additional context):**
  {{{userNarratives}}}
{{/if}}

---

**YOUR TASKS:**

1.  **Tailor CV**:
    *   Analyze the user's CV content and the job description.
    *   **Refine and rephrase** the CV's existing content to better align with the job description.
    *   **CRITICAL:** Do NOT add any new skills, experiences, or qualifications that are not present in the original CV data. Your role is to enhance, not invent.
    *   Focus on highlighting transferable skills, using keywords from the job description, and adjusting the professional summary for this specific role.
    *   The final output must be a complete CV as a well-structured HTML string.

2.  **Generate Cover Letter**:
    *   Using the **tailored CV you just created** and the job description, write a professional cover letter.
    *   If a cover letter template or instructions were provided in the user's context, adhere to them closely. Otherwise, write a standard professional letter.
    *   Address it to the "Hiring Team" at {{{companyName}}}.
    *   Briefly highlight 2-3 key skills or experiences from the tailored CV that directly match the job description.
    *   Subtly incorporate relevant details from the user's narratives if provided.
    *   Output as a simple HTML string, ensuring each paragraph, the greeting, and closing are wrapped in separate \`<p>\` tags for proper spacing.

3.  **Draft Email**:
    *   Compose a professional job application email from {{{userName}}}.
    *   Use a clear subject line: "Application for {{{jobTitle}}} - {{{userName}}}".
    *   Briefly introduce {{{userName}}} and the position they are applying for.
    *   State that their tailored CV and cover letter are attached.
    *   Maintain a professional and courteous tone.

Return the tailoredCv, coverLetter, and emailDraft in the required JSON format.
`,
});

const tailoredApplicationFlow = ai.defineFlow(
  {
    name: 'tailoredApplicationFlow',
    inputSchema: TailoredApplicationInputSchema,
    outputSchema: TailoredApplicationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        // This handles cases where the API might return a successful response
        // but the output parsing (based on schema) fails or output is empty.
        console.error(
          'Tailored Application Flow: AI model returned no structured output.',
        );
        throw new Error(
          'AI failed to generate structured application materials. The content might be incomplete or missing.',
        );
      }
      return output;
    } catch (error: any) {
      // This handles network errors or direct API errors (like 503)
      console.error(
        'Tailored Application Flow: Error during AI prompt execution:',
        error,
      );
      if (
        error.message &&
        (error.message.includes('503') ||
          error.message.toLowerCase().includes('service unavailable') ||
          error.message.toLowerCase().includes('overloaded'))
      ) {
        throw new Error(
          'The AI service is currently overloaded or unavailable. Please try again in a few minutes.',
        );
      }
      // Re-throw other errors or a more generic one for the user
      throw new Error(
        error.message ||
          'An unexpected error occurred while generating application materials with the AI.',
      );
    }
  },
);
