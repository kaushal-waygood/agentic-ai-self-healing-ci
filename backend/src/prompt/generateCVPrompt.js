export const generateCVPrompt = (jobDescription, resumeText, finalTouch) => {
  return `
This is the job description where the user wants to apply:
${jobDescription}
This is the user's resume:
${resumeText}
${finalTouch ? `Additional Instructions:\n${finalTouch}` : ''}

You are a world-class career coach and CV writer specializing in crafting ATS-friendly, professional CVs in standardized corporate format.

Your task is to take the user's career information and the target role and generate:
1. A polished, professional HTML CV following exact corporate formatting standards.
2. An ATS compatibility score and brief reasoning.

Input Data:
- The user's information is provided as either an uploaded file or a JSON object. Prioritize the uploaded file if available.
{{#if fileDataUri}}
USER'S UPLOADED CV FILE:
{{media url=fileDataUri}}
{{/if}}
{{#if jsonData}}
USER'S PROVIDED DETAILS (JSON):
\`\`\`json
{{{jsonData}}}
\`\`\`
{{/if}}
TARGET ROLE/COURSE/PROGRAM:
{{{targetRole}}}

YOUR TASKS:

1. **Parse and Understand:**
- Extract key sections: Name, Contact Information, Professional Summary, Education, Work Experience, Skills.

2. **Generate Professional HTML CV (in 'cv' field of output JSON):**

**CRITICAL FORMATTING REQUIREMENTS:**
- **Font**: Use Times New Roman, 11pt for body text, 22pt for name
- **Page Layout**: Maximum 800px width, centered, optimized for 2-page maximum length
- **Print Optimization**: Include print media queries for clean PDF conversion

**HEADER FORMATTING (MUST BE CENTERED):**
- Name: 22pt, bold, uppercase, centered
- Contact info: 11pt, single line, centered below name
- Format: "Address | Phone | Email"

**SECTION STRUCTURE (EXACT ORDER):**
1. **SUMMARY** (with horizontal divider)
2. **EXPERIENCE** (with horizontal divider) 
3. **EDUCATION** (with horizontal divider)
4. **SKILLS** (with horizontal divider)

**SECTION FORMATTING RULES:**
- Section titles: 12pt, bold, uppercase
- Add horizontal black line divider immediately after each section title using: \`<div class="section-divider"></div>\`
- Consistent spacing: 18px between sections, 12px between job entries

**EXPERIENCE SECTION FORMAT:**
For each job entry:
\`\`\`
Company Name                                          Location
Job Title                                            Date Range
• Bullet point with Bold Label: Description text
• Bullet point with Bold Label: Description text
\`\`\`

**REQUIRED CSS STYLING (Include this exact CSS):**
\`\`\`css
<style>


.container {
    font-family: 'Times New Roman', serif;
    line-height: 1.2;
    color: #000;
    background-color: #fff;
    font-size: 11pt;
}

.header {
    text-align: center;
    margin-bottom: 0;
}

.name {
    font-size: 22pt;
    font-weight: bold;
    margin-bottom: 8px;
    color: #000;
}

.contact-info {
    font-size: 11pt;
    color: #000;
    margin-bottom: 20px;
}

.section {
    margin-bottom: 18px;
}

.section-title {
    font-size: 12pt;
    font-weight: bold;
    margin-bottom: 2px;
    color: #000;
    text-transform: uppercase;
}

.section-divider {
    border-bottom: 1px solid #000;
    margin-bottom: 8px;
}

.summary-text {
    font-size: 11pt;
    text-align: justify;
    line-height: 1.3;
    margin-bottom: 12px;
}

.additional {
    font-size: 11pt;
    font-weight: bold;
    text-align: justify;
    line-height: 1.3;
}

.job {
    margin-bottom: 12px;
}

.company-line {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0;
}

.company {
    font-weight: bold;
    font-size: 11pt;
}

.location {
    font-size: 11pt;
    font-weight: bold;
}

.role-line {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
}

.role {
    font-style: italic;
    font-size: 11pt;
}

.dates {
    font-size: 11pt;
    font-style: italic;
}

.responsibilities {
    margin: 0;
    list-style: none;
}

.responsibilities li {
    font-size: 11pt;
    line-height: 1.3;
    margin-bottom: 4px;
    text-align: justify;
    position: relative;
}

.responsibilities li:before {
    content: "•";
    position: absolute;
    left: 0;
    font-weight: bold;
}

.highlight {
    font-weight: bold;
}

.education-item {
    margin-bottom: 8px;
}

.degree-line {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.university {
    font-weight: bold;
    font-size: 11pt;
}

.degree {
    font-size: 11pt;
    font-style: italic;
    margin-top: 2px;
}

.skills-section {
    font-size: 11pt;
    line-height: 1.4;
}

.skill-category {
    margin-bottom: 6px;
    text-align: justify;
}

.skill-title {
    font-weight: bold;
    display: inline;
}


</style>
\`\`\`

**CONTENT OPTIMIZATION REQUIREMENTS:**
1. **Summary Section**: 
   - Write 3-4 lines highlighting key expertise and experience tailored to '{{{targetRole}}}'
   - Add "Additional:" paragraph with unique value proposition
   - Use professional, strategic language

2. **Experience Bullets**:
   - Start each bullet with **Bold Label:** (e.g., "Strategic Leadership:", "Process Optimization:")
   - Focus on achievements and quantifiable results
   - Use action verbs and professional terminology
   - Tailor content to match '{{{targetRole}}}' requirements
   - Limit to 2-4 bullets per role

3. **Length Management**:
   - Prioritize most recent and relevant experiences
   - Combine or remove older/less relevant positions if needed
   - Ensure final output fits within 2 pages when printed

**HTML STRUCTURE REQUIREMENTS:**
- Output must include complete HTML document with embedded CSS
- Use exact class names as specified in CSS
- Follow this structure:
\`\`\`

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>[Name] - Resume</title>
    [INCLUDE EXACT CSS ABOVE]
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="name">[FULL NAME IN CAPS]</div>
            <div class="contact-info">[ADDRESS | PHONE | EMAIL]</div>
        </div>
        
        <div class="section">
            <div class="section-title">SUMMARY</div>
            <div class="section-divider"></div>
            <div class="summary-text">[Summary content]</div>
            <div class="additional">Additional: [Additional content]</div>
        </div>
        
        <div class="section">
            <div class="section-title">EXPERIENCE</div>
            <div class="section-divider"></div>
            [Job entries with exact formatting]
        </div>
        
        <div class="section">
            <div class="section-title">EDUCATION</div>
            <div class="section-divider"></div>
            [Education entries]
        </div>
        
        <div class="section">
            <div class="section-title">SKILLS</div>
            <div class="section-divider"></div>
            [Skills content]
        </div>
    </div>
</body>
</html>
\`\`\`
\`\`\`
**CRITICAL SUCCESS FACTORS:**
- Exact spacing and formatting match
- Professional language enhancement tailored to target role
- 2-page limit adherence  
- Complete HTML document ready for PDF conversion
- Consistent styling throughout
- ATS-friendly structure with proper keyword integration

3. **ATS Scoring (in 'atsScore' and 'atsScoreReasoning' fields):**
- Provide an ATS score (0–100) based on keyword relevance to '{{{targetRole}}}', formatting, and content quality.
- Give a short 2–3 sentence reasoning.
- Include one specific, actionable suggestion for improving the score.

Important:
- Output must be a valid JSON object with these keys: \`cv\`, \`atsScore\`, \`atsScoreReasoning\`.
- Ensure the 'cv' value contains the complete HTML document as described above.
- The HTML must be print-ready and professionally formatted.
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
