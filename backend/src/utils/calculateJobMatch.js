import { genAIRequest as genAI } from '../config/gemini.js';

/* =========================================================
   Helper Utilities
========================================================= */

const extractKeywords = (text) => [
  ...new Set((text || '').toLowerCase().match(/[a-zA-Z\+\#\.]+/g) || []),
];

const array = (v) => (Array.isArray(v) ? v : []);
const clamp = (v) => Math.max(1, Math.min(Math.round(v), 10));
const top = (arr, n = 5) => array(arr).slice(0, n);

/* =========================================================
   Weight Based ATS Scoring (Skills 40% + Exp 40% + Edu 20%)
========================================================= */

function evaluateSkills(studentSkills, keywords) {
  const matched = studentSkills.filter((s) =>
    keywords.some((k) => s.skill.toLowerCase().includes(k)),
  );
  const missing = keywords.filter(
    (k) => !studentSkills.some((s) => s.skill.toLowerCase().includes(k)),
  );

  const score = Math.min((matched.length / (keywords.length || 1)) * 40, 40);
  return { matched, missing, score };
}

function evaluateExperience(experience, keywords) {
  let hits = 0;
  experience.forEach((exp) => {
    keywords.forEach((k) => {
      if (exp.description?.toLowerCase().includes(k)) hits++;
    });
  });

  return { score: Math.min(hits * 2, 40) };
}

function evaluateEducation(education, jd) {
  const requireDegree = /(bachelor|degree|b\.tech|bsc)/i.test(jd);
  const hasDegree = education.some((e) =>
    /(bachelor|degree|b\.tech|bsc)/i.test(e.degree),
  );

  return { score: hasDegree ? 20 : requireDegree ? 10 : 15 };
}

/* =========================================================
   New Feature: Role Fit %, Seniority %, Tech Fit %
========================================================= */

function computeTechFit(matched, total) {
  return Math.round((matched.length / (total || 1)) * 100);
}

function computeRoleFit(experience, keywords) {
  let hits = 0;

  experience.forEach((exp) => {
    keywords.forEach((k) => {
      if (exp.description?.toLowerCase().includes(k)) hits++;
    });
  });

  return Math.min(Math.round((hits / (keywords.length || 1)) * 100), 100);
}

function computeSeniorityFit(student, jobDescription) {
  const minExpMatch = /(1|2|3|4|5|6|7|8|9|10)\+?\s*years/i.exec(jobDescription);
  const minExp = minExpMatch ? Number(minExpMatch[1]) : 0;
  const userExp = student.totalExperienceYears || 0;

  if (!minExp) return 80; // JD does not specify
  if (userExp >= minExp) return 100;
  if (userExp >= minExp * 0.7) return 75;
  if (userExp >= minExp * 0.4) return 50;
  return 30;
}

/* =========================================================
   Suggestions Engine
========================================================= */

function generateSuggestions(student, missing) {
  const s = [];

  if (missing.length) s.push(`Upskill in: ${missing.slice(0, 8).join(', ')}`);
  if (student.projects.length < 2)
    s.push('Add more production-level projects.');
  if (student.skills.every((x) => x.level === 'BEGINNER'))
    s.push('Upgrade a core skill beyond beginner level.');
  if (!student.experience.length) s.push('Add work experience or internships.');

  return s;
}

/* =========================================================
   AI Resume Summary + Recommendation Text
========================================================= */

async function rewriteRecommendation(student, jobDescription) {
  const prompt = `
You are a professional job-match & resume coach.
Analyze the student's background vs the Job Description and generate:

1) A positive, motivational recommendation paragraph
2) A rewritten resume summary tailored to the job to increase hiring chance

Return strictly JSON (NO markdown, NO backticks):

{
 "recommendation":"text",
 "improvedSummary":"text"
}

JobDescription: ${jobDescription.slice(0, 1500)}
Skills: ${student.skills.map((s) => s.skill).join(', ')}
Projects: ${student.projects.map((p) => p.projectName).join(', ')}
Experience: ${JSON.stringify(student.experience)}
`;

  const raw = await genAI(prompt);
  const text = (typeof raw === 'string' ? raw : raw?.text || '').trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');

  return JSON.parse(text.slice(first, last + 1));
}

/* =========================================================
   FINAL MAIN FUNCTION (Used in Controller)
========================================================= */

export async function calculateJobMatch(jobDescription, student) {
  const keywords = extractKeywords(jobDescription);

  const skills = evaluateSkills(student.skills, keywords);
  const exp = evaluateExperience(student.experience, keywords);
  const edu = evaluateEducation(student.education, jobDescription);

  const weightedScore = skills.score + exp.score + edu.score;
  const matchScore = clamp(weightedScore / 10); // Convert to scale 1–10

  // New %
  const techFit = computeTechFit(skills.matched, keywords.length);
  const roleFit = computeRoleFit(student.experience, keywords);
  const seniorityFit = computeSeniorityFit(student, jobDescription);

  const suggestions = generateSuggestions(student, skills.missing);
  const llm = await rewriteRecommendation(student, jobDescription);

  return {
    matchScore,
    techFitPercent: techFit,
    roleFitPercent: roleFit,
    seniorityFitPercent: seniorityFit,

    breakdown: {
      tech: `${techFit}%`,
      role: `${roleFit}%`,
      seniority: `${seniorityFit}%`,
    },

    skillsMatched: skills.matched,
    skillsMissing: skills.missing,
    suggestions,
    recommendation: llm.recommendation,
    improvedSummary: llm.improvedSummary,
  };
}
