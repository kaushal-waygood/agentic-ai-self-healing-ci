
'use server';
/**
 * @fileOverview A lightweight flow to extract job title and company from a block of text.
 *
 * - extractJobDetails - A function that handles the extraction process.
 * - ExtractJobDetailsInput - The input type for the extractJobDetails function.
 * - ExtractJobDetailsOutput - The return type for the extractJobDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractJobDetailsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe(
      "The full, raw text of a job description pasted by the user."
    ),
});
export type ExtractJobDetailsInput = z.infer<typeof ExtractJobDetailsInputSchema>;

const ExtractJobDetailsOutputSchema = z.object({
  jobTitle: z.string().describe("The specific job title identified from the text."),
  companyName: z.string().describe("The name of the company that posted the job."),
});
export type ExtractJobDetailsOutput = z.infer<typeof ExtractJobDetailsOutputSchema>;

export async function extractJobDetails(input: ExtractJobDetailsInput): Promise<ExtractJobDetailsOutput> {
  return extractJobDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractJobDetailsPrompt',
  input: {schema: ExtractJobDetailsInputSchema},
  output: {schema: ExtractJobDetailsOutputSchema},
  prompt: `You are an expert data extraction engine. Analyze the following job description text and identify two key pieces of information: the specific job title and the company name.

Job Description Text:
{{{jobDescription}}}

Your task is to accurately extract only the job title and the company name.
`,
});

const extractJobDetailsFlow = ai.defineFlow(
  {
    name: 'extractJobDetailsFlow',
    inputSchema: ExtractJobDetailsInputSchema,
    outputSchema: ExtractJobDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to extract job details from the text.');
    }
    return output;
  }
);
