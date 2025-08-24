export const generateCoverLetterPrompt = (
  jobDescription,
  resumeText,
  finalTouch = '',
) => {
return `
You are a professional career assistant. Create a tailored cover letter using the job description and resume provided.

Job Description:
${jobDescription}

Applicant Resume:
${resumeText}

Requirements:
- Follow the EXACT structure and formatting of the reference cover letter provided below
- Address the letter with "Dear Sir/Madam" or "Dear Hiring Manager"
- Start with an opening paragraph expressing interest in the specific position
- Include a second paragraph about being challenged and learning new technologies
- Add a third paragraph that states "Your listed requirements closely match my background and skills. A few I would like to highlight that would enable me to contribute to your bottom line are:"
- Follow with a bulleted list (6-8 bullet points) of relevant technical skills and experience that match the job requirements
- Include a paragraph mentioning attached profile/resume details
- End with a thank you paragraph and looking forward to speaking about the opportunity
- Close with "Sincerely," followed by the applicant's name

${finalTouch ? `- Additional Requirements: ${finalTouch}` : ''}

REFERENCE COVER LETTER STRUCTURE TO FOLLOW:
---
Dear Sir/Madam

This letter is to express my interest in your posting for an experienced [POSITION TITLE]. With a [DEGREE/QUALIFICATION] and hands-on experience using [RELEVANT TECHNOLOGY/FIELD] to create and implement complex solutions, I am confident I will be an asset to your project.

I enjoy being challenged and engaging with projects that require me to work outside my comfort and knowledge set, as continuing to learn new languages and development techniques are important to me and the success of your organization.

Your listed requirements closely match my background and skills. A few I would like to highlight that would enable me to contribute to your bottom line are:

● [Relevant skill/experience point 1]
● [Relevant skill/experience point 2]
● [Relevant skill/experience point 3]
● [Relevant skill/experience point 4]
● [Relevant skill/experience point 5]
● [Relevant skill/experience point 6]
● [Relevant skill/experience point 7]
● [Relevant skill/experience point 8]

I've attached a profile that details my projects and experience in [relevant field]. I can be reached anytime.

Thank you for your time and consideration. I look forward to speaking with you about this opportunity.

Sincerely,
[Applicant Name]
---

OUTPUT FORMAT REQUIREMENTS:
- Generate ONLY the HTML document - no explanatory text or instructions at the top
- Use A4 page dimensions (210mm x 297mm) with proper margins
- CRITICAL: Ensure ALL content fits on exactly ONE page - adjust font size, spacing, and bullet points as needed
- Include applicant's name, phone, email, and current date at the top
- Use professional fonts (Arial/Times New Roman, 11-12pt)
- Style bullet points with solid circles (●)
- Structure: Header info → Date → Greeting → 3 paragraphs → Bullet points (6-8 max) → Closing paragraphs → Signature
- Optimize spacing and content length to prevent page overflow
- Make print-ready for A4 paper

Return ONLY the complete HTML document with no additional text.
`;
};