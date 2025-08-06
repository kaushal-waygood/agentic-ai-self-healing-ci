export const generateCoverLetterPrompt = (
  jobDescription,
  resumeText,
  finalTouch = '',
) => {
  return `
You are a professional career assistant helping job applicants craft tailored cover letters for specific roles.

Use the applicant’s resume and the job description below to write a compelling and personalized cover letter.

Job Description:
${jobDescription}

Applicant Resume:
${resumeText}

Instructions:
- Address the letter to the hiring manager or use a general greeting like "Dear Hiring Manager,"
- Highlight the applicant’s most relevant experience and skills that align with the job description.
- Keep the tone professional, concise, and confident.
- Limit the cover letter to 3–4 paragraphs.
- Emphasize why the applicant is a strong fit for both the company and the role.
${finalTouch ? `- Final Touch: ${finalTouch}` : ''}

Output Format:
- Greeting: "Dear Hiring Manager,"
- Body: [write the main content of the letter]
- Signature: "Sincerely,"
- Closing: "Best regards,"
- Name: "John Doe"

Strict Formatting Requirements:
- Output must be **plain text only**
- Absolutely do NOT include any HTML tags (e.g. <body>, <div>, <p>, etc.)
- Do NOT use any CSS, inline styles, class names, or IDs
- Do NOT add borders, shadows, colors, or any visual styles
- Do NOT wrap text in markdown, code blocks, or use special formatting
- The response must be clean, readable plain text suitable for pasting into a form or webpage

Only return the final cover letter text. Nothing else.
`;
};
