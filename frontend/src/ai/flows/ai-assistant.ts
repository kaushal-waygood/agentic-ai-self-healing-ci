
// This file implements the AI assistant flow.

'use server';

/**
 * @fileOverview An AI assistant to answer common questions and guide users on how to use the platform.
 *
 * - aiAssistant - A function that handles the AI assistant process.
 * - AIAssistantInput - The input type for the aiAssistant function.
 * - AIAssistantOutput - The return type for the aiAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIAssistantInputSchema = z.object({
  query: z.string().describe('The user query or question.'),
});
export type AIAssistantInput = z.infer<typeof AIAssistantInputSchema>;

const AIAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});
export type AIAssistantOutput = z.infer<typeof AIAssistantOutputSchema>;

export async function aiAssistant(input: AIAssistantInput): Promise<AIAssistantOutput> {
  return aiAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistantPrompt',
  input: {schema: AIAssistantInputSchema},
  output: {schema: AIAssistantOutputSchema},
  prompt: `You are a helpful AI assistant for the CareerPilot platform. Your goal is to answer user questions about the platform and guide them on how to use its features.
  
  Key features of CareerPilot include:
  - Profile creation and management.
  - AI-powered CV generation (from uploaded documents or forms) and editing.
  - Tailored cover letter and email draft generation for job applications.
  - Job listings and an application tracking system.
  - Tiered subscription model (Basic, Plus, Pro) with varying features.
  - Referral program for earning application credits.
  - Self-help documentation and this AI assistant for support.

  When answering, be clear, concise, and helpful. If you don't know the answer or if the question is too complex, politely suggest checking the FAQ page or contacting support.

  User Query: {{{query}}}

  Answer: `,
});

const aiAssistantFlow = ai.defineFlow(
  {
    name: 'aiAssistantFlow',
    inputSchema: AIAssistantInputSchema,
    outputSchema: AIAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
