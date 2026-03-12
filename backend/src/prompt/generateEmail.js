export const generateEmailPrompt = (data) => `
You are writing a professional job application email. The candidate will attach their CV and cover letter.

STRICT OUTPUT FORMAT — follow exactly:
SUBJECT:
Application for ${data.job.title} - [Candidate Full Name]

BODY:
Dear Hiring Team,

[Paragraph 1: State you are applying for the position, mention attached CV and cover letter. Use proper punctuation and spacing after commas.]

[Paragraph 2: One sentence on why you are a good fit — reference 1-2 relevant skills]

[Paragraph 3: Express enthusiasm and request consideration]

SIGNATURE:
[Candidate's full name]

Job Details:
Position: ${data.job.title}
Company: ${data.job.company}

Candidate Profile:
${JSON.stringify(data.candidate, null, 2)}

RULES:
- Use the candidate's actual fullName from the profile. No placeholders.
- Max 3 short paragraphs. Be concise.
- Professional, confident tone.
- Put a blank line between paragraphs in BODY (double newline).
- Output PLAIN TEXT only. No HTML, markdown, or code blocks.
- Return ONLY the formatted content with SUBJECT:, BODY:, and SIGNATURE: labels.
`;

export const processEmailResponse = (response) =>
  response.replace(/```/g, '').trim();

/**
 * Parse AI response into { subject, body, signature }.
 * Handles variations in format (extra newlines, different casing).
 */
export function parseEmailDraftResponse(response) {
  const cleaned = processEmailResponse(response);

  const subjectMatch = cleaned.match(/SUBJECT:\s*\n?\s*([^\n]+)/i);
  const bodyMatch = cleaned.match(/BODY:\s*\n?\s*([\s\S]*?)(?=\n\s*SIGNATURE:|$)/i);
  const signatureMatch = cleaned.match(/SIGNATURE:\s*\n?\s*([^\n]+)/i);

  let subject = subjectMatch?.[1]?.trim() || 'Job Application';
  let body = bodyMatch?.[1]?.trim() || '';
  let signature = signatureMatch?.[1]?.trim() || '';

  body = body.replace(/\n{3,}/g, '\n\n').trim();
  body = body.replace(/,([A-Z])/g, ', $1');
  if (!signature && body) {
    const paras = body.split('\n\n').filter(Boolean);
    const last = paras[paras.length - 1];
    if (last && last.length < 50 && !last.includes('.')) {
      signature = last.trim();
      body = paras.slice(0, -1).join('\n\n');
    }
  }

  return { subject, body, signature };
}
