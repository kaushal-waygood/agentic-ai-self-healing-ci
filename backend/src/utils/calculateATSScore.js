import { genAIRequest as genAI } from '../config/gemini.js';
import { User } from '../models/User.model.js';
import { CREDIT_COSTS, resolveUser, spendCredits } from './credits.js';

// ------------------ Keyword Extraction ------------------
export function extractKeywords(jobDescription) {
  return [
    ...new Set(
      jobDescription.toLowerCase().match(/[a-zA-Z\+\#\.]+/g), // fast keyword bucket
    ),
  ];
}

// ------------------ Skills Score (40%) ------------------
export function evaluateSkills(studentSkills, keywords) {
  const matched = studentSkills.filter((s) =>
    keywords.some((k) => s.skill.toLowerCase().includes(k)),
  );

  const missing = keywords.filter(
    (k) => !studentSkills.some((s) => s.skill.toLowerCase().includes(k)),
  );

  const score = Math.min((matched.length / (keywords.length || 1)) * 40, 40);

  return { matched, missing, score };
}

// ------------------ Experience Score (40%) ------------------
export function evaluateExperience(experience, keywords) {
  let relevanceHits = 0;

  experience.forEach((exp) => {
    keywords.forEach((k) => {
      if (exp.description?.toLowerCase().includes(k)) relevanceHits++;
    });
  });

  const score = Math.min(relevanceHits * 2, 40); // tuned weight

  return { score };
}

// ------------------ Education Score (20%) ------------------
export function evaluateEducation(education, jobDescription) {
  const needDegree = /(bachelor|degree|bsc|b\.tech)/i.test(jobDescription);
  const hasDegree = education.some((e) =>
    /(bachelor|degree|bsc|b\.tech)/i.test(e.degree),
  );

  return { score: hasDegree ? 20 : needDegree ? 10 : 15 }; // fallback score
}

// ------------------ Suggestions Generator ------------------
export function generateSuggestions(student, missing) {
  const s = [];
  if (missing.length) s.push(`Learn or improve: ${missing.join(', ')}`);
  if (!student.experience.length) s.push('Add relevant work experience.');
  if (student.projects.length < 2)
    s.push('Add more real projects to boost credibility.');
  if (student.skills.every((s) => s.level === 'BEGINNER'))
    s.push('Increase at least one skill to intermediate level.');
  return s;
}

// ------------------ Resume Rewrite via LLM ------------------
export async function generateTailoredResumeRewrite(student, jobDescription) {
  const rewritePrompt = `
Act as a resume optimization engine.
Rewrite a professional resume summary tailored for this job.
Be concise, impact-driven, ATS-friendly.
Return PLAIN TEXT ONLY.

Job Description: ${jobDescription.slice(0, 1200)}

Experience: ${JSON.stringify(student.experience)}
Skills: ${student.skills.map((s) => s.skill).join(', ')}
Projects: ${student.projects.map((p) => p.projectName).join(', ')}
`;

  const raw = await genAI(rewritePrompt);
  return typeof raw === 'string' ? raw.trim() : raw.text.trim();
}

// ------------------ ATS Main Engine ------------------
export async function computeATS(jobDescription, student) {
  const keywords = extractKeywords(jobDescription.toLowerCase());
  const skills = evaluateSkills(student.skills, keywords);
  const exp = evaluateExperience(student.experience, keywords);
  const edu = evaluateEducation(student.education, jobDescription);

  const finalScore = Math.round(skills.score + exp.score + edu.score);
  const user = await resolveUser(student._id);

  const suggestions = generateSuggestions(student, skills.missing);
  const improvedSummary = await generateTailoredResumeRewrite(
    student,
    jobDescription,
  );

  try {
    await User.updateOne(
      { _id: student._id },
      { $inc: { 'usageCounters.atsScore': 1 } },
    );
  } catch (incErr) {
    console.error(`Failed to increment usage for user ${student._id}:`, incErr);
  }

  return {
    atsScore: finalScore,
    skillsMatched: skills.matched,
    skillsMissing: skills.missing,
    suggestions,
    improvedResumeSummary: improvedSummary,
  };
}
