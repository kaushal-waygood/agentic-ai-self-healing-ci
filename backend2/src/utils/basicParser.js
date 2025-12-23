// utils/basicParser.js
import { v4 as uuidv4 } from 'uuid';

export const parseBasicFromText = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Name heuristic: first short line without numbers/@
  let fullName = '';
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const l = lines[i];
    if (/[0-9@]/.test(l)) continue;
    if (l.split(' ').length <= 6) {
      fullName = l;
      break;
    }
  }

  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(
    /(\+?\d{1,4}[-.\s]?)?(\d{3}[-.\s]?\d{3,4}[-.\s]?\d{3,4})/,
  );
  const phone = phoneMatch ? phoneMatch[0] : '';

  const SKILLS = [
    'javascript',
    'typescript',
    'node',
    'react',
    'next.js',
    'nextjs',
    'express',
    'python',
    'django',
    'flask',
    'java',
    'spring',
    'c++',
    'c#',
    'golang',
    'go',
    'aws',
    'gcp',
    'azure',
    'docker',
    'kubernetes',
    'sql',
    'postgres',
    'mongodb',
    'redis',
    'graphql',
  ];

  const lower = text.toLowerCase();
  const found = SKILLS.filter((s) => lower.includes(s));
  // Deduplicate and slice to reasonable number
  const unique = [...new Set(found)].slice(0, 20);

  const skills = unique.map((s) => ({
    skillId: uuidv4(),
    skill: s,
    level: 'BEGINNER', // fallback level
  }));

  return {
    personalInfo: { fullName, phone, email },
    education: [],
    experience: [],
    skills,
    projects: [],
    jobPreferences: {},
  };
};
