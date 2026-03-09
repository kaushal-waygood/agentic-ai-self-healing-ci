import { Router } from 'express';

import crypto from 'crypto';
import {
  authMiddleware,
  isGeneralUser,
} from '../middlewares/auth.middleware.js';
import { genAIRequest as genAI } from '../config/gemini.js';
import redisClient from '../config/redis.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import { Student } from '../models/students/student.model.js';

const router = Router();

const STUDENT_CACHE_TTL = 600; // 10 minutes
const AI_CACHE_TTL = 1800; // 30 minutes

/* ============================================================
   FORMATTING HELPERS
   ============================================================ */

function formatValue(value, key = '') {
  if (!value || typeof value !== 'string') return value;

  const lowerKey = key.toLowerCase();
  // Do NOT capitalize emails, websites, or file URLs
  if (
    lowerKey.includes('email') ||
    lowerKey.includes('url') ||
    lowerKey.includes('resume') ||
    lowerKey.includes('link')
  ) {
    return value.toLowerCase();
  }

  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/* ============================================================
   FIELD CLASSIFICATION
   ============================================================ */

const SECURITY_FIELD_REGEX =
  /(captcha|csrf|token|otp|password|auth|verification|g-recaptcha)/i;
const NARRATIVE_FIELD_REGEX =
  /(summary|guidance|description|about|profile|objective|cover|why|statement|role|background|describe)/i;

function classifyField(descriptor) {
  const text = `${descriptor.inputKey} ${descriptor.label || ''}`.toLowerCase();
  if (SECURITY_FIELD_REGEX.test(text)) return 'SECURITY';
  if (NARRATIVE_FIELD_REGEX.test(text)) return 'NARRATIVE';
  return 'IDENTITY';
}

/* ============================================================
   NORMALIZATION HELPERS
   ============================================================ */

function normalizeInputs(rawInputs = []) {
  // First, deduplicate inputs with same key
  const seenKeys = new Map();

  rawInputs.forEach((i) => {
    const key = (i.inputKey || i.name || i.id || i.label || '').trim();
    if (!key) return;

    // For duplicate keys, keep the first occurrence
    if (!seenKeys.has(key)) {
      seenKeys.set(key, {
        inputKey: key,
        normalizedKey: normalizeKeyForMatching(key),
        label: (i.label || i.placeholder || '').trim(),
        type: i.type || 'text',
        options: Array.isArray(i.options) ? i.options : [],
      });
    }
  });

  return Array.from(seenKeys.values());
}

function normalizeKeyForMatching(key) {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ') // Replace special chars with space
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}
/* ============================================================
   NORMALIZATION HELPERS
   ============================================================ */

function normalizeStudent(student) {
  const meta = student.metadata || {};

  let fName = meta.firstName || '';
  let lName = meta.lastName || '';

  if (!fName && !lName && student.fullName) {
    const parts = student.fullName.trim().split(/\s+/);
    fName = parts[0] || '';
    lName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  let city = meta.city || '';
  let country = meta.country || '';

  if (!city && !country && student.location) {
    const locParts = student.location.split(',').map((p) => p.trim());
    if (locParts.length >= 2) {
      city = locParts[0];
      country = locParts[1];
    } else {
      country = locParts[0];
    }
  }

  const latestExp =
    student.experience && student.experience.length > 0
      ? student.experience[0]
      : {};

  const latestEdu =
    student.education && student.education.length > 0
      ? student.education[0]
      : {};

  const latestProj =
    student.projects && student.projects.length > 0 ? student.projects[0] : {};

  const derived = {
    firstName: fName,
    lastName: lName,
    phoneCountryCode: meta.phoneCountryCode || '',
    city,
    state: meta.state || '',
    country,
    zipCode: meta.zipCode || '',
    school: latestEdu.institute || '',
    degree: latestEdu.degree || '',
    fieldOfStudy: latestEdu.fieldOfStudy || '',
    graduationYear: latestEdu.endDate
      ? new Date(latestEdu.endDate).getFullYear()
      : '',
    company: latestExp.company || '',
    jobTitle: latestExp.title || '',
    jobDescription: latestExp.description || '',
    projectName: latestProj.projectName || '',
    projectDescription: latestProj.description || '',
  };

  return {
    id: String(student._id),
    fullName:
      student.fullName || [fName, lName].filter(Boolean).join(' ') || '',
    email: student.email || '',
    phone: student.phone || '',
    jobRole: student.jobRole || '',
    skills: student.skills?.map((s) => s.skill) || [],
    resumeUrl: student.uploadedCV || student.resumeUrl || '',
    ...derived,
    _derivedMetadata: derived,
  };
}

/* ============================================================
   DETERMINISTIC RESOLVER (MAPPINGS UPDATE)
   ============================================================ */

const FIELD_MAPPINGS = [
  // ... your name and contact mappings remain the same ...
  { patterns: ['first name', 'fname'], field: 'firstName' },
  { patterns: ['last name', 'lname'], field: 'lastName' },
  { patterns: ['full name', 'candidate name'], field: 'fullName' },
  { patterns: ['email'], field: 'email' },
  { patterns: ['phone', 'mobile'], field: 'phone' },

  {
    patterns: ['resume', 'cv', 'upload file', 'upload resume', 'upload cv'],
    field: 'resumeUrl',
  },

  // Education (Using the new normalized keys)
  {
    patterns: ['school', 'university', 'college', 'institution'],
    field: 'school',
  },
  { patterns: ['degree', 'qualification'], field: 'degree' },
  {
    patterns: ['area of study', 'major', 'field of study'],
    field: 'fieldOfStudy',
  },
  { patterns: ['graduation year', 'grad year'], field: 'graduationYear' },

  // Experience
  { patterns: ['company', 'employer', 'organization'], field: 'company' },
  { patterns: ['job title', 'role', 'designation'], field: 'jobTitle' },
  { patterns: ['work description', 'job summary'], field: 'jobDescription' },

  // Projects
  { patterns: ['project name', 'title of project'], field: 'projectName' },
  { patterns: ['project description'], field: 'projectDescription' },

  // Location
  { patterns: ['city'], field: 'city' },
  { patterns: ['country'], field: 'country' },
];

function resolveIdentityValue(descriptor, student) {
  const normalizedKey =
    descriptor.normalizedKey || normalizeKeyForMatching(descriptor.inputKey);

  if (
    normalizedKey.includes('file') ||
    normalizedKey.includes('resume') ||
    normalizedKey.includes('cv') ||
    normalizedKey.includes('upload')
  ) {
    return student.resumeUrl || '';
  }

  const keyWithLabel = normalizeKeyForMatching(
    `${descriptor.inputKey} ${descriptor.label || ''}`,
  );

  for (const mapping of FIELD_MAPPINGS) {
    for (const pattern of mapping.patterns) {
      const normalizedPattern = normalizeKeyForMatching(pattern);

      if (
        normalizedKey.includes(normalizedPattern) ||
        keyWithLabel.includes(normalizedPattern)
      ) {
        let value = student[mapping.field];

        if (Array.isArray(value)) value = value[0];

        return value || '';
      }
    }
  }

  return '';
}

function pickOption(options = [], value) {
  if (!options.length || !value) return value;
  const v = String(value).toLowerCase();
  return (
    options.find((o) => String(o).toLowerCase() === v) ||
    options.find((o) => String(o).toLowerCase().includes(v)) ||
    options[0] ||
    value
  );
}

/* ============================================================
   AI PROMPT BUILDER (IMPROVED)
   ============================================================ */

function buildAIPrompt(student, aiTargetInputs) {
  return `
    You are an AI assistant that fills form fields accurately.
    
    STUDENT DATA:
    ${JSON.stringify(student, null, 2)}
    
    FORM FIELDS TO FILL:
    ${JSON.stringify(
      aiTargetInputs.map((i) => ({
        key: i.inputKey,
        label: i.label,
        type: i.type,
      })),
      null,
      2,
    )}
    
    INSTRUCTIONS:
    1. Return ONLY valid JSON, no other text
    2. Format: { "outputs": [{ "inputKey": "exact key from field", "value": "formatted value" }] }
    3. Use Title Case for names, cities, countries
    4. Convert countries to demonyms (India -> Indian)
    5. For EEO fields, leave empty unless data is explicitly provided
    6. Only fill fields that have corresponding data in student object
    7. Extract job title from student.jobRole or skills array
    
    Return ONLY the JSON object.
  `;
}

/* ============================================================
   CACHE HELPERS
   ============================================================ */

function buildFieldsHash(fields) {
  const sorted = fields
    .map((f) => f.inputKey)
    .sort()
    .join('|');
  return crypto.createHash('md5').update(sorted).digest('hex').slice(0, 12);
}

async function getCachedStudent(studentId) {
  const key = `autofill:student:${studentId}`;
  const cached = await redisClient.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      /* corrupted entry, refetch */
    }
  }

  const snapshot = await getStudentProfileSnapshot(studentId);
  if (!snapshot) return null;

  const normalized = normalizeStudent(snapshot);

  // Persist derived fields into student.metadata (fire-and-forget)
  if (normalized._derivedMetadata) {
    const metaUpdate = { ...normalized._derivedMetadata };
    Student.updateOne(
      { _id: studentId },
      { $set: { metadata: metaUpdate } },
    ).catch(() => {});
    delete normalized._derivedMetadata;
  }

  await redisClient.set(key, JSON.stringify(normalized), STUDENT_CACHE_TTL);
  return normalized;
}

async function getCachedAIResponse(student, aiTargetInputs) {
  const hash = buildFieldsHash(aiTargetInputs);
  const key = `autofill:ai:${student.id}:${hash}`;

  const cached = await redisClient.get(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return new Map(parsed);
    } catch {
      /* corrupted entry, regenerate */
    }
  }

  const prompt = buildAIPrompt(student, aiTargetInputs);
  const raw = await genAI(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  if (!parsed?.outputs) return new Map();

  const entries = parsed.outputs.map((o) => [
    String(o.inputKey).toLowerCase(),
    o.value,
  ]);

  await redisClient.set(key, JSON.stringify(entries), AI_CACHE_TTL);
  return new Map(entries);
}

/* ============================================================
   ROUTE
   ============================================================ */

router.post('/', authMiddleware, isGeneralUser, async (req, res) => {
  const studentId = req.user?._id;
  const { inputs } = req.body;

  if (!studentId) return res.status(400).json({ error: 'User not found' });
  if (!inputs || !Array.isArray(inputs)) {
    return res.status(400).json({ error: 'Invalid inputs format' });
  }

  const student = await getCachedStudent(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const normalizedInputs = normalizeInputs(inputs);

  const deterministicOutputs = new Map();
  normalizedInputs.forEach((descriptor) => {
    if (classifyField(descriptor) !== 'SECURITY') {
      const value = resolveIdentityValue(descriptor, student);
      if (value) {
        deterministicOutputs.set(descriptor.inputKey.toLowerCase(), value);
      }
    }
  });

  let aiMap = new Map();
  try {
    const aiTargetInputs = normalizedInputs.filter((d) => {
      const category = classifyField(d);
      const text = d.normalizedKey || normalizeKeyForMatching(d.inputKey);

      const needsEnhancement =
        category === 'NARRATIVE' ||
        text.includes('country') ||
        text.includes('city') ||
        text.includes('state') ||
        text.includes('nationality') ||
        text.includes('job title') ||
        text.includes('position');

      return (
        needsEnhancement && !deterministicOutputs.has(d.inputKey.toLowerCase())
      );
    });

    if (aiTargetInputs.length) {
      aiMap = await getCachedAIResponse(student, aiTargetInputs);
    }
  } catch (err) {
    console.error('Autofill AI error:', err.message);
  }

  const outputs = normalizedInputs.map((descriptor) => {
    const key = descriptor.inputKey;
    const lowerKey = key.toLowerCase();

    let value = '';

    if (classifyField(descriptor) !== 'SECURITY') {
      value = aiMap.get(lowerKey) || deterministicOutputs.get(lowerKey) || '';
    }

    value = formatValue(value, descriptor.inputKey);

    if (Array.isArray(descriptor.options) && descriptor.options.length) {
      value = pickOption(descriptor.options, value);
    }

    return { inputKey: key, value: value ?? '' };
  });

  const filledCount = outputs.filter((o) => o.value && o.value !== '').length;

  return res.json({
    studentId: student.id,
    outputs,
    stats: {
      total: outputs.length,
      filled: filledCount,
      empty: outputs.length - filledCount,
    },
  });
});

router.post('/manual', authMiddleware, isGeneralUser, async (req, res) => {
  const studentId = req.user?._id;
  const { fields: inputs } = req.body;

  if (!studentId) return res.status(400).json({ error: 'User not found' });
  if (!inputs || !Array.isArray(inputs)) {
    return res.status(400).json({ error: 'Invalid inputs format' });
  }

  const student = await getCachedStudent(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const normalizedInputs = normalizeInputs(inputs);

  const deterministicOutputs = new Map();
  normalizedInputs.forEach((descriptor) => {
    if (classifyField(descriptor) !== 'SECURITY') {
      const value = resolveIdentityValue(descriptor, student);
      if (value) {
        deterministicOutputs.set(descriptor.inputKey.toLowerCase(), value);
      }
    }
  });

  let aiMap = new Map();
  try {
    const aiTargetInputs = normalizedInputs.filter((d) => {
      const category = classifyField(d);
      const text = d.normalizedKey || normalizeKeyForMatching(d.inputKey);

      const needsEnhancement =
        category === 'NARRATIVE' ||
        text.includes('country') ||
        text.includes('city') ||
        text.includes('state') ||
        text.includes('nationality') ||
        text.includes('job title') ||
        text.includes('position');

      return (
        needsEnhancement && !deterministicOutputs.has(d.inputKey.toLowerCase())
      );
    });

    if (aiTargetInputs.length) {
      aiMap = await getCachedAIResponse(student, aiTargetInputs);
    }
  } catch (err) {
    console.error('Autofill AI error:', err.message);
  }

  const outputs = normalizedInputs.map((descriptor) => {
    const key = descriptor.inputKey;
    const lowerKey = key.toLowerCase();

    let value = '';

    if (classifyField(descriptor) !== 'SECURITY') {
      value = aiMap.get(lowerKey) || deterministicOutputs.get(lowerKey) || '';
    }

    value = formatValue(value, descriptor.inputKey);

    if (Array.isArray(descriptor.options) && descriptor.options.length) {
      value = pickOption(descriptor.options, value);
    }

    return { inputKey: key, value: value ?? '' };
  });

  const filledCount = outputs.filter((o) => o.value && o.value !== '').length;

  return res.json({
    studentId: student.id,
    outputs,
    stats: {
      total: outputs.length,
      filled: filledCount,
      empty: outputs.length - filledCount,
    },
  });
});

export default router;
