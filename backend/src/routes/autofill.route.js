import { Router } from 'express';
import mongoose from 'mongoose';
import {
  authMiddleware,
  isGeneralUser,
} from '../middlewares/auth.middleware.js';
import { Student } from '../models/students/student.model.js';
import { genAIRequest as genAI } from '../config/gemini.js';

const router = Router();

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
  let fName = student.firstName || '';
  let lName = student.lastName || '';

  if (!fName && !lName && student.fullName) {
    const parts = student.fullName.trim().split(/\s+/);
    fName = parts[0] || '';
    lName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  let city = student.city || '';
  let country = student.country || '';

  if (!city && !country && student.location) {
    const locParts = student.location.split(',').map((p) => p.trim());
    if (locParts.length >= 2) {
      city = locParts[0];
      country = locParts[1];
    } else {
      country = locParts[0];
    }
  }

  // Get Most Recent Experience (First item in array usually)
  const latestExp =
    student.experience && student.experience.length > 0
      ? student.experience[0]
      : {};

  // Get Most Recent Education
  const latestEdu =
    student.education && student.education.length > 0
      ? student.education[0]
      : {};

  // Get First Project
  const latestProj =
    student.projects && student.projects.length > 0 ? student.projects[0] : {};

  return {
    id: String(student._id),
    fullName:
      student.fullName || [fName, lName].filter(Boolean).join(' ') || '',
    firstName: fName,
    lastName: lName,
    email: student.email || '',
    phone: student.phone || '',
    phoneCountryCode: student.phoneCountryCode || '',
    city: city,
    state: student.state || '',
    country: country,
    zipCode: student.zipCode || '',
    jobRole: student.jobRole || '',
    skills: student.skills?.map((s) => s.skill) || [],
    resumeUrl: student.uploadedCV || student.resumeUrl || '',

    // NEW FIELDS EXTRACTED FROM ARRAYS
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
  const keyWithLabel = normalizeKeyForMatching(
    `${descriptor.inputKey} ${descriptor.label || ''}`,
  );

  // Try to find matching pattern
  for (const mapping of FIELD_MAPPINGS) {
    for (const pattern of mapping.patterns) {
      const normalizedPattern = normalizeKeyForMatching(pattern);

      if (
        normalizedKey.includes(normalizedPattern) ||
        keyWithLabel.includes(normalizedPattern)
      ) {
        let value = student[mapping.field];

        // Handle array fields
        if (Array.isArray(value) && value.length > 0) {
          value = value[0];
        }

        // Handle defaults
        if (!value && mapping.default !== undefined) {
          value = mapping.default;
        }

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
   ROUTE
   ============================================================ */

router.post('/', authMiddleware, isGeneralUser, async (req, res) => {
  const studentId = req.user?._id;
  let { inputs } = req.body;

  if (!studentId) return res.status(400).json({ error: 'User not found' });
  if (!inputs || !Array.isArray(inputs)) {
    return res.status(400).json({ error: 'Invalid inputs format' });
  }

  const studentRaw = await Student.findById(studentId).lean();
  if (!studentRaw) return res.status(404).json({ error: 'Student not found' });

  console.log(studentRaw);

  const student = normalizeStudent(studentRaw);

  console.log(student);

  const normalizedInputs = normalizeInputs(inputs);

  // First pass: deterministic resolution for all fields
  const deterministicOutputs = new Map();
  normalizedInputs.forEach((descriptor) => {
    if (classifyField(descriptor) !== 'SECURITY') {
      const value = resolveIdentityValue(descriptor, student);
      if (value) {
        deterministicOutputs.set(descriptor.inputKey.toLowerCase(), value);
      }
    }
  });

  // Second pass: AI enhancement for narrative and location fields
  let aiMap = new Map();
  try {
    const aiTargetInputs = normalizedInputs.filter((d) => {
      const category = classifyField(d);
      const text = d.normalizedKey || normalizeKeyForMatching(d.inputKey);

      // Include fields that need formatting or demonym conversion
      const needsEnhancement =
        category === 'NARRATIVE' ||
        text.includes('country') ||
        text.includes('city') ||
        text.includes('state') ||
        text.includes('nationality') ||
        text.includes('job title') ||
        text.includes('position');

      // Only include if we don't already have a deterministic value
      return (
        needsEnhancement && !deterministicOutputs.has(d.inputKey.toLowerCase())
      );
    });

    if (aiTargetInputs.length) {
      const prompt = buildAIPrompt(student, aiTargetInputs);
      const raw = await genAI(prompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (parsed?.outputs) {
        aiMap = new Map(
          parsed.outputs.map((o) => [
            String(o.inputKey).toLowerCase(),
            o.value,
          ]),
        );
      }
    }
  } catch (err) {
    console.error('AI Error:', err);
  }

  // Combine results
  const outputs = normalizedInputs.map((descriptor) => {
    const key = descriptor.inputKey;
    const lowerKey = key.toLowerCase();

    let value = '';

    // Priority: AI > Deterministic > Empty string
    if (classifyField(descriptor) !== 'SECURITY') {
      value = aiMap.get(lowerKey) || deterministicOutputs.get(lowerKey) || '';
    }

    // Apply formatting
    value = formatValue(value, descriptor.inputKey);

    // Handle options
    if (Array.isArray(descriptor.options) && descriptor.options.length) {
      value = pickOption(descriptor.options, value);
    }

    return { inputKey: key, value: value ?? '' };
  });

  // Log stats for debugging
  const filledCount = outputs.filter((o) => o.value && o.value !== '').length;
  console.log(`Filled ${filledCount}/${outputs.length} fields`);

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
