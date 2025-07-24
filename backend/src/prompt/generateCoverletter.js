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
- Address the cover letter to the hiring manager or a general greeting like "Dear Hiring Manager".
- Highlight the applicant’s most relevant experience and skills as they relate to the job description.
- Keep the tone professional, concise, and confident.
- The letter should be no more than 3–4 paragraphs.
- Focus on why the applicant is a good fit for the company and the role.
${finalTouch ? `- Final Touch: ${finalTouch}` : ''}

Return only the cover letter text. Do not include markdown, JSON, or any code formatting.
`;
};
