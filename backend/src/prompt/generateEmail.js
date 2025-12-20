// src/prompt/generateEmail.js

export const generateEmailPrompt = (data) => {
  return `
You are writing a professional job application email.

STRICT OUTPUT RULES:
- Output PLAIN TEXT ONLY
- Do NOT use HTML
- Do NOT use markdown
- Do NOT include code blocks

Job Details:
Position: ${data.job.title}
Company: ${data.job.company}

Candidate Profile:
${data.candidate}

EMAIL REQUIREMENTS:
- Include a clear subject line
- 3 short paragraphs max
- Mention attached CV and cover letter
- Professional closing with name

Return ONLY the final email text.
`;
};

export const processEmailResponse = (response) =>
  response.replace(/```/g, '').trim();
