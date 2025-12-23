// export const generateCVPrompt = (jobDescription, resumeText, finalTouch) => {
//   return `
// This is the job description where the user wants to apply:
// ${jobDescription}
// This is the user's resume:
// ${resumeText}
// ${finalTouch ? `Additional Instructions:\n${finalTouch}` : ''}

// You are a world-class career coach and CV writer specializing in crafting ATS-friendly, professional CVs in standardized corporate format.

// Your task is to take the user's career information and the target role and generate:
// 1. A polished, professional HTML CV following exact corporate formatting standards.
// 2. An ATS compatibility score and brief reasoning.

// Input Data:
// - The user's information is provided as either an uploaded file or a JSON object. Prioritize the uploaded file if available.
// {{#if fileDataUri}}
// USER'S UPLOADED CV FILE:
// {{media url=fileDataUri}}
// {{/if}}
// {{#if jsonData}}
// USER'S PROVIDED DETAILS (JSON):
// \`\`\`json
// {{{jsonData}}}
// \`\`\`
// {{/if}}
// TARGET ROLE/COURSE/PROGRAM:
// {{{targetRole}}}

// YOUR TASKS:

// 1. **Parse and Understand:**
// - Extract key sections: Name, Contact Information, Professional Summary, Education, Work Experience, Skills.

// 2. **Generate Professional HTML CV (in 'cv' field of output JSON):**

// **CRITICAL FORMATTING REQUIREMENTS:**
// - **Font**: Use Times New Roman, 11pt for body text, 22pt for name
// - **Page Layout**: Maximum 800px width, centered, optimized for 2-page maximum length
// - **Print Optimization**: Include print media queries for clean PDF conversion

// **HEADER FORMATTING (MUST BE CENTERED):**
// - Name: 22pt, bold, uppercase, centered
// - Contact info: 11pt, single line, centered below name
// - Format: "Address | Phone | Email"

// **SECTION STRUCTURE (EXACT ORDER):**
// 1. **SUMMARY** (with horizontal divider)
// 2. **EXPERIENCE** (with horizontal divider)
// 3. **EDUCATION** (with horizontal divider)
// 4. **SKILLS** (with horizontal divider)

// **SECTION FORMATTING RULES:**
// - Section titles: 12pt, bold, uppercase
// - Add horizontal black line divider immediately after each section title using: \`<div class="section-divider"></div>\`
// - Consistent spacing: 18px between sections, 12px between job entries

// **EXPERIENCE SECTION FORMAT:**
// For each job entry:
// \`\`\`
// Company Name                                          Location
// Job Title                                            Date Range
// • Bullet point with Bold Label: Description text
// • Bullet point with Bold Label: Description text
// \`\`\`

// STYLING RULES:
// - Use ONLY the predefined class names.
// - DO NOT include <style> tags or inline styles.
// - Output clean, semantic HTML inside <div class="container">.

// **CONTENT OPTIMIZATION REQUIREMENTS:**
// 1. **Summary Section**:
//    - Write 3-4 lines highlighting key expertise and experience tailored to '{{{targetRole}}}'
//    - Add "Additional:" paragraph with unique value proposition
//    - Use professional, strategic language

// 2. **Experience Bullets**:
//    - Start each bullet with **Bold Label:** (e.g., "Strategic Leadership:", "Process Optimization:")
//    - Focus on achievements and quantifiable results
//    - Use action verbs and professional terminology
//    - Tailor content to match '{{{targetRole}}}' requirements
//    - Limit to 2-4 bullets per role

// 3. **Length Management**:
//    - Prioritize most recent and relevant experiences
//    - Combine or remove older/less relevant positions if needed
//    - Ensure final output fits within 2 pages when printed

// **HTML STRUCTURE REQUIREMENTS:**
// - Output must include complete HTML document with embedded CSS
// - Use exact class names as specified in CSS
// - Follow this structure:
// \`\`\`

// \`\`\`html

//     <div class="container">
//         <div class="header">
//             <div class="name">[FULL NAME IN CAPS]</div>
//             <div class="contact-info">[ADDRESS | PHONE | EMAIL]</div>
//         </div>

//         <div class="section">
//             <div class="section-title">SUMMARY</div>
//             <div class="section-divider"></div>
//             <div class="summary-text">[Summary content]</div>
//             <div class="additional">Additional: [Additional content]</div>
//         </div>

//         <div class="section">
//             <div class="section-title">EXPERIENCE</div>
//             <div class="section-divider"></div>
//             [Job entries with exact formatting]
//         </div>

//         <div class="section">
//             <div class="section-title">EDUCATION</div>
//             <div class="section-divider"></div>
//             [Education entries]
//         </div>

//         <div class="section">
//             <div class="section-title">SKILLS</div>
//             <div class="section-divider"></div>
//             [Skills content]
//         </div>
//     </div>
// \`\`\`
// \`\`\`
// **CRITICAL SUCCESS FACTORS:**
// - Exact spacing and formatting match
// - Professional language enhancement tailored to target role
// - 2-page limit adherence
// - Complete HTML document ready for PDF conversion
// - Consistent styling throughout
// - ATS-friendly structure with proper keyword integration

// 3. **ATS Scoring (in 'atsScore' and 'atsScoreReasoning' fields):**
// - Provide an ATS score (0–100) based on keyword relevance to '{{{targetRole}}}', formatting, and content quality.
// - Give a short 2–3 sentence reasoning.
// - Include one specific, actionable suggestion for improving the score.

// Important:
// - Output must be a valid JSON object with these keys: \`cv\`, \`atsScore\`, \`atsScoreReasoning\`.
// - Ensure the 'cv' value contains the complete HTML document as described above.
// - The HTML must be print-ready and professionally formatted.
// `;
// };

export const generateCVPrompt = (jobDescription, resumeData, finalTouch) => {
  return `
Job Description:
${jobDescription}

User Resume Data (JSON):
${JSON.stringify(resumeData, null, 2)}

${finalTouch ? `Additional Instructions:\n${finalTouch}` : ''}

You are a professional CV writer generating ATS-friendly HTML.

====================
STRICT OUTPUT CONTRACT
====================

1. OUTPUT ONLY HTML starting with:
<div class="container">

2. DO NOT include:
- <!DOCTYPE>
- <html>, <head>, <body>
- <style>, <script>, <link>
- inline styles
- duplicated sections

3. USE ONLY these tags:
div, span, ul, li, strong, br

4. USE ONLY predefined class names:
container, header, name, contact-info,
section, section-title, section-divider,
summary-text, additional,
job, company-line, company, location,
role-line, role, dates,
education-item,
skills-section

====================
SECTION STRUCTURE (MANDATORY)
====================

ORDER (exact):
1. SUMMARY
2. EXPERIENCE
3. PROJECTS
4. EDUCATION
5. SKILLS

====================
SECTION RULES
====================

SUMMARY:
- Use <div class="summary-text">
- 3–4 concise lines tailored to the job
- Add <span class="additional"><strong>Additional:</strong> …</span>

EXPERIENCE:
- Each job inside <div class="job">
- Bullet points MUST be inside:
  <ul>
    <li><strong>Label:</strong> Achievement</li>
  </ul>
- DO NOT wrap <ul> in extra <div>

PROJECTS:
- Represent projects ONLY as:
  <ul>
    <li>
      <strong>Project Name:</strong> Description (Tech stack if relevant)
    </li>
  </ul>

EDUCATION:
- Represent education ONLY as:
  <ul>
    <li>
      <strong>Degree</strong>, Institute
    </li>
  </ul>

SKILLS:
- One <div class="skills-section">
- Group skills by category using <strong>

====================
QUALITY RULES
====================
- No filler text
- No repetition
- Professional corporate tone
- Quantifiable impact where possible

====================
FINAL OUTPUT
====================
Return VALID JSON ONLY with keys:
- cv (HTML string)
- atsScore (0–100)
- atsScoreReasoning (2–3 sentences, 1 improvement tip)

NOTE: 
- Document wrapper (html/head/style) is added by backend. You MUST NOT output them.
- Backend enforces page limits, experience length, and ATS scoring.
- You MUST NOT exceed reasonable content length.

NO MARKDOWN.
NO EXPLANATIONS.
JSON ONLY.
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
