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
- Extract applicant name, phone, and email from the resume for the header
- Use "Dear Sir/Madam" as the greeting (matching Shadab's format)
- Follow Shadab's exact paragraph structure and flow
- Create 6-8 relevant bullet points that match job requirements
- Keep content concise to fit the compressed spacing requirements
- End with "Sincerely," and applicant's name

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
- Generate ONLY the HTML document - absolutely NO explanatory text, instructions, or commentary at the top
- Start immediately with the HTML DOCTYPE declaration
- Use A4 page dimensions (210mm x 297mm) with optimized margins
- CRITICAL: Ensure ALL content fits on exactly ONE page with tight, professional spacing

EXACT FORMATTING SPECIFICATIONS:
- Header: Start 15mm from top, minimal spacing between name and contact info
- Contact format: Simple phone number and email (no "Contact:" or "E-mail:" labels)
- Date: Current date (August 24, 2025), minimal gap after header
- Paragraph spacing: Reduce to 8-12px between paragraphs (not 20px+)
- Line height: 1.3-1.4 maximum for body text
- Bullet points: 4-6px spacing between bullets, proper alignment with solid circles (●)
- Font: Arial 11-12pt, professional and readable
- Margins: Top 15mm, sides 20mm, bottom 15mm
- Section gaps: Minimal spacing throughout

STRUCTURE REQUIREMENTS:
- Header: [APPLICANT NAME] → Phone → Email (tight spacing)
- Date: [Current Date] (small gap after header)
- Greeting: "Dear Sir/Madam" or "Dear Hiring Manager"
- 3 main paragraphs with minimal spacing
- Bullet points (6-8 maximum, tightly spaced)
- Closing paragraphs (minimal spacing)
- Signature: "Sincerely," → [APPLICANT NAME]

SPACE OPTIMIZATION:
- Compress all vertical spacing by 50% compared to typical layouts
- Prioritize content density while maintaining professional appearance
- Ensure no page overflow - adjust content length if necessary

Return ONLY the complete HTML document starting with <!DOCTYPE html>.
`;
};