
'use server';

/**
 * @fileOverview Cover Letter Generation flow.
 *
 * - generateCoverLetter - A function that handles the cover letter generation process.
 * - CoverLetterGenerationInput - The input type for the generateCoverLetter function.
 * - CoverLetterGenerationOutput - The return type for the generateCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
    type CoverLetterGenerationInput,
    CoverLetterGenerationInputSchema,
    type CoverLetterGenerationOutput,
    CoverLetterGenerationOutputSchema 
} from '@/lib/schemas/cover-letter-schema';


export async function generateCoverLetter(input: CoverLetterGenerationInput): Promise<CoverLetterGenerationOutput> {
  return generateCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverLetterGenerationPrompt',
  input: {schema: CoverLetterGenerationInputSchema}, 
  output: {schema: CoverLetterGenerationOutputSchema},
  prompt: `You are an expert career coach writing a professional cover letter for a user named {{{userName}}}.

Your task is to analyze the user's profile and the provided job description to create a compelling cover letter.

**Context:**
1.  **User Profile/CV:**
    {{#if userProfileDataUri}}
    The user's CV has been provided as an uploaded document. Analyze its content as the primary source of information:
    {{media url=userProfileDataUri}}
    {{else}}
    The user has provided their profile/CV information as text. Use this as the primary source:
    {{{userProfileContext}}}
    {{/if}}

2.  **Full Job Description:**
    {{{jobDescription}}}
    (From this, you must infer the company name and job title.)

**Instructions:**
1.  Write a standard, professional cover letter.
2.  The tone must be **{{{tone}}}**.
3.  The style and length must be **{{{style}}}**.
4.  Directly address the requirements in the job description, connecting them to the user's skills and experience from their profile.
5.  {{#if personalStory}}
    Subtly and naturally weave in the following personal story or achievement provided by the user: "{{{personalStory}}}"
    {{/if}}
6.  The letter should be from {{{userName}}}.
7.  Do not include placeholders like "[Your Name]" or "[Hiring Manager Name]" unless it is impossible to infer from the context. Address it to the "Hiring Team" at the inferred company if no specific name is available.
8.  Generate the cover letter as a simple HTML string. Crucially, each paragraph, including the greeting (e.g., "Dear Hiring Team,"), each body paragraph, the closing (e.g., "Sincerely,"), and the user's name, must be wrapped in its own individual '<p>' tag. This structure is essential for proper visual spacing. For example: '<p>Dear Hiring Team,</p><p>I am writing to express my interest...</p><p>Thank you for your consideration.</p><p>Sincerely,</p><p>{{{userName}}}</p>'. Do not include '<html>', '<head>', or '<body>' tags. Only provide the content HTML for the letter.
`,
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: CoverLetterGenerationInputSchema,
    outputSchema: CoverLetterGenerationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    if (!output) {
      console.error('Cover letter generation failed: AI model returned no output.');
      throw new Error('Cover letter generation failed: AI model returned no output. Please try again.');
    }
    return output;
  }
);
