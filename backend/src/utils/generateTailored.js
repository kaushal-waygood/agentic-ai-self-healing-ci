export const generateCVPrompts = (data) => {
  return `
  You are a professional CV writer. Based on the following data, generate a polished, well-formatted **Harvard-style CV** in pure HTML (no markdown or styling frameworks). Follow these instructions closely:

  === JOB DETAILS ===
  Job Title: ${data.job.title}
  Company: ${data.job.company}
  Job Description: ${data.job.description}

  === CANDIDATE DETAILS ===
  ${JSON.stringify(data.candidate, null, 2)}

  === ADDITIONAL PREFERENCES ===
  ${data.preferences || 'None provided'}

  === INSTRUCTIONS ===
  - Use the Harvard-style CV format: clean, professional, and minimal.
  - Sections should include:
    1. Contact Information (name, phone, email, LinkedIn, etc.)
    2. Professional Summary (3–4 lines tailored to the job)
    3. Key Skills (bullet points)
    4. Work Experience (most recent first, with bullet points for achievements)
    5. Education (most recent first, include degrees, institutions, and dates)
    6. Certifications or Awards (if any)
    7. Projects or Publications (if any)
    8. Additional Information (languages, interests, etc.)
  - Tailor the CV content to match the job description and highlight the candidate's most relevant skills and experiences.
  - Return only valid, clean HTML wrapped in a single <html><body>...</body></html> block.
  - Do not include any external CSS or scripts—inline styles only if necessary for readability.
  - Use consistent fonts, spacing, and structure appropriate for a Harvard-style professional CV.
  `;
};

export const generateCoverLetterPrompts = (data) => {
  return `
You are a professional career writing assistant. Based on the information provided below, generate a **well-formatted HTML cover letter** that is tailored to the job and candidate profile.

=== JOB DETAILS ===
Job Title: ${data.job.title}
Company: ${data.job.company}
Job Description:
${data.job.description}

=== CANDIDATE INFORMATION ===
${JSON.stringify(data.candidate, null, 2)}

=== EXISTING COVER LETTER ===
${
  data.coverLetter
    ? `Use this content as a reference or starting point:\n${data.coverLetter}`
    : 'None provided'
}

=== ADDITIONAL PREFERENCES ===
${data.preferences || 'None provided'}

=== INSTRUCTIONS ===
- Generate the cover letter in **complete, valid HTML**, wrapped in \`<html><body>...</body></html>\` tags.
- **Do not return plain text** or markdown.
- Use **professional inline CSS** for font (e.g., Arial or Georgia), spacing, and readability.
- The tone should be confident, warm, and professional—not overly formal.
- Use a standard business format:
  1. Personalized greeting ("Dear Hiring Manager" or a specific name if provided)
  2. Opening paragraph stating interest in the role
  3. One or two body paragraphs connecting experience and skills to the job description
  4. Closing paragraph with a call to action (e.g., availability for interview)
  5. Proper sign-off with full name

- Do **not** include external assets, stylesheets, or JavaScript—**HTML and inline CSS only**.
- Ensure the letter fits on a standard page and is suitable for email or PDF export.

Return only the formatted HTML content. No explanation or extra comments.
  `;
};

export const generateEmailPrompt = (data) => {
  return `
  Compose a professional application email to submit the CV and cover letter for this job:
  
  Position: ${data.job.title}
  Company: ${data.job.company}
  
  Candidate Information:
  ${JSON.stringify(data.candidate, null, 2)}
  
  The email should:
  - Be concise (3-4 paragraphs max)
  - Include a clear subject line
  - Introduce the candidate
  - Briefly mention why they're a good fit
  - Reference the attached documents
  - Include a professional closing
  
  Please return the email in HTML format without any markdown formatting.
  `;
};

// Response processors
export const processCVResponse = (response) => {
  // Clean up AI response and ensure proper HTML formatting
  return response.replace(/```html|```/g, '').trim();
};

export const processCoverLetterResponse = (response) => {
  return response.replace(/```html|```/g, '').trim();
};

export const processEmailResponse = (response) => {
  return response.replace(/```html|```/g, '').trim();
};
