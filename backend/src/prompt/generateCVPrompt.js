export const generateCVPrompt = (
  jobDescription,
  resumeText,
  finalTouch = '',
) => {
  return `
You are an expert resume parser and formatter. 

Use the following job description to tailor the extracted resume data and return it in clean, valid **JSON format only** (without any markdown or code fences). 

Job Description:
${jobDescription}

Resume:
${resumeText}

Instructions:
- Extract the following fields: fullName, email, phone, skills, education, experience, and projects.
- For each skill, include a "level" field with one of: "BEGINNER", "INTERMEDIATE", or "ADVANCED". If not mentioned, default to "BEGINNER".
- For all date fields, maintain the format as it appears in the resume.
- Use the job description context to prioritize or enrich extracted data when possible.
${finalTouch ? `- Final Touch: ${finalTouch}` : ''}

Return only valid JSON in the structure below:

{
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "phone": "+91 1234567890",
  "skills": [
    { "skill": "JavaScript", "level": "ADVANCED" },
    { "skill": "React", "level": "INTERMEDIATE" },
    { "skill": "Node.js", "level": "BEGINNER" }
  ],
  "education": [
    {
      "institute": "XYZ University",
      "degree": "B.Tech",
      "startYear": 2018,
      "endYear": 2022
    }
  ],
  "experience": [
    {
      "company": "ABC Corp",
      "title": "Frontend Developer",
      "startDate": "Jan 2023",
      "endDate": "Present",
      "description": "Worked on React apps"
    }
  ],
  "projects": [
    {
      "projectName": "Project A",
      "startDate": "Jan 2023",
      "endDate": "Present",
      "description": "Worked on React apps",
      "technologies": ["React", "Node.js"],
      "link": "https://example.com/project-a",
      "isWorkingActive": true
    }
  ]
}
`;
};
