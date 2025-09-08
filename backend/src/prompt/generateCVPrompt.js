export const generateCVPrompt = (title, studentData, finalTouch) => {
  return `You are an expert career coach and CV generator. Your task is to generate a professional, Harvard-style HTML CV and provide an ATS analysis. The final output must be a single, valid JSON object.

The visual style should be clean, professional, and inspired by the classic Harvard CV layout as seen in academic and professional examples.

**User's CV Data (JSON):**
${studentData}

---

**YOUR TASKS:**

**1. Generate Styled, Harvard-Style HTML CV (for the 'cv' key):**
* Generate a clean, single-column HTML snippet for the CV. All styling must be contained within a single \`<style>\` block at the top of the HTML string.
* **Layout and Styling Instructions:**
    * **Overall Style:** The design must be minimalist. **Do not use any shadows.** Use padding and margins sparingly, only as needed for clear separation and readability. Avoid excessive whitespace.
    * **Header:**
        * The candidate's name must be in an \`<h1>\` tag, centered, and uppercase.
        * Contact information should be in a single \`<p>\` tag directly below the name, also centered.
        * Place a horizontal rule (\`<hr>\`) after the contact information.
    * **Section Headers:**
        * Use \`<h2>\` for section titles (e.g., 'EDUCATION', 'EXPERIENCE', 'SKILLS').
        * Section headers must be centered, uppercase, and have a light grey background color (e.g., #f2f2f2) with minimal padding.
    * **Content Sections (Experience/Education):**
        * Use a flexbox layout (\`display: flex; justify-content: space-between;\`) to place the institution/company name on the left and dates on the right, on the same line.
        * The degree or job title should appear on the line below.
        * Use a bulleted list (\`<ul>\`, \`<li>\`) for responsibilities and achievements.
* The generated HTML string must be the value for the 'cv' key in the final JSON object.

**2. ATS Scoring and Feedback (for 'atsScore' and 'atsSuggestion' keys):**
* Provide an ATS (Applicant Tracking System) score between 0 and 100. This should be a number and will be the value for the 'atsScore' key.
* Provide a brief, 2-3 sentence reasoning and one actionable suggestion for improvement. This string will be the value for the 'atsSuggestion' key.

**3. Final Output Format:**
* The final output must be **ONLY a single, valid JSON object**.
* The JSON object must have exactly these keys: \`cv\`, \`atsScore\`, \`atsSuggestion\`.
* **DO NOT** wrap the JSON object in markdown fences.

**Example of expected JSON output:**
{
  "cv": "<style>...</style><div class='cv-container'>...</div>",
  "atsScore": 85,
  "atsSuggestion": "Your CV is well-structured. To improve, quantify achievements in your 'Experience' section with metrics like percentages or dollar amounts to better showcase your impact."
}
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