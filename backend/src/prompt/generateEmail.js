export const generateEmailPrompt = (data) => `
You are writing a professional job application email.

STRICT OUTPUT RULES:
- Output PLAIN TEXT ONLY
- Do NOT use HTML
- Do NOT use markdown
- Do NOT include code blocks

FORMAT EXACTLY AS:
SUBJECT:
<subject line>

BODY:
<paragraph 1>

<paragraph 2>

<paragraph 3>

SIGNATURE:
<full name>

Job Details:
Position: ${data.job.title}
Company: ${data.job.company}

Candidate Profile:
${JSON.stringify(data.candidate, null, 2)}

EMAIL RULES:
- Max 3 short paragraphs
- Mention attached CV and cover letter
- Professional tone
- No placeholders like [Your Name]

Return ONLY the formatted content.
`;

export const processEmailResponse = (response) =>
  response.replace(/```/g, '').trim();
