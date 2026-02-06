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
  /(name|candidate|email|phone|mobile|education|experience|skill|resume|cv|address|street|city|state|postal|zip|country|location|gender|nationality|dob|birth)/i;

const NARRATIVE_FIELD_REGEX =
  /(summary|guidance|description|about|profile|objective|cover|why|statement|role|background)/i;

const SECURITY_FIELD_REGEX =
  /(captcha|csrf|token|otp|password|auth|verification)/i;

function classifyField(descriptor) {
  const text = `${descriptor.inputKey} ${descriptor.label}`.toLowerCase();
  if (SECURITY_FIELD_REGEX.test(text)) return 'SECURITY';
  if (NARRATIVE_FIELD_REGEX.test(text)) return 'NARRATIVE';
  if (IDENTITY_FIELD_REGEX.test(text)) return 'IDENTITY';
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
    gender: student.gender || '',
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
   DETERMINISTIC RESOLVER (Identity)
   ============================================================ */

function resolveIdentityValue(descriptor, student) {
  // Combine key and label, then trim to handle trailing spaces seen in your logs
  const text = `${descriptor.inputKey} ${descriptor.label || ''}`
    .toLowerCase()
    .trim();

  // 1. Specific Social/Links
  if (/linkedin/.test(text)) return student.linkedin || '';

  // 2. Exact Identity (Check specific parts before broad "name")
  if (/first/.test(text)) return student.firstName || '';
  if (/middle/.test(text)) return student.middleName || '';
  if (/last|surname/.test(text)) return student.lastName || '';

  // 3. Broad Name (Only if it didn't match first/last)
  if (/name|candidate/.test(text)) return student.fullName || '';

  // 4. Contact Info
  if (/email/.test(text)) return student.email || '';
  if (/phone|mobile|number/.test(text)) return student.phone || '';

  // 5. Address / Geography
  if (/address\s*1/.test(text)) return student.address || '';
  if (/address\s*2/.test(text)) return student.address2 || '';
  if (/zip|postal/.test(text)) return student.zipCode || '';
  if (/city|locality/.test(text))
    return student.city || student.jobPreferences?.preferredCities?.[0] || '';
  if (/state/.test(text)) return student.state || '';
  if (/country/.test(text))
    return (
      student.country || student.jobPreferences?.preferredCountries?.[0] || ''
    );

  // 6. Professional / Files
  if (/gender/.test(text)) return student.gender || '';
  if (/resume|cv/.test(text))
    return student.resumeUrl ? { url: student.resumeUrl } : '';

  // 7. Education/Work Fallbacks (Simple keys)
  if (/school|university|institution/.test(text))
    return student.education?.[0]?.school || '';
  if (/graduation\s*year/.test(text))
    return student.education?.[0]?.endYear || '';
  if (/area\s*of\s*study|major/.test(text))
    return student.education?.[0]?.fieldOfStudy || '';
  if (/gpa/.test(text)) return student.education?.[0]?.gpa || '';
  if (/company/.test(text)) return student.experience?.[0]?.company || '';
  if (/job\s*title/.test(text)) return student.experience?.[0]?.title || '';

  return '';
}

/* ============================================================
   OPTION MATCHER
   ============================================================ */

function pickOption(options = [], value) {
  if (!options.length || !value) return value;
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

  // Handle JSON parsing for inputs
  if (typeof inputs === 'string') {
    try {
      inputs = JSON.parse(inputs);
    } catch {
      return res.status(400).json({ error: 'Invalid inputs JSON' });
    }
  }

  const studentRaw = await Student.findById(studentId).lean();
  if (!studentRaw) return res.status(404).json({ error: 'Student not found' });

  const student = normalizeStudent(studentRaw);
  const normalizedInputs = normalizeInputs(inputs);

  /* ---------------- ENHANCED AI CALL ---------------- */

  let aiMap = new Map();
  try {
    // We send Narrative fields AND location/nationality fields to AI for formatting
    const aiTargetInputs = normalizedInputs.filter(
      (d) =>
        classifyField(d) === 'NARRATIVE' ||
        /city|country|state|nationality/i.test(d.inputKey),
    );

    if (aiTargetInputs.length) {
      const prompt = `
# ROLE
You are a Professional Career Assistant. Extract and format data for a student's job application form.

# DATA
Student Profile: ${JSON.stringify(student, null, 2)}
Target Fields: ${JSON.stringify(aiTargetInputs, null, 2)}

# CONSTRAINTS
1. ONLY use provided data. Do not hallucinate skills or dates.
2. If data is missing for a field, return "".
3. FORMATTING:
   - "City", "Country", "State": Use Title Case (e.g., "new delhi" -> "New Delhi").
   - "Nationality": Convert country to demonym (e.g., "India" -> "Indian").
   - "Job Description": Provide a professional summary with bullet points.
   - "CV Guidance": provide high-level instructions on what to highlight based on the student's skills.
4. RESPONSE: Return ONLY valid JSON.

# OUTPUT FORMAT
{ "outputs": [{ "inputKey": "key", "value": "formatted value" }] }
`;

      const raw = await genAI(prompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (Array.isArray(parsed?.outputs)) {
        aiMap = new Map(
          parsed.outputs.map((o) => [
            String(o.inputKey).toLowerCase(),
            o.value,
          ]),
        );
      }
    }
  } catch (err) {
    console.error('AI Processing Error:', err);
  }

  /* ---------------- FINAL CONSOLIDATION ---------------- */

  const outputs = normalizedInputs.map((descriptor) => {
    const category = classifyField(descriptor);
    const key = descriptor.inputKey.toLowerCase();

    let value = '';

    if (category === 'SECURITY') {
      value = '';
    } else {
      // AI (Formatting/Narrative) takes priority, followed by Local Resolver
      value = aiMap.get(key) || resolveIdentityValue(descriptor, student);
    }

    if (Array.isArray(descriptor.options) && descriptor.options.length) {
      value = pickOption(descriptor.options, value);
    }

    return { inputKey: descriptor.inputKey, value: value ?? '' };
  });

  return res.json({ studentId: student.id, outputs });
});

export default router;
