
'use server';

/**
 * @fileOverview CV Generation flow.
 *
 * - generateCv - A function that handles the CV generation process.
 * - CVGenerationInput - The input type for the generateCv function.
 * - CVGenerationOutput - The return type for the generateCv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CVGenerationInputSchema = z.object({
  cvData: z.string().describe('The CV data, either as a data URI for a file (PDF, DOC, DOCX) or as a structured JSON string.'),
  jobTitle: z.string().describe('The target job title for the CV.'),
  jobDescription: z.string().optional().describe('The full job description, if available. This provides more context for tailoring.'),
  userNarratives: z.string().optional().describe('Optional user narratives about challenges, achievements, and appreciation.'),
});
export type CVGenerationInput = z.infer<typeof CVGenerationInputSchema>;

const CVGenerationOutputSchema = z.object({
  cv: z.string().describe('The generated CV as an HTML string, formatted with Tailwind CSS classes according to Harvard CV guidelines.'),
  atsScore: z.number().min(0).max(100).describe('An ATS (Applicant Tracking System) compatibility score from 0 to 100, based on keyword relevance, formatting, and clarity for the target job title. Integer value.'),
  atsScoreReasoning: z.string().describe('A brief explanation for the ATS score provided, highlighting key factors.'),
});
export type CVGenerationOutput = z.infer<typeof CVGenerationOutputSchema>;

const CvPromptInputSchema = z.object({
  jobTitle: z.string().describe('The job title the CV is being generated for.'),
  jobDescription: z.string().optional().describe('The full job description for more detailed context.'),
  jsonData: z.string().optional().describe('The CV data as a structured JSON string.'),
  fileDataUri: z.string().optional().describe("A CV file (PDF, DOCX) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  userNarratives: z.string().optional().describe('User narratives about challenges, achievements, and appreciation. Integrate these naturally into the CV, perhaps in the summary or experience descriptions if relevant and appropriate for a Harvard style CV.'),
});

export async function generateCv(input: CVGenerationInput): Promise<CVGenerationOutput> {
  return generateCvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cvGenerationPrompt',
  input: {schema: CvPromptInputSchema}, 
  output: {schema: CVGenerationOutputSchema},
  prompt: `You are an expert CV writer generating a world-class CV meticulously based on the Harvard CV template design, but using Tailwind CSS classes for all styling.
**CRITICAL INSTRUCTIONS:**
1.  **Use Tailwind CSS Classes ONLY:** You MUST use Tailwind CSS utility classes for all styling. Do NOT use inline \`style\` attributes. The final output must be a single block of HTML, starting with a container div like \`<div class="bg-white p-10 font-sans">\`.
2.  **No New Information:** You must NOT invent or change any factual information from the source CV data.
3.  **Structure and Classes:** Adhere strictly to the following structure and classes.
4.  **Process Experience:** If the source CV describes experiences in paragraph form, you MUST break them down into separate, distinct bullet points for the final output. Each bullet point must start with an action verb.

**CV STRUCTURE EXAMPLE (MUST BE FOLLOWED PRECISELY):**

<div class="bg-white p-10 font-sans text-gray-800">
    <!-- Header: Must be centered. Name is largest. Contact info on one line. -->
    <header class="text-center mb-6">
        <h1 class="text-3xl font-bold tracking-wider text-gray-900 mb-1">CANDIDATE'S NAME</h1>
        <p class="text-sm text-gray-600">
            <span>(555) 123-4567</span> |
            <span class="text-blue-600 hover:underline">email@domain.com</span> |
            <span class="text-blue-600 hover:underline">linkedin.com/in/username</span>
        </p>
    </header>
    <hr class="mb-6" />

    <!-- Professional Summary: Always include this section. -->
    <section class="mb-6">
        <h2 class="text-xl font-semibold border-b-2 border-gray-200 pb-2 mb-3 text-gray-700">Professional Summary</h2>
        <p class="text-gray-700 leading-relaxed text-sm">A concise 3-4 sentence summary tailored to the job description, highlighting key skills and career goals.</p>
    </section>

    <!-- Experience: MUST use bullet points for descriptions. -->
    <section class="mb-6">
        <h2 class="text-xl font-semibold border-b-2 border-gray-200 pb-2 mb-3 text-gray-700">Experience</h2>
        <div class="mb-4">
            <div class="flex justify-between items-baseline">
                <h3 class="text-lg font-semibold text-gray-800">Company Name</h3>
                <p class="text-sm text-gray-600">City, State</p>
            </div>
            <div class="flex justify-between items-baseline mb-1">
                <p class="text-md italic text-gray-700">Position Title</p>
                <p class="text-sm text-gray-600">Month Year - Month Year</p>
            </div>
            <ul class="list-disc pl-5 mt-2 text-gray-700 text-sm space-y-1">
                <li>Developed and executed marketing campaigns that increased lead generation by 30%. (Start with an action verb. Quantify results.)</li>
                <li>Managed a team of 5 marketing specialists, providing mentorship and performance reviews.</li>
                <li>This MUST be a bulleted list. Each accomplishment or responsibility must be a separate \`<li>\` element.</li>
            </ul>
        </div>
        <!-- Add more experience entries as needed -->
    </section>

    <!-- Education -->
    <section class="mb-6">
        <h2 class="text-xl font-semibold border-b-2 border-gray-200 pb-2 mb-3 text-gray-700">Education</h2>
        <div class="mb-4">
            <div class="flex justify-between items-baseline">
                <h3 class="text-lg font-semibold text-gray-800">University Name</h3>
                <p class="text-sm text-gray-600">City, State</p>
            </div>
            <div class="flex justify-between items-baseline">
                <p class="text-md text-gray-700">Degree, Concentration</p>
                <p class="text-sm text-gray-600">Graduation Month Year</p>
            </div>
            <p class="text-sm text-gray-600">GPA: 3.8/4.0</p>
        </div>
    </section>

    <!-- Skills: Must be categorized. -->
    <section>
        <h2 class="text-xl font-semibold border-b-2 border-gray-200 pb-2 mb-3 text-gray-700">Skills</h2>
        <div class="text-sm text-gray-700">
            <p><strong class="font-medium text-gray-800">Technical:</strong> List of technical skills (e.g., Python, React, SQL)</p>
            <p><strong class="font-medium text-gray-800">Languages:</strong> List of languages and proficiency levels</p>
        </div>
    </section>
</div>

**YOUR TASK:**
Generate the HTML for the CV based on the user's provided data, tailored for the role of **{{{jobTitle}}}**.
- **User Data Source:**
  {{#if fileDataUri}}
    Analyze the uploaded CV document: {{media url=fileDataUri}}
  {{else}}
    Use the provided JSON data: {{{jsonData}}}
  {{/if}}
- **Job Context:**
  {{#if jobDescription}}
    Job Description: {{{jobDescription}}}
  {{/if}}
- **Additional Narratives:**
  {{#if userNarratives}}
    "{{{userNarratives}}}"
  {{/if}}

Follow the example structure PRECISELY. Ensure all experience points are in a \`<ul>\` with \`list-disc pl-5\` classes and begin with strong action verbs.

Finally, provide the ATS Score and Reasoning as before.
`,
});

const generateCvFlow = ai.defineFlow(
  {
    name: 'generateCvFlow',
    inputSchema: CVGenerationInputSchema,
    outputSchema: CVGenerationOutputSchema,
  },
  async (originalInput: CVGenerationInput) => {
    const promptPayload: z.infer<typeof CvPromptInputSchema> = {
      jobTitle: originalInput.jobTitle,
      jobDescription: originalInput.jobDescription,
      userNarratives: originalInput.userNarratives, 
    };

    if (originalInput.cvData.startsWith('data:') && originalInput.cvData.includes(';base64,')) {
      promptPayload.fileDataUri = originalInput.cvData;
    } else {
      promptPayload.jsonData = originalInput.cvData;
    }

    const {output} = await prompt(promptPayload);
    
    if (!output) {
      console.error('CV generation failed: AI model returned no output.');
      throw new Error('CV generation failed: AI model returned no output. Please try again.');
    }
    // Ensure ATS score is an integer
    output.atsScore = Math.round(output.atsScore);
    return output;
  }
);
