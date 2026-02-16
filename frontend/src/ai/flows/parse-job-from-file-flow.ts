
'use server';
/**
 * @fileOverview A flow to parse a job description from an uploaded file (image or PDF).
 *
 * - parseJobFromFile - A function that handles the parsing process.
 * - ParseJobFromFileInput - The input type for the parseJobFromFile function.
 * - ParseJobFromFileOutput - The return type for the parseJobFromFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ParseJobFromFileInputSchema = z.object({
  jobDescDataUri: z
    .string()
    .describe(
      "A job description document (PDF, PNG, JPG) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseJobFromFileInput = z.infer<typeof ParseJobFromFileInputSchema>;

const ParseJobFromFileOutputSchema = z.object({
  jobTitle: z.string().describe("The specific job title identified from the document."),
  companyName: z.string().describe("The name of the company that posted the job."),
  jobDescription: z.string().describe("The full, raw text of the job description extracted from the document."),
});
export type ParseJobFromFileOutput = z.infer<typeof ParseJobFromFileOutputSchema>;

export async function parseJobFromFile(input: ParseJobFromFileInput): Promise<ParseJobFromFileOutput> {
  return parseJobFromFileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseJobFromFilePrompt',
  input: {schema: ParseJobFromFileInputSchema},
  output: {schema: ParseJobFromFileOutputSchema},
  prompt: `You are an expert data extraction engine. Analyze the provided document (which could be an image or a PDF) and extract the following information:
1. The specific job title.
2. The name of the company that posted the job.
3. The full, raw text of the entire job description.

Document to analyze:
{{media url=jobDescDataUri}}

Return the extracted job title, company name, and the full job description text.
`,
});

const parseJobFromFileFlow = ai.defineFlow(
  {
    name: 'parseJobFromFileFlow',
    inputSchema: ParseJobFromFileInputSchema,
    outputSchema: ParseJobFromFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to parse the job description from the file.');
    }
    return output;
  }
);
