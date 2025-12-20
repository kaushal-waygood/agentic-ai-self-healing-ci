// src/utils/atsScore.js

export function calculateATSScore(cvText, jobText) {
  const normalize = (t) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9+.#]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const cvTokens = new Set(normalize(cvText));
  const jobTokens = new Set(normalize(jobText));

  let matched = 0;
  jobTokens.forEach((t) => {
    if (cvTokens.has(t)) matched += 1;
  });

  const rawScore = Math.round((matched / jobTokens.size) * 100);

  return Math.min(95, Math.max(40, rawScore)); // clamp for realism
}
