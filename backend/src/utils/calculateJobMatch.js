import { genAI } from '../config/gemini.js';

// Limit long strings
const trimText = (str, maxLen = 500) => {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '... [truncated]';
};

const pickTop = (arr, n = 5) => {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, n);
};

const safeParseJsonFromLLM = (raw) => {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty or non-string LLM response');
  }

  let text = raw.trim();

  // Remove markdown fences if they exist
  if (text.startsWith('```')) {
    const fenced = text.match(/```json?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      text = fenced[1].trim();
    }
  }

  // Try to extract JSON by first and last brace if there's junk around
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No valid JSON object found in LLM response');
  }

  const jsonCandidate = text.slice(firstBrace, lastBrace + 1);

  return JSON.parse(jsonCandidate);
};

// Build a compact student profile
const buildStudentSummary = (student) => {
  // Adapt field names to your schema
  const {
    name,
    headline,
    currentRole,
    totalExperienceYears,
    skills = [],
    education = [],
    experiences = [],
    projects = [],
  } = student;

  return {
    name: name || undefined,
    headline: trimText(headline, 200),
    currentRole: currentRole || undefined,
    totalExperienceYears: totalExperienceYears || null,
    topSkills: pickTop(skills, 15),
    education: pickTop(
      education.map((e) => ({
        degree: e.degree,
        field: e.field,
        institute: e.institute,
      })),
      3,
    ),
    experiences: pickTop(
      experiences.map((exp) => ({
        role: exp.role,
        company: exp.company,
        duration: exp.duration,
        summary: trimText(exp.summary || exp.description || '', 300),
        techStack: pickTop(exp.techStack || [], 10),
      })),
      3,
    ),
    projects: pickTop(
      projects.map((p) => ({
        title: p.title,
        summary: trimText(p.description || '', 250),
        techStack: pickTop(p.techStack || [], 10),
      })),
      3,
    ),
  };
};

// Build a compact job summary from raw JD string
const buildJobSummary = (jobDescription) => {
  // If your JD is already structured, adapt this accordingly
  return {
    rawText: trimText(jobDescription, 2000),
  };
};

export const calculateJobMatch = async (jobDescription, student) => {
  let rawResponse = '';

  const studentSummary = buildStudentSummary(student);
  const jobSummary = buildJobSummary(jobDescription);

  // Optional logging to see how big things are
  console.log('Student summary chars:', JSON.stringify(studentSummary).length);
  console.log('Job summary chars:', JSON.stringify(jobSummary).length);

  const prompt = `
You are an expert career counselor AI. Your primary goal is to encourage and empower students by showing them how their skills can fit a job description.

Analyze the provided **JobSummary** and **StudentSummary** JSON data.

Return a single VALID JSON object ONLY. 
Do NOT include markdown, backticks, or any explanation outside the JSON.
No \` or \json \` wrappers. No extra text.

Scoring rules:
- Your tone must be encouraging and optimistic.
- Score leniently, focusing on potential and transferable skills.
- Score is an integer between 1 and 10.
- 5–6 = potential match with room to grow.
- 7–8 = strong match.
- 1–3 only for complete mismatch of career paths.

JSON RESPONSE FORMAT (MANDATORY):
{
  "matchScore": <integer 1-10>,
  "recommendation": "<single paragraph, highlighting strengths first, then 1–3 constructive suggestions>"
}

JobSummary:
${JSON.stringify(jobSummary, null, 2)}

StudentSummary:
${JSON.stringify(studentSummary, null, 2)}
`;

  try {
    rawResponse = await genAI(prompt);

    const parsedResponse = safeParseJsonFromLLM(
      typeof rawResponse === 'string' ? rawResponse : rawResponse?.text ?? '',
    );

    if (parsedResponse.matchScore > 10) parsedResponse.matchScore = 10;
    if (parsedResponse.matchScore < 1) parsedResponse.matchScore = 1;

    return parsedResponse;
  } catch (error) {
    console.error('Error calculating job match:', error);
    console.error('Raw AI Response that failed parsing:', rawResponse);

    return {
      matchScore: 0,
      recommendation:
        'An error occurred while calculating the match score. Please try again.',
      error: 'Failed to process AI response.',
    };
  }
};
