export const generateCoverLetterPrompt = (
  jobDescription,
  resumeText,
  finalTouch = '',
) => {
  return `
You are a professional career assistant helping job applicants craft tailored cover letters for specific roles.

Use the applicant's resume and the job description below to write a compelling and personalized cover letter.

Job Description:
${jobDescription}

Applicant Resume:
${resumeText}

Instructions:
- Address the letter to the hiring manager or use a general greeting like "Dear Hiring Manager,"
- Highlight the applicant's most relevant experience and skills that align with the job description.
- Keep the tone professional, concise, and confident.
- Limit the cover letter to 3-4 paragraphs.
- Emphasize why the applicant is a strong fit for both the company and the role.
${finalTouch ? `- Final Touch: ${finalTouch}` : ''}

Output Format:
- Greeting: "Dear Hiring Manager,"
- Body: [write the main content of the letter]
- Signature: "Sincerely,"
- Closing: "Best regards,"
- Name: "John Doe"

Strict Formatting Requirements:
- Output must be *plain text only*
- Absolutely do NOT include any HTML tags (e.g. <body>, <div>, <p>, etc.)
- Do NOT use any CSS, inline styles, class names, or IDs
- Do NOT add borders, shadows, colors, or any visual styles
- Do NOT wrap text in markdown, code blocks, or use special formatting
- The response must be clean, readable plain text suitable for pasting into a form or webpage

Only return the final cover letter text. Nothing else.
`;
};

export const generateCoverLetterPrompts = (
  jobTitle,
  studentData,
  userQuery,
) => {
  // Parse the student data to extract the most relevant information for the prompt.
  const studentProfile = JSON.parse(studentData);
  const candidateInfo = {
    fullName: studentProfile.fullName,
    email: studentProfile.email,
    phone: studentProfile.phone,
    education: studentProfile.education,
    experience: studentProfile.experience,
    skills: studentProfile.skills,
    projects: studentProfile.projects,
  };

  const formatPrettyDate = () => {
    const d = new Date();
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month}., ${year}`;
  };

  return `You are an expert career coach tasked with creating a powerful, general-purpose cover letter template. The final output must be a clean, unstyled, and semantically structured HTML string.

**TARGET ROLE:**
${jobTitle}

**CANDIDATE'S PROFILE (JSON):**
${JSON.stringify(candidateInfo, null, 2)}

**USER'S SPECIFIC REQUEST:**
${
  userQuery ||
  'Focus on making the letter impactful and versatile for multiple applications.'
}

---

**YOUR TASKS:**

**1. Generate a General-Purpose HTML Cover Letter:**
* This is a **template** cover letter, not for a specific company. **Do NOT** invent a company name, address, or hiring manager.
* Use a generic salutation like "Dear Hiring Manager,".
* The entire output must be a single block of simple HTML. Do **NOT** include \`<html>\`, \`<body>\`, or \`<head>\` tags.
* **Styling Constraint:** The output **MUST NOT** contain any CSS. Do not use \`<style>\` tags or inline \`style="..."\` attributes. You may only use class names for styling hooks.

**2. Content Strategy:**
* Write a compelling opening paragraph that introduces the candidate and their strong interest in the **${jobTitle}** field.
* In the body (1-2 paragraphs), synthesize the most impressive skills, experiences, and projects from the candidate's profile to build a strong case for their expertise in this role. Highlight achievements and quantify results where possible.
* Create a confident closing paragraph with a clear call to action, encouraging the reader to review the candidate's resume and discuss potential opportunities.
* The overall tone should be professional and adaptable, making it a perfect template for multiple job applications.

**3. HTML Structure & Formatting:**
* Wrap the entire cover letter in a single \`<div>\`.
* Start with the candidate's contact information (Name, Phone, Email).
* Follow a standard business letter format using \`<p>\` tags for paragraphs and \`<br>\` for line breaks within a block.
* As requested, use the class "roboto-font" on the main container div. For example: \`<div class="roboto-font">...</div>\`.
* **Permitted Tags:** You may only use \`div\`, \`p\`, \`br\`, and \`strong\`.
* always takes real date which already comes form function formatPrettyDate which is ${formatPrettyDate()}

**Example of expected raw HTML output:**
<div class="roboto-font">
  <div>
    <p><strong>Mohd Arsalan</strong><p>
    <p>+91 9711 62 9495</p>
    <p>arsalanden@gmail.com</p>
    <p>12 May 2023</p>
  </div>
  <p></p>
  <p>Dear Hiring Manager,</p>
  <p>I am writing to express my profound interest in MERN Stack Developer opportunities. With over two years of hands-on experience developing and maintaining full-stack applications, I have a proven track record of building robust backend services with Node.js/Express.js and creating dynamic, responsive user interfaces with React.</p>
  <p>My experience at Padhai Karo involved implementing REST APIs, integrating AWS S3 for asset management, and participating in the full software development lifecycle. I am confident that my technical skills and project experience, detailed in my attached resume, make me a strong candidate for a role requiring a dedicated and proficient developer.</p>
  <p>Thank you for your consideration. I am eager to discuss how my expertise can contribute to your team's success.</p>
  
</div>
`;
};
