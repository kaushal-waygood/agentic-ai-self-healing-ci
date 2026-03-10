import { genAIRequest as genAI } from '../config/gemini.js';

/* =========================================================
   Helper Utilities
========================================================= */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'you',
  'we', 'they', 'this', 'that', 'these', 'those', 'it', 'its',
]);

// Company blurb / marketing words that inflate keyword count but aren't job requirements
const JD_FLUFF = new Set([
  'work', 'one', 'finest', 'companies', 'aimed', 'making', 'life', 'easier',
  'every', 'employee', 'employer', 'our', 'client', 'provide', 'wide', 'range',
  'include', 'among', 'other', 'features', 'works', 'leading', 'startups', 'well',
  'bigger', 'corporate', 'team', 'founded', 'led', 'business', 'experts', 'who',
  'bring', 'them', 'more', 'than', 'decades', 'experience', 'sales', 'marketing',
  'transformation', 'seamless', 'their', 'clients', 'building', 'easy', 'system',
  'directly', 'affecting', 'culture', 'workplace', 'positively', 'solving',
  'challenges', 'what', 'future', 'use', 'helping', 'creating', 'vision', 'roadmap',
  'payroll', 'product', 'company', 'built', 'modern', 'services', 'automated',
  'recruitment', 'candidate', 'management', 'digital', 'assessment', 'tools',
  'analytics', 'leave', 'performance', 'exit', 'engagement', 'iso', 'iec', 'certified',
]);

const extractKeywords = (text) => {
  const words = (text || '').toLowerCase().match(/[a-zA-Z\+\#\.]{2,}/g) || [];
  return [...new Set(words)].filter(
    (w) =>
      !STOP_WORDS.has(w) &&
      !JD_FLUFF.has(w) &&
      w.length >= 3,
  );
};

const array = (v) => (Array.isArray(v) ? v : []);
const clamp = (v) => Math.max(1, Math.min(Math.round(v), 10));
const top = (arr, n = 5) => array(arr).slice(0, n);

/* =========================================================
   Weight Based ATS Scoring (Skills 40% + Exp 40% + Edu 20%)
========================================================= */

function evaluateSkills(studentSkills, keywords) {
  const meaningfulKeywords = keywords.filter((k) => k.length >= 3);
  const matched = studentSkills.filter((s) =>
    meaningfulKeywords.some((k) => s.skill.toLowerCase().includes(k)),
  );
  const missing = meaningfulKeywords.filter(
    (k) => !studentSkills.some((s) => s.skill.toLowerCase().includes(k)),
  );

  const score = Math.min((matched.length / (meaningfulKeywords.length || 1)) * 40, 40);
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

// Skills match: how well CV skills align with job description requirements (works for any job type)
function computeSkillsFit(matched, totalKeywords) {
  const n = matched.length;
  if (n === 0) return 0;
  const denom = Math.max(n, Math.min(totalKeywords, 40));
  return Math.min(100, Math.round((n / denom) * 100));
}

// Experience match: how well work experience descriptions align with job description keywords
function computeExperienceFit(experience, keywords) {
  let hits = 0;

  experience.forEach((exp) => {
    keywords.forEach((k) => {
      if (exp.description?.toLowerCase().includes(k)) hits++;
    });
  });

  return Math.min(Math.round((hits / (keywords.length || 1)) * 100), 100);
}

// Seniority match: years of experience vs JD requirements
function computeSeniorityFit(student, jobDescription, poorFit = false) {
  if (poorFit) return 0; // Don't inflate seniority when skills don't align
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

function generateSuggestions(student, missing, poorFit = false) {
  const s = [];

  if (poorFit) {
    s.push('This role appears to be in a different domain than your profile. Consider applying to roles that align with your skills and experience.');
    return s;
  }
  if (missing.length) s.push(`Upskill in: ${missing.slice(0, 8).join(', ')}`);
  if ((student.projects || []).length < 2)
    s.push('Add more production-level projects.');
  if ((student.skills || []).every((x) => x.level === 'BEGINNER'))
    s.push('Upgrade a core skill beyond beginner level.');
  if (!(student.experience || []).length) s.push('Add work experience or internships.');

  return s;
}

/* =========================================================
   AI Resume Summary + Recommendation Text
========================================================= */

async function rewriteRecommendation(
  student,
  jobDescription,
  jobTitle = '',
  poorFit = false,
  skillsFit = 0,
  experienceFit = 0,
) {
  // When poor fit: use programmatic fallback so we never get overly optimistic LLM output
  if (poorFit) {
    const topSkills = (student.skills || [])
      .slice(0, 5)
      .map((s) => s.skill)
      .join(', ');
    return {
      recommendation:
        'Your profile has limited overlap with this role (skills match ' +
        skillsFit +
        '%, experience match ' +
        experienceFit +
        '%). This position may not align well with your background. Consider focusing on roles that match your experience—for example, positions that require ' +
        (topSkills || 'your core skills') +
        '.',
      improvedSummary:
        'Highlight your strengths for roles in your domain. Emphasize ' +
        (topSkills || 'your most relevant skills and experience') +
        ' when applying to positions that align with your profile.',
    };
  }

  const prompt = `
You are a professional job-match & resume coach.
Analyze the student's background vs the Job Description and generate:
- recommendation: A positive, motivational paragraph about their fit for this role.
- improvedSummary: A rewritten resume summary tailored to this job to increase hiring chance.

Return strictly JSON (NO markdown, NO backticks):
{
 "recommendation":"text",
 "improvedSummary":"text"
}

Job Title: ${jobTitle || 'Not provided'}
Job Description: ${jobDescription.slice(0, 1500)}
Student Skills: ${(student.skills || []).map((s) => s.skill).join(', ')}
Student Projects: ${(student.projects || []).map((p) => p.projectName).join(', ')}
Student Experience: ${JSON.stringify(student.experience || [])}
`;

  try {
    const raw = await genAI(prompt);
    const text = (typeof raw === 'string' ? raw : raw?.text || '').trim();
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    return JSON.parse(text.slice(first, last + 1));
  } catch (e) {
    return {
      recommendation:
        'We could not generate a tailored recommendation. Review the job requirements and highlight relevant experience in your application.',
      improvedSummary: 'Focus on transferable skills and relevant experience in your summary.',
    };
  }
}

/* =========================================================
   FINAL MAIN FUNCTION (Used in Controller)
========================================================= */

export async function calculateJobMatch(jobDescription, student, jobTitle = '') {
  const fullContext = `${jobTitle || ''} ${jobDescription || ''}`;
  const keywords = extractKeywords(fullContext);

  const skills = evaluateSkills(student.skills || [], keywords);
  const exp = evaluateExperience(student.experience || [], keywords);
  const edu = evaluateEducation(student.education || [], jobDescription);

  const skillsFit = computeSkillsFit(skills.matched, keywords.length);
  const experienceFit = computeExperienceFit(student.experience || [], keywords);

  // Poor fit: no skill overlap, OR skills+experience fit both very low (mismatched role)
  const poorFit =
    (skills.matched.length === 0 && keywords.length >= 5) ||
    (skillsFit < 15 && experienceFit < 25);

  let weightedScore = skills.score + exp.score + edu.score;
  if (poorFit) {
    weightedScore = Math.min(weightedScore, 12); // Cap at ~1/10 when poor fit
  }
  const matchScore = clamp(weightedScore / 10);

  const seniorityFit = computeSeniorityFit(student, jobDescription, poorFit);

  const suggestions = generateSuggestions(student, skills.missing, poorFit);
  const llm = await rewriteRecommendation(
    student,
    jobDescription,
    jobTitle,
    poorFit,
    skillsFit,
    experienceFit,
  );

  return {
    matchScore,
    skillsFitPercent: skillsFit,
    experienceFitPercent: experienceFit,
    seniorityFitPercent: seniorityFit,
    // Backward compatibility
    techFitPercent: skillsFit,
    roleFitPercent: experienceFit,

    breakdown: {
      skills: `${skillsFit}%`,
      experience: `${experienceFit}%`,
      seniority: `${seniorityFit}%`,
    },

    skillsMatched: skills.matched,
    skillsMissing: skills.missing,
    suggestions,
    recommendation: llm.recommendation,
    improvedSummary: llm.improvedSummary,
  };
}
