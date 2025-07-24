export const CVDataPrompt = (pdfData) => {
  return `
Extract the following fields from the resume below. Return only raw JSON. Do NOT include triple backticks or markdown.

Instructions:
- For each skill, include a "level" field with values: "BEGINNER", "INTERMEDIATE", or "ADVANCED".
- If no level is mentioned in the resume, default the level to "BEGINNER".

Example JSON format:
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
  ]
    "projects": [
      {
        "projectName": "Project A",
        "startDate": "Jan 2023",
        "endDate": "Present",
        "description": "Worked on React apps"
        "technologies": ["React", "Node.js"],
        "link": "https://example.com/project-a"
        "isWorkingActive": true
        "description": "Worked on React apps"
      }
    ]
}

Resume:
${pdfData}
`;
};
