
import { z } from "zod";

export const CoverLetterGenerationInputSchema = z.object({
  jobDescription: z.string().min(1, { message: "Job description must be at least 1 character." }).describe('The full job description pasted by the user. The AI will extract the company name and job title from this.'),
  userProfileContext: z.string().optional().describe('A summary of the user\'s profile as text or HTML, including their CV, skills, and experience.'),
  userProfileDataUri: z.string().optional().describe("The user's CV as a data URI. Use this as the primary source if provided. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  userName: z.string().describe('The name of the user.'),
  tone: z.enum(["Formal", "Enthusiastic", "Reserved", "Casual"]).describe('The desired tone for the cover letter.'),
  style: z.enum(["Concise", "Detailed"]).describe('The desired style and length of the cover letter.'),
  personalStory: z.string().optional().describe('An optional personal story or specific achievement the user wants to highlight.'),
});
export type CoverLetterGenerationInput = z.infer<typeof CoverLetterGenerationInputSchema>;

export const CoverLetterGenerationOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter as a simple HTML string.'),
});
export type CoverLetterGenerationOutput = z.infer<typeof CoverLetterGenerationOutputSchema>;
