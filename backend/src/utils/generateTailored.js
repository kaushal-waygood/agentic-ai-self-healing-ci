export const generateCVPrompts = (data) => {
  const { title, company, description, candidate } = data;

  return `You are an expert career coach and CV generator. Your task is to generate a professional, Harvard-style, and semantically structured HTML CV based on user data and a target job description. The final output should be a single block of HTML with all CSS styling contained within a <style> tag.

The visual style should be clean, professional, and inspired by the classic Harvard CV layout as seen in academic and professional examples.

**Job Description:**
${description}

**User's CV Data (JSON):**
${candidate}

---

**YOUR TASKS:**

**1. Generate Styled, Harvard-Style HTML CV:**
* Generate a clean, single-column HTML snippet for the CV. All styling must be contained within a single \`<style>\` block at the top of the HTML string.
* **Layout and Styling Instructions:**
    * **Overall Style:** The design must be minimalist. **Do not use any shadows.** Use padding and margins sparingly, only as needed for clear separation and readability. Avoid excessive whitespace.
    * **Header:**
        * The candidate's name must be in an \`<h1>\` tag, centered, and uppercase.
        * Contact information (e.g., Phone | Email | Address) should be in a single \`<p>\` tag directly below the name, also centered.
        * Place a horizontal rule (\`<hr>\`) after the contact information.
    * **Section Headers:**
        * Use \`<h2>\` for section titles (e.g., 'EDUCATION', 'EXPERIENCE', 'SKILLS').
        * Section headers must be centered, uppercase, and have a light grey background color (e.g., #f2f2f2) with minimal padding (e.g., 5px to 8px) for readability.
    * **Content Sections (Experience/Education):**
        * For each entry, use a container \`<div>\`.
        * Use a flexbox layout (\`display: flex; justify-content: space-between;\`) to place the institution/company name on the left and the dates on the right, ensuring they are on the same line.
        * The degree or job title should appear on the line below.
        * Use a bulleted list (\`<ul>\`, \`<li>\`) for responsibilities, achievements, or other details.
* **Permitted Tags:** You may use \`div\`, \`style\`, \`h1\`, \`h2\`, \`p\`, \`ul\`, \`li\`, \`hr\`, \`span\`.
* **Do NOT** include \`<html>\`, \`<body>\`, or \`<head>\` tags.

**2. Content Tailoring and Generation:**
* The content must be tailored to the target role of '${title}' at '${company}'.
* Rewrite job responsibilities to be impactful and action-oriented, using keywords from the job description.
* **Handling Incomplete Data:** If essential sections (like 'experience' or 'education') are missing from the user data, you **MUST** generate realistic and relevant placeholder content tailored for the target role.

**3. Final Output Format:**
* The final output must be **ONLY the raw HTML string** for the CV, which includes the \`<style>\` block.
* **DO NOT** wrap the output in JSON format or markdown fences.

**Example of expected raw HTML output:**
<style>
  .cv-container { font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: auto; padding: 0; }
  .cv-container h1 { text-align: center; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 2px; font-weight: normal; }
  .cv-container .contact-info { text-align: center; margin-top: 0; font-size: 0.9em; }
  .cv-container hr { border: 0; border-top: 1px solid #ccc; margin: 15px 0; }
  .cv-container h2 { text-align: center; text-transform: uppercase; background-color: #f2f2f2; padding: 5px; margin: 15px 0 10px 0; font-size: 1.1em; letter-spacing: 1.5px; }
  .entry { margin-bottom: 15px; }
  .entry-header { display: flex; justify-content: space-between; font-weight: bold; }
  .entry ul { padding-left: 20px; margin-top: 5px; }
  .entry li { margin-bottom: 5px; }
</style>
<div class="cv-container">
  <h1>Tomthil</h1>
  <p class="contact-info">Jersey City, NJ | (555) 123-4567 | arsalanden@gmail.com</p>
  <hr>
  <h2>Professional Summary</h2>
  <p>A results-oriented Full Stack Developer...</p>
</div>
`;
};

export const generateCoverLetterPrompts = (data) => {
  const { job, candidate, coverLetter, preferences } = data;
  return `You are an expert career coach and professional writer. Your task is to generate a professional, unstyled, and semantically structured HTML cover letter. The final output must be a single block of simple HTML.

The visual style should be extremely simple, containing no CSS, to ensure it renders correctly on any platform and fits on a single page.

**JOB DETAILS:**
Job Title: ${job.title}
Company: ${job.company}
Job Description:
${job.description}

**CANDIDATE INFORMATION:**
${JSON.stringify(candidate, null, 2)}

**EXISTING COVER LETTER (if any):**
${coverLetter ? `Use this as a reference:\n${coverLetter}` : 'None provided'}

**ADDITIONAL INSTRUCTIONS/PREFERENCES:**
${preferences || 'None provided'}

---

**YOUR TASKS:**

**1. Generate Unstyled HTML Cover Letter:**
* Generate a clean, single-column HTML snippet for the cover letter.
* **Crucial Styling Constraint:** The output **MUST NOT** contain any CSS. Do not use \`<style>\` tags, inline \`style="..."\` attributes, or any styling elements like borders, margins, or padding. The HTML must be purely semantic to ensure it fits on a single page without rendering issues.
* **Structure:** Follow a standard business letter format.
    * Candidate's contact information at the top.
    * Date.
    * Hiring Manager/Company information.
    * Salutation (e.g., "Dear Hiring Manager,").
    * Body paragraphs, each enclosed in \`<p>\` tags.
    * Closing (e.g., "Sincerely,").
    * Candidate's name.
* **Permitted Tags:** You may use \`div\`, \`p\`, \`br\`, \`strong\`.
* **Do NOT** include \`<html>\`, \`<body>\`, or \`<head>\` tags.

**2. Content Tailoring:**
* The tone should be confident, professional, and tailored to the '${
    job.title
  }' role at '${job.company}'.
* Craft the opening paragraph to grab the reader's attention.
* The body paragraphs (1-2) must connect the candidate's skills and experiences directly to the key requirements in the job description.
* The closing paragraph should include a clear call to action.

**3. Final Output Format:**
* **Do NOT** do not use any tags for styling you can use only classes and id's
* use roboto font for all text in coverletter html.
* The final output must be **ONLY the raw HTML string** for the cover letter.
* **Do NOT** include any other HTML tags, attributes, or CSS.

**Example of expected raw HTML output:**
<div>
  <div>
    <p>Tomthil<br>
    Anytown, USA<br>
    (555) 123-4567<br>
    arsalanden@gmail.com</p>
  </div>
  <p>September 6, 2025</p>
  <p>Hiring Manager<br>
  TSR Consulting Services, Inc.<br>
  Jersey City, NJ</p>
  <p><strong>Dear Hiring Manager,</strong></p>
  <p>I am writing to express my keen interest in the Full Stack Developer position at TSR Consulting Services, Inc., as advertised on [Platform where job was seen]. With my background in .Net and Angular, and my experience in developing robust web applications, I am confident I possess the skills and qualifications necessary to excel in this role.</p>
  <p>Thank you for your time and consideration. I have attached my CV for your review and welcome the opportunity to discuss how my expertise can benefit your team.</p>
  <div>
    <p>Sincerely,</p>
    <p>Tomthil</p>
  </div>
</div>
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
  return response.replace(/```html|```/g, '').trim();
};

export const processCoverLetterResponse = (response) => {
  return response.replace(/```html|```/g, '').trim();
};

export const processEmailResponse = (response) => {
  return response.replace(/```html|```/g, '').trim();
};
