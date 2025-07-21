
// src/ai/flows/ai-job-matching-score.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for calculating an AI Job Matching Score.
 * This is a feature for Pro users.
 *
 * - calculateJobMatchingScore - A function that calculates the job matching score.
 * - CalculateJobMatchingScoreInput - The input type for the calculateJobMatchingScore function.
 * - CalculateJobMatchingScoreOutput - The return type for the calculateJobMatchingScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateJobMatchingScoreInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The full description of the job listing.'),
  userProfile: z // User profile can be complex, represented as a string summary for the AI
    .string()
    .describe(
      'A detailed summary of the user profile, including skills, experience, education, and narratives.'
    ),
});
export type CalculateJobMatchingScoreInput = z.infer<
  typeof CalculateJobMatchingScoreInputSchema
>;

const CalculateJobMatchingScoreOutputSchema = z.object({
  matchScore: z
    .number()
    .min(0).max(100)
    .describe(
      'A score between 0 and 100 indicating how well the job matches the user profile. Round to nearest integer.'
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of why the job received the given match score, highlighting key matches or mismatches.'
    ),
  strengths: z.array(z.string()).describe('List of specific strengths of the user for this job.'),
  areasForImprovement: z.array(z.string()).describe('List of areas where the user profile could be stronger for this job.'),
});
export type CalculateJobMatchingScoreOutput = z.infer<
  typeof CalculateJobMatchingScoreOutputSchema
>;

export async function calculateJobMatchingScore(
  input: CalculateJobMatchingScoreInput
): Promise<CalculateJobMatchingScoreOutput> {
  return calculateJobMatchingScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateJobMatchingScorePrompt',
  input: {schema: CalculateJobMatchingScoreInputSchema},
  output: {schema: CalculateJobMatchingScoreOutputSchema},
  prompt: `You are an AI job matching expert. You will be given a job description and a user profile summary.
Your task is to:
1. Calculate a match score (0-100, integer) indicating how well the job fits the user.
2. Provide a brief reasoning for the score.
3. List specific strengths of the user for this job.
4. List areas where the user's profile could be stronger for this job.

Job Description:
{{{jobDescription}}}

User Profile Summary:
{{{userProfile}}}

Analyze the user's skills, experience (including years), education, and any provided narratives against the job requirements.
Be objective and provide actionable feedback in the reasoning, strengths, and areas for improvement.
Return the match score, reasoning, strengths, and areasForImprovement.
`,
});

const calculateJobMatchingScoreFlow = ai.defineFlow(
  {
    name: 'calculateJobMatchingScoreFlow',
    inputSchema: CalculateJobMatchingScoreInputSchema,
    outputSchema: CalculateJobMatchingScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to calculate job matching score.");
    }
    // Ensure score is an integer
    output.matchScore = Math.round(output.matchScore);
    return output;
  }
);
