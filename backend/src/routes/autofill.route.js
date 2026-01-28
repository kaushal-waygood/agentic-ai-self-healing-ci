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
   FIELD CLASSIFICATION
   ============================================================ */

const IDENTITY_FIELD_REGEX =
  /(name|email|phone|mobile|education|experience|skill|resume|cv|address|street|city|state|postal|zip|country|location)/i;

const NARRATIVE_FIELD_REGEX =
  /(summary|guidance|description|about|profile|objective|cover|why|statement|role)/i;

const SECURITY_FIELD_REGEX =
  /(captcha|csrf|token|otp|password|auth|verification)/i;

function classifyField(descriptor) {
  const text = `${descriptor.inputKey} ${descriptor.label}`.toLowerCase();

  if (SECURITY_FIELD_REGEX.test(text)) return 'SECURITY';
  if (NARRATIVE_FIELD_REGEX.test(text)) return 'NARRATIVE';
  if (IDENTITY_FIELD_REGEX.test(text)) return 'IDENTITY';

  // Safety bias
  return 'IDENTITY';
}

/* ============================================================
   NORMALIZATION HELPERS
   ============================================================ */

function normalizeInputs(rawInputs = []) {
  return rawInputs.map((i) => ({
    inputKey: (i.inputKey || i.name || i.id || i.label || '').trim(),
    label: (i.label || i.placeholder || '').trim(),
    type: i.type || 'text',
    options: Array.isArray(i.options) ? i.options : [],
  }));
}

function normalizeStudent(student) {
  const fullName =
    student.fullName ||
    [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

  const parts = fullName.split(/\s+/);

  return {
    id: String(student._id),
    fullName,
    firstName: student.firstName || parts[0] || '',
    lastName: student.lastName || parts.at(-1) || '',
    middleName: student.middleName || parts.slice(1, -1).join(' ') || '',
    email: student.email || '',
    phone: student.phone || '',
    jobRole: student.jobRole || '',
    education: student.education || [],
    experience: student.experience || [],
    skills: student.skills || [],
    projects: student.projects || [],
    jobPreferences: student.jobPreferences || {},
    resumeUrl: student.uploadedCV || student.resumeUrl || '',
  };
}

/* ============================================================
   DETERMINISTIC (IDENTITY) RESOLVER
   ============================================================ */

function resolveIdentityValue(descriptor, student) {
  const text = `${descriptor.inputKey} ${descriptor.label}`.toLowerCase();

  if (/email/.test(text)) return student.email;
  if (/phone|mobile/.test(text)) return student.phone;

  if (/first/.test(text)) return student.firstName;
  if (/middle/.test(text)) return student.middleName;
  if (/last|surname/.test(text)) return student.lastName;
  if (/full.*name|^name$/.test(text)) return student.fullName;

  if (/resume|cv/.test(text))
    return student.resumeUrl ? { url: student.resumeUrl } : '';

  if (/city|locality/.test(text))
    return student.jobPreferences?.preferredCities?.[0] || '';

  if (/country/.test(text))
    return student.jobPreferences?.preferredCountries?.[0] || '';

  if (/education/.test(text)) return student.education;
  if (/experience/.test(text)) return student.experience;
  if (/skill/.test(text)) return student.skills;
  if (/project/.test(text)) return student.projects;

  return '';
}

/* ============================================================
   NARRATIVE (AI-ALLOWED) FALLBACK
   ============================================================ */

function generateNarrativeFallback(descriptor, student) {
  const label = descriptor.label.toLowerCase();

  if (/guidance|cv/i.test(label)) {
    return `${student.jobRole} with experience in modern web technologies including React, Next.js, MongoDB, and PostgreSQL. Focused on building scalable, user-friendly applications.`;
  }

  if (/job description|role/i.test(label)) {
    return student.experience
      .map((e) => `${e.designation} at ${e.company} (${e.location})`)
      .join('\n');
  }

  if (/summary|profile|about/i.test(label)) {
    return `${student.fullName} is a ${student.jobRole} with hands-on experience across frontend and backend development, including React, Node.js, and database-driven applications.`;
  }

  return '';
}

/* ============================================================
   OPTION MATCHER (SELECT/RADIO)
   ============================================================ */

function pickOption(options = [], value) {
  if (!options.length) return value;

  const v = String(value).toLowerCase();

  return (
    options.find((o) => String(o).toLowerCase() === v) ||
    options.find((o) => String(o).toLowerCase().includes(v)) ||
    options[0]
  );
}

/* ============================================================
   ROUTE
   ============================================================ */

router.post('/', authMiddleware, isGeneralUser, async (req, res) => {
  const studentId = req.user?._id;
  let { inputs } = req.body;

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: 'Invalid authenticated user' });
  }

  if (typeof inputs === 'string') {
    try {
      inputs = JSON.parse(inputs);
    } catch {
      return res.status(400).json({ error: 'Invalid inputs JSON' });
    }
  }

  if (!Array.isArray(inputs)) {
    return res.status(400).json({ error: 'inputs must be an array' });
  }

  const studentRaw = await Student.findById(studentId).lean();
  if (!studentRaw) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const student = normalizeStudent(studentRaw);
  const normalizedInputs = normalizeInputs(inputs);

  /* ---------------- AI CALL (NARRATIVE ONLY) ---------------- */

  let aiMap = new Map();

  try {
    const narrativeInputs = normalizedInputs.filter(
      (d) => classifyField(d) === 'NARRATIVE',
    );

    if (narrativeInputs.length) {
      const prompt = `
Return JSON only.
Use ONLY the provided student data. Do NOT invent skills, companies, or dates.

student:
${JSON.stringify(student, null, 2)}

inputs:
${JSON.stringify(narrativeInputs, null, 2)}

Output format:
{ "outputs": [{ "inputKey": "<string>", "value": "<string>" }] }
`;

      const raw = await genAI(prompt);
      const parsed = JSON.parse(
        raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1),
      );

      if (Array.isArray(parsed?.outputs)) {
        aiMap = new Map(
          parsed.outputs.map((o) => [
            String(o.inputKey).toLowerCase(),
            o.value,
          ]),
        );
      }
    }
  } catch {
    aiMap = new Map(); // silent fallback
  }

  /* ---------------- FINAL RESOLUTION ---------------- */

  const outputs = normalizedInputs.map((descriptor) => {
    const category = classifyField(descriptor);

    let value = '';

    if (category === 'SECURITY') {
      value = '';
    } else if (category === 'IDENTITY') {
      value = resolveIdentityValue(descriptor, student);
    } else if (category === 'NARRATIVE') {
      value =
        aiMap.get(descriptor.inputKey.toLowerCase()) ||
        generateNarrativeFallback(descriptor, student);
    }

    if (Array.isArray(descriptor.options) && descriptor.options.length) {
      value = pickOption(descriptor.options, value);
    }

    return {
      inputKey: descriptor.inputKey,
      value: value ?? '',
    };
  });

  return res.json({
    studentId: student.id,
    outputs,
  });
});

export default router;
