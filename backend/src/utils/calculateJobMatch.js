import { genAIRequest as genAI } from '../config/gemini.js';

/* =========================================================
   WHY THIS APPROACH
   
   Previous versions used keyword extraction (stop-words, fluff-word
   lists, tech whitelists) to compare JD against candidate profile.
   Every approach failed on domain diversity:
   - Stop-word filter: floods keywords with prose ("binding","hats","analysts")
   - Fluff-word filter: requires maintaining domain-specific lists forever
   - Tech whitelist: works for MERN, fails for pharma/finance/legal/HR/design
   
   Root cause: text parsing cannot reliably identify "what skills this JD
   requires" across all domains. That is exactly what an LLM is good at.
   
   Solution: two parallel AI calls.
   1. SCORING CALL  — structured JSON, returns all numeric scores + matched/
      missing skills. Fast, deterministic, domain-agnostic.
   2. RECOMMENDATION CALL — free-text recommendation + improved summary.
   
   Both run in parallel so total latency = max(t1, t2), not t1+t2.
   No keyword extraction. No domain assumptions. No lists to maintain.
========================================================= */

const clamp = (v, min = 1, max = 10) =>
  Math.max(min, Math.min(Math.round(v), max));

const pct = (v) => Math.max(0, Math.min(100, Math.round(v)));

/* =========================================================
   Candidate profile serialiser
   Produces a compact, readable summary for the AI prompt.
   Compact = fewer tokens = faster + cheaper.
========================================================= */

function serialiseCandidate(student) {
  const skills = (student.skills || [])
    .map((s) => `${s.skill}${s.level ? ` (${s.level})` : ''}`)
    .join(', ');

  const experience = (student.experience || [])
    .map((e) => {
      const yrs = e.experienceYrs ? ` — ${e.experienceYrs} yrs` : '';
      const desc = e.description ? `\n    ${e.description}` : '';
      return `  • ${e.title || 'Role'} at ${e.company || '?'}${yrs}${desc}`;
    })
    .join('\n');

  const education = (student.education || [])
    .map((e) => `  • ${e.degree || '?'} — ${e.institute || '?'}`)
    .join('\n');

  const projects = (student.projects || [])
    .map((p) => {
      const tech =
        Array.isArray(p.technologies) && p.technologies.length
          ? ` [${p.technologies.join(', ')}]`
          : '';
      return `  • ${p.projectName}${tech}: ${p.description || ''}`;
    })
    .join('\n');

  const totalYrs = (student.experience || []).reduce(
    (s, e) => s + (Number(e.experienceYrs) || 0),
    0,
  );

  return [
    `SKILLS: ${skills || 'None listed'}`,
    `TOTAL EXPERIENCE: ${totalYrs} years`,
    experience ? `EXPERIENCE:\n${experience}` : 'EXPERIENCE: None',
    education ? `EDUCATION:\n${education}` : 'EDUCATION: None',
    projects ? `PROJECTS:\n${projects}` : 'PROJECTS: None',
  ].join('\n\n');
}

/* =========================================================
   CALL 1 — Structured scoring
   Returns all numeric scores + matched/missing skill lists.
   Prompt asks strictly for JSON so parsing is reliable.
========================================================= */

const SCORING_PROMPT = (jd, jobTitle, candidateSummary) =>
  `
You are an expert recruitment analyst. Evaluate how well this candidate matches the job.

Analyse the Job Description carefully to identify the required skills, technologies,
domain knowledge, experience level and qualifications — regardless of industry or domain
(tech, finance, pharma, legal, HR, design, operations, etc.).

Then evaluate the candidate against each dimension.

Return ONLY valid JSON. No markdown, no backticks, no explanation outside the JSON.

{
  "matchScore": <integer 1-10>,
  "skillsFitPercent": <integer 0-100>,
  "experienceFitPercent": <integer 0-100>,
  "seniorityFitPercent": <integer 0-100>,
  "skillsMatched": ["skill1", "skill2"],
  "skillsMissing": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "poorFit": <true|false>
}

Rules:
- matchScore: overall fit 1–10 (10 = perfect match).
- skillsFitPercent: % of JD-required skills/tools/knowledge the candidate has.
- experienceFitPercent: % match between candidate's work history and JD requirements.
- seniorityFitPercent: how well candidate's experience level matches the JD seniority.
- skillsMatched: specific skills/tools from the JD that the candidate has.
- skillsMissing: specific skills/tools from the JD that the candidate lacks.
- suggestions: 2–4 concrete, actionable steps to improve this candidate's fit.
- poorFit: true only if this is a fundamentally different domain (e.g. software dev applying to surgeon role).
- Be accurate and honest. Do not inflate scores. Do not deflate for minor gaps.
- Domain does not matter — evaluate finance, pharma, tech, legal, HR equally rigorously.

JOB TITLE: ${jobTitle || 'Not specified'}

JOB DESCRIPTION:
${jd.slice(0, 3000)}

CANDIDATE PROFILE:
${candidateSummary}
`.trim();

/* =========================================================
   CALL 2 — Recommendation text
   Free-text, runs in parallel with scoring call.
========================================================= */

const RECOMMENDATION_PROMPT = (jd, jobTitle, candidateSummary) =>
  `
You are a professional resume coach and career advisor.

Write two things:
1. "recommendation": A 3–5 sentence honest, motivational assessment of how well this
   candidate fits the role. Mention specific matching strengths AND gaps if any.
   Be domain-agnostic — works for tech, finance, pharma, legal, etc.
2. "improvedSummary": A 3–4 sentence resume summary rewritten specifically for this
   job to maximise the candidate's chances. Use the candidate's real experience —
   do not invent anything.

Return ONLY valid JSON. No markdown, no backticks.
{ "recommendation": "text", "improvedSummary": "text" }

JOB TITLE: ${jobTitle || 'Not specified'}

JOB DESCRIPTION:
${jd.slice(0, 2000)}

CANDIDATE PROFILE:
${candidateSummary}
`.trim();

/* =========================================================
   Safe JSON parser — handles minor AI formatting slips
========================================================= */

function safeParseJSON(raw) {
  const text = (typeof raw === 'string' ? raw : String(raw || ''))
    .replace(/```json|```/g, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (_) {}

  // Try extracting first {...} block
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch (_) {}
  }

  return null;
}

/* =========================================================
   Fallback scoring — used when AI scoring call fails.
   Pure algorithmic, domain-agnostic at the text level.
   Not great, but better than crashing.
========================================================= */

function algorithmicFallback(student, jd) {
  // Only thing we can do without domain knowledge: check if candidate
  // has ANY content vs an empty profile
  const hasSkills = (student.skills || []).length > 0;
  const hasExperience = (student.experience || []).length > 0;
  const hasEducation = (student.education || []).length > 0;

  const completeness = [hasSkills, hasExperience, hasEducation].filter(
    Boolean,
  ).length;

  return {
    matchScore: Math.max(1, completeness * 2), // 2, 4, or 6
    skillsFitPercent: hasSkills ? 30 : 0,
    experienceFitPercent: hasExperience ? 30 : 0,
    seniorityFitPercent: 50,
    skillsMatched: [],
    skillsMissing: [],
    suggestions: [
      'Complete your profile with skills, experience and education for accurate scoring.',
    ],
    poorFit: false,
    _fallback: true, // internal flag, not sent to client
  };
}

/* =========================================================
   MAIN EXPORT
========================================================= */

export async function calculateJobMatch(
  jobDescription,
  student,
  jobTitle = '',
) {
  const candidateSummary = serialiseCandidate(student);

  // ── Run both AI calls in parallel ──────────────────────────────────
  const [scoringResult, recommendationResult] = await Promise.allSettled([
    genAI(
      SCORING_PROMPT(jobDescription, jobTitle, candidateSummary),
      { endpoint: 'job-match-scoring', temperature: 0.1 },
      // low temperature = more deterministic numeric output
    ),
    genAI(RECOMMENDATION_PROMPT(jobDescription, jobTitle, candidateSummary), {
      endpoint: 'job-match-recommendation',
      temperature: 0.5,
    }),
  ]);

  // ── Parse scoring result ────────────────────────────────────────────
  let scores;
  if (scoringResult.status === 'fulfilled') {
    scores = safeParseJSON(scoringResult.value);
  }

  if (!scores || typeof scores.matchScore !== 'number') {
    // AI scoring failed or returned unparseable output → algorithmic fallback
    console.warn('Job match scoring AI failed, using algorithmic fallback');
    scores = algorithmicFallback(student, jobDescription);
  }

  // ── Parse recommendation result ─────────────────────────────────────
  let llm = { recommendation: null, improvedSummary: null };
  if (recommendationResult.status === 'fulfilled') {
    llm = safeParseJSON(recommendationResult.value) || llm;
  }

  // If recommendation AI failed, generate a minimal programmatic one
  // using the scores we already have
  if (!llm.recommendation) {
    const fit =
      scores.matchScore >= 7
        ? 'strong'
        : scores.matchScore >= 5
          ? 'moderate'
          : 'limited';
    const topSkills = (student.skills || [])
      .slice(0, 4)
      .map((s) => s.skill)
      .join(', ');
    llm.recommendation =
      `Your profile shows a ${fit} match for this role (${scores.matchScore}/10). ` +
      (scores.skillsMatched?.length
        ? `Key matching strengths: ${scores.skillsMatched.slice(0, 5).join(', ')}. `
        : '') +
      (scores.skillsMissing?.length
        ? `Consider developing: ${scores.skillsMissing.slice(0, 3).join(', ')}.`
        : '');
    llm.improvedSummary =
      `Professional with expertise in ${topSkills || 'relevant skills'}, ` +
      `seeking to contribute to this role with hands-on experience and ` +
      `a track record of delivering results.`;
  }

  // ── Clamp / sanitise all numeric fields from AI output ─────────────
  const matchScore = clamp(scores.matchScore ?? 1, 1, 10);
  const skillsFitPercent = pct(scores.skillsFitPercent ?? 0);
  const experienceFitPercent = pct(scores.experienceFitPercent ?? 0);
  const seniorityFitPercent = pct(scores.seniorityFitPercent ?? 0);
  const skillsMatched = Array.isArray(scores.skillsMatched)
    ? scores.skillsMatched
    : [];
  const skillsMissing = Array.isArray(scores.skillsMissing)
    ? scores.skillsMissing
    : [];
  const suggestions = Array.isArray(scores.suggestions)
    ? scores.suggestions
    : [];

  return {
    matchScore,
    skillsFitPercent,
    experienceFitPercent,
    seniorityFitPercent,
    // backward compat aliases
    techFitPercent: skillsFitPercent,
    roleFitPercent: experienceFitPercent,
    breakdown: {
      skills: `${skillsFitPercent}%`,
      experience: `${experienceFitPercent}%`,
      seniority: `${seniorityFitPercent}%`,
    },
    skillsMatched,
    skillsMissing,
    suggestions,
    recommendation: llm.recommendation || '',
    improvedSummary: llm.improvedSummary || '',
  };
}
