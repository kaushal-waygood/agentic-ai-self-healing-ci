// src/utils/profileHydration.js

const norm = (s) => (s ? String(s).trim() : s);
const lower = (s) => (s ? String(s).trim().toLowerCase() : s);

const EMPLOYMENT_TYPE_MAP = new Map([
  ['full-time', 'FULL_TIME'],
  ['full_time', 'FULL_TIME'],
  ['full time', 'FULL_TIME'],
  ['["full-time"]', 'FULL_TIME'],
  ['part-time', 'PART_TIME'],
  ['part time', 'PART_TIME'],
  ['contract', 'CONTRACT'],
  ['internship', 'INTERNSHIP'],
  ['temporary', 'TEMPORARY'],
]);

const COUNTRY_ALIAS = new Map([
  // USA
  ['usa', 'US'],
  ['united states', 'US'],
  ['united states of america', 'US'],
  ['u.s.', 'US'],
  ['u.s.a', 'US'],
  ['u.s.a.', 'US'],

  // Common countries agents will actually use
  ['india', 'IN'],
  ['uk', 'GB'],
  ['united kingdom', 'GB'],
  ['england', 'GB'],
  ['britain', 'GB'],
  ['great britain', 'GB'],
  ['canada', 'CA'],
  ['australia', 'AU'],
  ['germany', 'DE'],
  ['france', 'FR'],
  ['netherlands', 'NL'],
  ['holland', 'NL'],
  ['singapore', 'SG'],
  ['uae', 'AE'],
  ['united arab emirates', 'AE'],
  ['dubai', 'AE'],
  ['new zealand', 'NZ'],
  ['ireland', 'IE'],
  ['pakistan', 'PK'],
  ['bangladesh', 'BD'],
  ['sri lanka', 'LK'],
  ['south africa', 'ZA'],
  ['nigeria', 'NG'],
  ['kenya', 'KE'],
  ['japan', 'JP'],
  ['china', 'CN'],
  ['hong kong', 'HK'],
  ['brazil', 'BR'],
  ['mexico', 'MX'],
  ['sweden', 'SE'],
  ['norway', 'NO'],
  ['denmark', 'DK'],
  ['switzerland', 'CH'],
  ['italy', 'IT'],
  ['spain', 'ES'],
  ['portugal', 'PT'],
  ['poland', 'PL'],
  ['israel', 'IL'],
  ['malaysia', 'MY'],
  ['philippines', 'PH'],
  ['indonesia', 'ID'],
]);

const ISO2 = new Set([
  'US',
  'GB',
  'IN',
  'CA',
  'AU',
  'DE',
  'FR',
  'NL',
  'SG',
  'AE',
  'NZ',
  'IE',
  'PK',
  'BD',
  'LK',
  'ZA',
  'NG',
  'KE',
  'JP',
  'CN',
  'HK',
  'BR',
  'MX',
  'SE',
  'NO',
  'DK',
  'CH',
  'IT',
  'ES',
  'PT',
  'PL',
  'IL',
  'MY',
  'PH',
  'ID',
  'BE',
  'AT',
  'FI',
  'CZ',
  'RO',
  'HU',
  'GR',
  'TR',
  'SA',
  'QA',
  'KW',
  'BH',
  'OM',
  'EG',
  'TH',
  'VN',
]);

// Exported so getRecommendedJobs.js can sanitize agentConfig.employmentType
// before it enters applyFilters. Handles strings, arrays, and legacy formats.
export const sanitizeEmploymentType = (et) => {
  if (!et) return null;

  // Handle arrays recursively — ["full-time", "part-time"] → "FULL_TIME,PART_TIME"
  if (Array.isArray(et)) {
    const results = et.map(sanitizeEmploymentType).filter(Boolean);
    return results.length ? results.join(',') : null;
  }

  const raw = lower(et);
  return EMPLOYMENT_TYPE_MAP.get(raw) || String(et).toUpperCase();
};

const sanitizePreferredJobTypes = (arr) => {
  const list = Array.isArray(arr) ? arr : arr ? [arr] : [];
  const out = list.map((x) => sanitizeEmploymentType(x)).filter(Boolean);
  return Array.from(new Set(out));
};

export const sanitizeCountry = (c) => {
  if (!c) return c;
  const trimmed = String(c).trim();
  const upper = trimmed.toUpperCase();

  // Already a valid ISO-2 code — return immediately
  if (ISO2.has(upper)) return upper;

  // Look up full name / common alias
  const k = trimmed.toLowerCase();
  return COUNTRY_ALIAS.get(k) || upper;
};

const uniqBy = (arr, key) => {
  const seen = new Set();
  return (arr || []).filter((x) => {
    const k = key(x);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export function buildEffectiveStudentProfile(student, agent) {
  const dbSkills = (student?.skills || [])
    .map((s) => ({ skill: norm(s?.skill) }))
    .filter((s) => s.skill);

  const cvSkills = (agent?.uploadedCVData?.skills || [])
    .map((s) => ({ skill: norm(s?.skill) }))
    .filter((s) => s.skill);

  const skills = uniqBy([...cvSkills, ...dbSkills], (x) =>
    x.skill?.toLowerCase(),
  );

  const preferredJobTitles = [
    ...(student?.jobPreferences?.preferredJobTitles || []),
    agent?.jobTitle || '',
  ]
    .map(norm)
    .filter(Boolean);

  const preferredJobTypes = sanitizePreferredJobTypes(
    student?.jobPreferences?.preferredJobTypes,
  );

  // Spread sanitized agent types so arrays like ["full-time","part-time"]
  // each become their own canonical entry rather than one joined string
  const agentTypes = agent?.employmentType
    ? sanitizeEmploymentType(agent.employmentType)?.split(',').filter(Boolean)
    : [];
  agentTypes.forEach((t) => preferredJobTypes.push(t));

  const preferredCountries = (
    student?.jobPreferences?.preferredCountries || []
  ).map(sanitizeCountry);

  const agentCountry = sanitizeCountry(agent?.country);
  if (agentCountry && !preferredCountries.includes(agentCountry)) {
    preferredCountries.push(agentCountry);
  }

  return {
    ...student,
    jobRole: agent?.jobTitle || student?.jobRole,
    skills,
    jobPreferences: {
      ...student?.jobPreferences,
      isRemote: Boolean(student?.jobPreferences?.isRemote || agent?.isRemote),
      preferredJobTitles,
      preferredJobTypes: Array.from(new Set(preferredJobTypes)),
      preferredCountries,
    },
  };
}
