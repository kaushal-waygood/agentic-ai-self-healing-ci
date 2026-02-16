'use server';

/**
 * @fileOverview A Genkit flow for formatting raw job descriptions into structured HTML.
 * - formatJobDescription - A function that takes raw text and returns formatted HTML.
 * - FormatJobDescriptionInput - The input type for the formatJobDescription function.
 * - FormatJobDescriptionOutput - The return type for the formatJobDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FormatJobDescriptionInputSchema = z.object({
  rawDescription: z.string().describe('The raw, unstructured text of a job description.'),
});
export type FormatJobDescriptionInput = z.infer<typeof FormatJobDescriptionInputSchema>;

const FormatJobDescriptionOutputSchema = z.object({
  formattedDescription: z.string().describe('The job description formatted as a clean HTML string. Use headings (<h4>, <h5>), paragraphs (<p>), and unordered lists (<ul>, <li>) for structure.'),
});
export type FormatJobDescriptionOutput = z.infer<typeof FormatJobDescriptionOutputSchema>;

export async function formatJobDescription(input: FormatJobDescriptionInput): Promise<FormatJobDescriptionOutput> {
  return formatJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatJobDescriptionPrompt',
  input: { schema: FormatJobDescriptionInputSchema },
  output: { schema: FormatJobDescriptionOutputSchema },
  prompt: `You are an expert text formatting engine. Your task is to convert a raw job description text into a clean, well-structured, and easily readable HTML string.

**CRITICAL INSTRUCTIONS:**
1.  **PRESERVE ORIGINAL TEXT:** You must not change, rewrite, add to, or summarize any of the original text. Your only job is to wrap it in appropriate HTML tags.
2.  **STRUCTURE IS KEY:** Identify logical sections. Create clear headings for section titles (e.g., "About Us", "Key Responsibilities", "Requirements", "Qualifications", "Benefits").
    *   Use \`<h4>\` tags for main section titles. These should be on their own lines.
    *   Use \`<h5>\` tags for any sub-headings within those sections.
3.  **FORMAT LISTS:** If a section contains items that are clearly a list (often preceded by bullets like •, *, - or numbers, or are just a series of short lines), you **must** convert them into a proper HTML unordered \`<ul>\` list with \`<li>\` tags for each item.
4.  **HANDLE PARAGRAPHS:** Wrap all other general text blocks, sentences, and standalone lines into \`<p>\` tags. Treat text separated by one or more blank lines as a distinct paragraph. **No text should be left outside of a tag.**
5.  **OUTPUT FORMAT:** The final output must be a single, clean HTML string. Do not include \`<html>\`, \`<head>\`, or \`<body>\` tags.

**Example of correct output structure:**
\`\`\`html
<h4>About Us</h4>
<p>We are a leading company in our field, passionate about innovation.</p>
<h4>Key Responsibilities</h4>
<ul>
  <li>Lead project development from conception to deployment.</li>
  <li>Collaborate with cross-functional teams to define, design, and ship new features.</li>
  <li>Ensure the performance, quality, and responsiveness of applications.</li>
</ul>
<h4>Qualifications</h4>
<ul>
  <li>Bachelor's degree in Computer Science or related field.</li>
  <li>5+ years of software development experience.</li>
  <li>Strong proficiency in JavaScript and React.</li>
</ul>
\`\`\`

**Raw Job Description Text:**
{{{rawDescription}}}
`,
});

const formatJobDescriptionFlow = ai.defineFlow(
  {
    name: 'formatJobDescriptionFlow',
    inputSchema: FormatJobDescriptionInputSchema,
    outputSchema: FormatJobDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      // Fallback to a simple text-to-html conversion if AI fails
      const fallbackHtml = `<p>${input.rawDescription.replace(/\n/g, '<br />')}</p>`;
      return { formattedDescription: fallbackHtml };
    }
    return output;
  }
);
