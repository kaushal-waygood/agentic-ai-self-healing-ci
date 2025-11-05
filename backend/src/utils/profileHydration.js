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
  ['usa', 'US'],
  ['united states', 'US'],
  ['u.s.', 'US'],
  ['u.s.a', 'US'],
]);

const sanitizeEmploymentType = (et) => {
  if (!et) return null;
  const raw = lower(et);
  return EMPLOYMENT_TYPE_MAP.get(raw) || et.toUpperCase();
};

const sanitizePreferredJobTypes = (arr) => {
  const list = Array.isArray(arr) ? arr : arr ? [arr] : [];
  const out = list.map((x) => sanitizeEmploymentType(x)).filter(Boolean);
  return Array.from(new Set(out));
};

const sanitizeCountry = (c) => {
  if (!c) return c;
  const k = lower(c);
  return COUNTRY_ALIAS.get(k) || c;
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

  const agentType = sanitizeEmploymentType(agent?.employmentType);
  if (agentType) preferredJobTypes.push(agentType);

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
