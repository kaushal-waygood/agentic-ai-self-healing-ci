import path from 'path';
import fs from 'fs';

const PROMPT_LOG_DIR = path.resolve(process.cwd(), 'logs');
const PROMPT_LOG_FILE = path.join(PROMPT_LOG_DIR, 'sample.txt');
function logPromptToFile(jobDescription, resumeData, finalTouch) {
  try {
    if (!fs.existsSync(PROMPT_LOG_DIR)) {
      fs.mkdirSync(PROMPT_LOG_DIR, { recursive: true });
    }

    const entry = `
==============================
TIMESTAMP: ${new Date().toISOString()}
USER_ID: 'N/A'
ENDPOINT: 'N/A'  
==============================

Job Description:
${jobDescription}

User Resume Data (JSON):
${JSON.stringify(resumeData, null, 2)}

${finalTouch ? `Additional Instructions:\n${finalTouch}` : ''}

`;

    fs.appendFile(PROMPT_LOG_FILE, entry, () => {});
  } catch (error) {
    console.error(error);
  }
}

// export const generateCVPrompt = (jobDescription, resumeData, finalTouch) => {
//   console.log('Prompt logged to file', resumeData);

//   console.log('Generating CV prompt...');
//   logPromptToFile(jobDescription, resumeData, finalTouch);

//   return `
// Job Description:
// ${jobDescription}

// User Profile Image URL:
// ${resumeData.profileImage}

// User Resume Data (JSON):
// ${JSON.stringify(resumeData, null, 2)}

// User Profile Image URL:

// ${finalTouch ? `Additional Instructions:\n${finalTouch}` : ''}

// You are a professional CV writer generating ATS-friendly HTML.

// ====================
// STRICT OUTPUT CONTRACT
// ====================

// 1. OUTPUT ONLY HTML starting with:
// <div class="container">

// 2. DO NOT include:
// - <!DOCTYPE>
// - <html>, <head>, <body>
// - <style>, <script>, <link>
// - inline styles
// - duplicated sections

// 3. USE ONLY these tags:
// div, span, ul, li, strong, br, img

// 4. USE ONLY predefined class names:
// container, header, name, contact-info,
// section, section-title, section-divider,
// summary-text, additional,
// job, company-line, company, location,
// role-line, role, dates,
// education-item,
// skills-section,
// profile-image

// ====================
// SECTION STRUCTURE (MANDATORY)
// ====================

// ORDER (exact):
// 1. SUMMARY
// 2. EXPERIENCE
// 3. PROJECTS
// 4. EDUCATION
// 5. SKILLS

// ====================
// SECTION RULES
// ====================

// SUMMARY:
// - Use profile Image in <div class="header">
// - Use <div class="summary-text">
// - 3–4 concise lines tailored to the job
// - Add <span class="additional"><strong>Additional:</strong> …</span>

// EXPERIENCE:
// - Each job inside <div class="job">
// - Bullet points MUST be inside:
//   <ul>
//     <li><strong>Label:</strong> Achievement</li>
//   </ul>
// - DO NOT wrap <ul> in extra <div>

// PROJECTS:
// - Represent projects ONLY as:
//   <ul>
//     <li>
//       <strong>Project Name:</strong> Description (Tech stack if relevant)
//     </li>
//   </ul>

// EDUCATION:
// - Represent education ONLY as:
//   <ul>
//     <li>
//       <strong>Degree</strong>, Institute
//     </li>
//   </ul>

// SKILLS:
// - One <div class="skills-section">
// - Group skills by category using <strong>

// ====================
// QUALITY RULES
// ====================
// - No filler text
// - No repetition
// - Professional corporate tone
// - Quantifiable impact where possible

// ====================
// FINAL OUTPUT
// ====================
// Return VALID JSON ONLY with keys:
// - cv (HTML string)
// - atsScore (0–100)
// - atsScoreReasoning (2–3 sentences, 1 improvement tip)

// NOTE:
// - Document wrapper (html/head/style) is added by backend. You MUST NOT output them.
// - Backend enforces page limits, experience length, and ATS scoring.
// - You MUST NOT exceed reasonable content length.

// NO MARKDOWN.
// NO EXPLANATIONS.
// JSON ONLY.
// `;
// };

export const generateCVPrompt = (jobDescription, resumeData, finalTouch) => {
  return `
Job Description:
${jobDescription}

User Resume Data (JSON):
${JSON.stringify(resumeData, null, 2)}

${finalTouch ? `Additional Instructions:\n${finalTouch}` : ''}

You are an expert CV Writer and Career Coach. 

====================
CORE STRATEGY
====================
Analyze the User Resume Data to determine the candidate's level:

1. **IF PROFESSIONAL (Has 1+ years of work exp):** - Focus the Summary on years of experience and key achievements.
   - Use metrics (e.g., "Increased efficiency by 20%") in experience bullets.
   - Keep Education concise.

2. **IF FRESHER (No/Little work exp or No Projects):**
   - **DO NOT LIE.** Do not invent fake projects or fake work experience.
   - Focus the Summary on technical foundation and eagerness to learn.
   - **DEEP DIVE EDUCATION:** Expand the Education section. Include specific "coursework" and "details" (honors, labs, or academic focus) to fill the space professionally.
   - **EXPAND SKILLS:** Break skills into detailed categories (e.g., Core Tech, Soft Skills, Tools).

====================
OUTPUT STRUCTURE (STRICT JSON ONLY)
====================
{
  "summary": "Professional summary optimized for the JD...",
  "additionalInfo": "Certifications, Awards, or Languages...",
  "experience": [
    {
      "company": "Company Name",
      "location": "City, Country",
      "role": "Job Title",
      "dates": "Month Year - Month Year",
      "bullets": ["<strong>Keyword:</strong> Achievement or task description..."]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Description highlighting tech stack and results."
      "techStack": "Tech stack used in the project."
      "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "University/College Name",
      "location": "City, Country",
      "year": "2020 - 2024",
      "coursework": ["Data Structures", "Algorithm Design", "Web Tech"],
      "details": "Major achievements or specialized academic focus at this institution."
    }
  ],
  "skills": {
    "Technical": "React, Node, SQL...",
    "Tools": "Git, Docker, VS Code...",
    "Academic": "Optional: Only if fresher, include concepts like OS, DBMS..."
  },
  "atsScore": 85,
  "atsScoreReasoning": "Why this CV matches the JD..."
}

====================
RULES
====================
- Use <strong> tags inside bullets for emphasis.
- Return ONLY valid JSON. No markdown backticks.
- If projects are missing in input data, leave "projects": [] and expand Education instead.
`;
};

export const generateCVRegeneratePrompt = (
  jobContextString,
  studentData,
  finalTouch,
  previousCVJson,
) => {
  return `You are an expert career coach and CV generator. Your task is to **regenerate and improve** a professional, Harvard-style HTML CV and its ATS analysis based on previous output and new user instructions. The final output must be a single, valid JSON object.

**Original Job Context:**
${jobContextString}

**User's CV Data (JSON):**
${studentData}

**PREVIOUSLY GENERATED OUTPUT (JSON):**
${JSON.stringify(previousCVJson, null, 2)}

**User's New Instructions for Regeneration (Final Touch):**
${
  finalTouch ||
  'No new instructions provided. Please refine the previous version based on your expertise to make it even better.'
}

---

**YOUR TASK:**

Based on all the information above, regenerate the CV. **Do not just repeat the previous output.** Improve upon it based on the user's new instructions or your own expert analysis to better align with the job context.

**1. Generate IMPROVED Styled, Harvard-Style HTML CV (for the 'cv' key):**
* Follow the same styling and HTML structure rules as the initial generation (minimalist, Harvard-style, single <style> block).
* Refine the wording, bullet points, or structure to enhance its impact and relevance.

**2. RE-EVALUATE ATS Scoring and Feedback (for 'atsScore' and 'atsSuggestion' keys):**
* Provide an updated ATS score (0-100) for the newly generated CV.
* Provide a new, brief, and actionable suggestion for improvement based on the regenerated content.

**3. Final Output Format:**
* The final output must be **ONLY a single, valid JSON object**.
* The JSON object must have exactly these keys: \`cv\`, \`atsScore\`, \`atsSuggestion\`.
* **DO NOT** wrap the JSON object in markdown fences.
`;
};

export const generateCLRegeneratePrompt = (
  jobContextString,
  studentData,
  finalTouch,
  previousCLJson, // Changed from previousCVJson
) => {
  return `You are an expert career coach and cover letter writer. Your task is to **regenerate and improve** a professional HTML cover letter and its analysis based on previous output and new user instructions. The final output must be a single, valid JSON object.

**Original Job Context:**
${jobContextString}

**User's Profile Data (JSON):**
${JSON.stringify(studentData, null, 2)}

**PREVIOUSLY GENERATED OUTPUT (JSON):**
${JSON.stringify(previousCLJson, null, 2)}

**User's New Instructions for Regeneration (Final Touch):**
${
  finalTouch ||
  'No new instructions provided. Please refine the previous version based on your expertise to make it even better.'
}

---

**YOUR TASK:**

Based on all the information above, regenerate the Cover Letter. **Do not just repeat the previous output.** Improve upon it based on the user's new instructions or your own expert analysis to better align with the job context and sound more personal and impactful.

**1. Generate IMPROVED Professional HTML Cover Letter (for the 'cl' key):**
* The cover letter should be engaging, professional, and directly tailored to the job description.
* Refine the narrative, key examples, or structure to enhance its persuasive power.
* The output for this key must be a single string of HTML.

**2. RE-EVALUATE the Analysis (for the 'analysis' key):**
* Provide a new, brief, and actionable suggestion for how the user could further improve the cover letter.

**3. Final Output Format:**
* The final output must be **ONLY a single, valid JSON object**.
* The JSON object must have exactly these keys: \`cl\`, \`analysis\`.
* **DO NOT** wrap the JSON object in markdown fences.
`;
};
