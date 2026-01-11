export const CVDataPrompt = (pdfData) => {
  return `
Extract the following fields from the resume below. Return only raw JSON. Do NOT include triple backticks or markdown.

Instructions:
- For skills: Include "level" (BEGINNER/INTERMEDIATE/EXPERT) - default to BEGINNER if not specified
- For education: Include "isCurrentlyStudying" (true/false) based on dates
- For experience: Calculate "experienceYrs" from date ranges
- For projects: Include "isWorkingActive" based on dates
- Format dates as ISO strings (YYYY-MM-DD) when possible

-- Resume Data --
- exprierenceYrs must be calculated from startDate and endDate
- isWorkingActive must be calculated from startDate and endDate
- isCurrentlyStudying must be calculated from startDate and endDate
- startDate and endDate must be in (MM-YYYY) format

Example JSON format:
{
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "phone": "+91 1234567890",
  "location": "New York, NY",
  "profileImage": "https://example.com/profile.jpg",
  "resumeUrl": "https://example.com/resume.pdf",
  "jobRole": "Full Stack Developer",
  "skills": [
    { 
      "skillId": "javascript-advanced",
      "skill": "JavaScript", 
      "level": "ADVANCED" 
    },
    { 
      "skillId": "react-intermediate",
      "skill": "React", 
      "level": "INTERMEDIATE" 
    }
  ],
  "education": [
    {
      "educationId": "btech-xyz-university",
      "institute": "XYZ University",
      "degree": "B.Tech",
      "fieldOfStudy": "Computer Science",
      "startDate": "2018-09-01",
      "endDate": "2022-06-30",
      "grade": "3.8 GPA",
      "country": "United States",
      "isCurrentlyStudying": false
    }
  ],
  "experience": [
    {
      "experienceId": "abc-corp-frontend",
      "company": "ABC Corp",
      "title": "Frontend Developer",
      "employmentType": "FULL_TIME",
      "location": "San Francisco, CA",
      "experienceYrs": 2.5,
      "startDate": "2023-01-15",
      "endDate": null,
      "description": "Developed React applications and maintained UI components",
      "currentlyWorking": true
    }
  ],
  "projects": [
    {
      "projectName": "E-Commerce Platform",
      "description": "Full-stack e-commerce solution",
      "startDate": "02-2025",
      "endDate": "02-2026",
      "experienceYrs": 1.5,
      "role": "Full Stack Developer",
      "technologies": ["React", "Node.js", "MongoDB"],
      "link": "https://github.com/example/ecommerce",
      "isWorkingActive": false
    }
  ],
  "jobPreferences": {
    "preferedCountries": ["United States", "Canada"],
    "preferedCities": ["San Francisco", "New York"],
    "isRemote": true,
    "preferedJobTitles": ["Senior Developer", "Tech Lead"],
    "preferedJobTypes": ["FULL_TIME", "CONTRACT"],
    "preferedSalary": {
      "min": 90000,
      "max": 120000,
      "currency": "USD",
      "period": "YEAR"
    },
    "mustHaveSkills": [
      { "skill": "React", "level": "ADVANCED" }
    ]
  }
}

Resume Text:
${pdfData}
`;
};

export const CVDataPromptPilot = (pdfData) => {
  return `
Extract the following fields from the resume below. Return ONLY valid JSON (no markdown, no explanation, no surrounding text). Do NOT include triple backticks.

Instructions:
- For skills: Include "level" (BEGINNER/INTERMEDIATE/EXPERT) - default to BEGINNER if not specified
- For education: Include "isCurrentlyStudying" (true/false) based on dates
- For experience: Calculate "experienceYrs" from date ranges
- For projects: Include "isWorkingActive" based on dates
- Format dates as ISO strings (YYYY-MM-DD) when possible

Resume Text:
${pdfData}
`;
};
