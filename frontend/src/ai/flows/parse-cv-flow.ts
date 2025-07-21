
'use server';
/**
 * @fileOverview A lightweight flow to quickly parse a CV and extract key information.
 *
 * - parseCv - A function that handles the CV parsing process.
 * - ParseCvInput - The input type for the parseCv function.
 * - ParseCvOutput - The return type for the parseCv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseCvInputSchema = z.object({
  cvDataUri: z
    .string()
    .describe(
      "A CV document (PDF, DOCX, PNG, JPG) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseCvInput = z.infer<typeof ParseCvInputSchema>;


const ParsedEducationSchema = z.object({
    institution: z.string().describe("The name of the educational institution."),
    degree: z.string().describe("The degree or qualification obtained."),
    fieldOfStudy: z.string().optional().describe("The field of study."),
    startDate: z.string().optional().describe("The start date in YYYY-MM format, if available."),
    endDate: z.string().optional().describe("The end date in YYYY-MM format or 'Present', if available."),
    country: z.string().optional().describe("The country where the institution is located."),
    gpa: z.string().optional().describe("The GPA or grade, if mentioned."),
});

const ParsedExperienceSchema = z.object({
    company: z.string().describe("The name of the company."),
    jobTitle: z.string().describe("The job title."),
    startDate: z.string().optional().describe("The start date in YYYY-MM format, if available."),
    endDate: z.string().optional().describe("The end date in YYYY-MM format or 'Present', if available."),
    responsibilities: z.string().optional().describe("A summary of key responsibilities and achievements in this role, formatted as a single string. Use newlines for separation if needed."),
    location: z.string().optional().describe("The location of the job (e.g., city, state, country)."),
});

const ParseCvOutputSchema = z.object({
  fullName: z.string().describe("The full name of the candidate."),
  email: z.string().describe("The primary email address of the candidate."),
  phone: z.string().optional().describe("The phone number of the candidate."),
  linkedin: z.string().optional().describe("The URL of the candidate's LinkedIn profile."),
  summary: z.string().optional().describe("A professional summary or objective statement from the CV."),
  education: z.array(ParsedEducationSchema).describe("The structured education history from the CV."),
  experience: z.array(ParsedExperienceSchema).describe("The structured work experience from the CV."),
  skills: z.array(z.string()).describe("A list of the top 5-10 most prominent skills mentioned in the CV."),
});
export type ParseCvOutput = z.infer<typeof ParseCvOutputSchema>;

export async function parseCv(input: ParseCvInput): Promise<ParseCvOutput> {
  return parseCvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseCvPrompt',
  input: {schema: ParseCvInputSchema},
  output: {schema: ParseCvOutputSchema},
  prompt: `You are an expert CV and resume parsing engine. Your task is to analyze the provided document and extract key information into a structured JSON format. Be as accurate as possible.

CV Document:
{{media url=cvDataUri}}

Your task is to extract the following fields:
- fullName: The full name of the person.
- email: The main contact email.
- phone: The primary phone number.
- linkedin: The full URL to the person's LinkedIn profile.
- summary: The professional summary or objective section.
- education: An array of all educational experiences. For each, extract institution, degree, field of study, start date, end date, country, and GPA if available.
- experience: An array of all work experiences. For each, extract company, job title, location, start date, end date, and a summary of responsibilities.
- skills: Identify and list the top 5 to 10 most important technical or professional skills.
`,
});

const parseCvFlow = ai.defineFlow(
  {
    name: 'parseCvFlow',
    inputSchema: ParseCvInputSchema,
    outputSchema: ParseCvOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to parse the CV.');
    }
    return output;
  }
);
