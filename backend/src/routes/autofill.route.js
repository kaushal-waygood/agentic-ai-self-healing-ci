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
import { StudentCV } from '../models/students/studentCV.model.js';

const router = Router();

const STUDENT_CACHE_TTL = 600; // 10 minutes
const AI_CACHE_TTL = 1800; // 30 minutes
const CV_CACHE_TTL = 1800; // 30 minutes

/* ============================================================
   FORMATTING HELPERS
   ============================================================ */

function formatValue(value, key = '') {
  if (!value || typeof value !== 'string') return value;

  const lowerKey = key.toLowerCase();
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
  const seenKeys = new Map();

  rawInputs.forEach((i) => {
    const key = (i.inputKey || i.name || i.id || i.label || '').trim();
    if (!key) return;

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
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ============================================================
   STUDENT PROFILE NORMALIZER
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

  const latestExp = student.experience?.[0] || {};
  const latestEdu = student.education?.[0] || {};
  const latestProj = student.projects?.[0] || {};

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
    // Previously learned values from manual fills — used in Layer 1
    autofillCache: meta.autofillCache || {},
    _derivedMetadata: derived,
  };
}

/* ============================================================
   CV DATA NORMALIZER
   Maps StudentCV.cvData fields onto the same shape as student profile.
   CV data takes priority over profile data for every overlapping field.

   StudentCV schema:
     student, jobId, status, flag, template, cvTitle,
     jobContextString, finalTouch, cvData (Object), completedAt

   cvData internal structure (adjust fallback chains to match
   what your CV generator actually writes into cvData):
   {
     personalInfo:  { name, email, phone, location, linkedin, website }
     summary:       string
     experience:    [{ title, company, startDate, endDate, description }]
     education:     [{ degree, institute, fieldOfStudy, endDate }]
     skills:        [string] or [{ name }]
     projects:      [{ projectName, description }]
   }
   ============================================================ */

function normalizeCVData(cv, studentBase) {
  if (!cv || cv.status !== 'completed') return studentBase;

  const d = cv.cvData || {};

  // ── Personal info ──
  const personal = d.personalInfo || d.personal || d.contact || {};
  const fullName =
    personal.name || personal.fullName || d.name || studentBase.fullName || '';

  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || studentBase.firstName || '';
  const lastName =
    nameParts.length > 1
      ? nameParts.slice(1).join(' ')
      : studentBase.lastName || '';

  // ── Experience ──
  const workExp = d.experience || d.workExperience || d.work || [];
  const latestExp = workExp[0] || {};

  // ── Education ──
  const education = d.education || [];
  const latestEdu = education[0] || {};

  // ── Projects ──
  const projects = d.projects || [];
  const latestProj = projects[0] || {};

  // ── Skills: handle [string] and [{name}] and [{skill}] shapes ──
  const rawSkills = d.skills || [];
  const skills = rawSkills.length
    ? rawSkills
        .map((s) => (typeof s === 'string' ? s : s.name || s.skill || ''))
        .filter(Boolean)
    : studentBase.skills;

  // ── Summary / objective ──
  const summary =
    d.summary ||
    d.objective ||
    d.professionalSummary ||
    d.careerObjective ||
    d.about ||
    '';

  // ── Location ──
  const rawLocation = personal.location || personal.address || '';
  let city = studentBase.city || '';
  let country = studentBase.country || '';
  if (rawLocation && (!city || !country)) {
    const parts = rawLocation.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      city = parts[0];
      country = parts[parts.length - 1];
    } else {
      country = parts[0];
    }
  }

  // ── CV PDF URL ──
  // StudentCV has no direct url field in schema —
  // fall back to constructed API endpoint or student's existing resumeUrl
  const cvResumeUrl =
    cv.url ||
    cv.fileUrl ||
    cv.pdfUrl ||
    cv.secureUrl ||
    `${process.env.API_HOST}/api/v1/students/cv/${cv._id}/pdf` ||
    studentBase.resumeUrl;

  return {
    // Keep base fields CV doesn't override (autofillCache, id, state, zipCode…)
    ...studentBase,

    // Personal — CV wins where present
    fullName,
    firstName,
    lastName,
    email: personal.email || personal.mail || studentBase.email,
    phone: personal.phone || personal.mobile || studentBase.phone,
    city,
    country,
    linkedin:
      personal.linkedin || personal.linkedIn || studentBase.linkedin || '',
    website:
      personal.website || personal.portfolio || studentBase.website || '',

    // Experience
    jobTitle:
      latestExp.title || latestExp.position || studentBase.jobTitle || '',
    company:
      latestExp.company || latestExp.employer || studentBase.company || '',
    jobDescription:
      latestExp.description ||
      latestExp.summary ||
      studentBase.jobDescription ||
      '',

    // Education
    school:
      latestEdu.institute ||
      latestEdu.school ||
      latestEdu.university ||
      studentBase.school ||
      '',
    degree:
      latestEdu.degree || latestEdu.qualification || studentBase.degree || '',
    fieldOfStudy:
      latestEdu.fieldOfStudy ||
      latestEdu.major ||
      latestEdu.stream ||
      studentBase.fieldOfStudy ||
      '',
    graduationYear: latestEdu.endDate
      ? new Date(latestEdu.endDate).getFullYear()
      : studentBase.graduationYear || '',

    // Projects
    projectName:
      latestProj.projectName ||
      latestProj.title ||
      studentBase.projectName ||
      '',
    projectDescription:
      latestProj.description || studentBase.projectDescription || '',

    // Skills & summary
    skills,
    summary,

    // Always use CV's PDF for file-upload fields
    resumeUrl: cvResumeUrl,

    // Internal meta — scopes AI cache + enriches AI prompt
    _cvId: String(cv._id),
    _cvTitle: cv.cvTitle || '',
  };
}

/* ============================================================
   DETERMINISTIC RESOLVER
   ============================================================ */

const FIELD_MAPPINGS = [
  { patterns: ['first name', 'fname'], field: 'firstName' },
  { patterns: ['last name', 'lname'], field: 'lastName' },
  { patterns: ['full name', 'candidate name'], field: 'fullName' },
  { patterns: ['email'], field: 'email' },
  { patterns: ['phone', 'mobile'], field: 'phone' },
  {
    patterns: ['resume', 'cv', 'upload file', 'upload resume', 'upload cv'],
    field: 'resumeUrl',
  },
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
  { patterns: ['company', 'employer', 'organization'], field: 'company' },
  { patterns: ['job title', 'role', 'designation'], field: 'jobTitle' },
  { patterns: ['work description', 'job summary'], field: 'jobDescription' },
  { patterns: ['project name', 'title of project'], field: 'projectName' },
  { patterns: ['project description'], field: 'projectDescription' },
  { patterns: ['city'], field: 'city' },
  { patterns: ['country'], field: 'country' },
  { patterns: ['summary', 'about', 'objective', 'profile'], field: 'summary' },
  { patterns: ['linkedin'], field: 'linkedin' },
  { patterns: ['website', 'portfolio'], field: 'website' },
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
   AI PROMPT BUILDER
   ============================================================ */

function buildAIPrompt(student, aiTargetInputs) {
  const cvContext = student._cvId
    ? `The user selected their AI-generated CV titled "${student._cvTitle || student._cvId}".
       Prioritize CV data (summary, experience, skills) over generic profile data.`
    : 'Use the student profile data below.';

  return `
    You are an AI assistant that fills job application form fields accurately.

    ${cvContext}

    STUDENT DATA:
    ${JSON.stringify(
      {
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        jobTitle: student.jobTitle,
        company: student.company,
        jobDescription: student.jobDescription,
        school: student.school,
        degree: student.degree,
        fieldOfStudy: student.fieldOfStudy,
        graduationYear: student.graduationYear,
        city: student.city,
        country: student.country,
        skills: student.skills,
        summary: student.summary,
        linkedin: student.linkedin,
        website: student.website,
        jobRole: student.jobRole,
        projectName: student.projectName,
        projectDescription: student.projectDescription,
      },
      null,
      2,
    )}

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
    5. For summary/objective/about fields, use the student summary if provided
    6. For EEO fields (gender, ethnicity, disability, veteran), leave empty unless explicitly provided
    7. Only fill fields that have corresponding data — never invent data
    8. Extract job title from jobTitle or jobRole fields

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

// ── Student profile cache ──
async function getCachedStudent(studentId) {
  const key = `autofill:student:${studentId}`;
  const cached = await redisClient.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      /* corrupted, refetch */
    }
  }

  const snapshot = await getStudentProfileSnapshot(studentId);
  if (!snapshot) return null;

  const normalized = normalizeStudent(snapshot);

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

// ── Generated CV cache ──
// Finds a completed CV owned by this student and caches it for 30 min
async function getCachedCV(studentId, cvId) {
  const key = `autofill:cv:${studentId}:${cvId}`;

  const cached = await redisClient.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      /* corrupted, refetch */
    }
  }

  const cv = await StudentCV.findOne({
    _id: cvId,
    student: studentId,
    status: 'completed',
  }).lean();

  if (!cv) return null;

  await redisClient.set(key, JSON.stringify(cv), CV_CACHE_TTL);
  return cv;
}

// ── AI response cache  ──
// Key is scoped by cvId (if present) so profile vs CV fills don't collide
async function getCachedAIResponse(student, aiTargetInputs) {
  const hash = buildFieldsHash(aiTargetInputs);
  const scope = student._cvId ? `cv:${student._cvId}` : 'profile';
  const key = `autofill:ai:${student.id}:${scope}:${hash}`;

  const cached = await redisClient.get(key);
  if (cached) {
    try {
      return new Map(JSON.parse(cached));
    } catch {
      /* regenerate */
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
   AUTOFILL CACHE RESOLVER  (Layer 1)
   Values the user previously filled manually — fastest layer.
   Stored in student.metadata.autofillCache under normalized keys.
   ============================================================ */

function resolveFromAutofillCache(descriptor, autofillCache = {}) {
  if (!autofillCache || typeof autofillCache !== 'object') return '';

  const normalizedKey =
    descriptor.normalizedKey || normalizeKeyForMatching(descriptor.inputKey);

  // Exact normalized key match
  if (autofillCache[normalizedKey]) return autofillCache[normalizedKey];

  // Partial match — catches label variants of the same field
  for (const [cachedKey, cachedValue] of Object.entries(autofillCache)) {
    if (!cachedValue) continue;
    const nCached = normalizeKeyForMatching(cachedKey);
    if (
      nCached === normalizedKey ||
      nCached.includes(normalizedKey) ||
      normalizedKey.includes(nCached)
    )
      return cachedValue;
  }

  return '';
}

/* ============================================================
   SHARED RESOLVE LOGIC
   Used by both POST / and POST /manual.

   Priority:
     Layer 1 → autofillCache  (previously learned from manual fills, instant)
     Layer 2 → deterministic  (profile / CV field mapping, no AI)
     Layer 3 → AI             (narrative + complex fields only)
   ============================================================ */

async function resolveOutputs(student, normalizedInputs) {
  const autofillCache = student.autofillCache || {};

  // ── Layer 1: autofillCache ──
  const cachedOutputs = new Map();
  normalizedInputs.forEach((descriptor) => {
    if (classifyField(descriptor) === 'SECURITY') return;
    const value = resolveFromAutofillCache(descriptor, autofillCache);
    if (value) cachedOutputs.set(descriptor.inputKey.toLowerCase(), value);
  });

  // ── Layer 2: deterministic ──
  const deterministicOutputs = new Map();
  normalizedInputs.forEach((descriptor) => {
    if (classifyField(descriptor) === 'SECURITY') return;
    if (cachedOutputs.has(descriptor.inputKey.toLowerCase())) return;
    const value = resolveIdentityValue(descriptor, student);
    if (value)
      deterministicOutputs.set(descriptor.inputKey.toLowerCase(), value);
  });

  // ── Layer 3: AI — only fields not yet resolved ──
  let aiMap = new Map();
  try {
    const aiTargetInputs = normalizedInputs.filter((d) => {
      if (classifyField(d) === 'SECURITY') return false;
      const lowerKey = d.inputKey.toLowerCase();
      if (cachedOutputs.has(lowerKey) || deterministicOutputs.has(lowerKey))
        return false;

      const text = d.normalizedKey || normalizeKeyForMatching(d.inputKey);
      return (
        classifyField(d) === 'NARRATIVE' ||
        text.includes('country') ||
        text.includes('city') ||
        text.includes('state') ||
        text.includes('nationality') ||
        text.includes('job title') ||
        text.includes('position') ||
        text.includes('summary') ||
        text.includes('objective') ||
        text.includes('about')
      );
    });

    if (aiTargetInputs.length) {
      aiMap = await getCachedAIResponse(student, aiTargetInputs);
    }
  } catch (err) {
    console.error('[Autofill] AI error:', err.message);
  }

  // ── Merge + format ──
  const outputs = normalizedInputs.map((descriptor) => {
    const key = descriptor.inputKey;
    const lowerKey = key.toLowerCase();
    let value = '';

    if (classifyField(descriptor) !== 'SECURITY') {
      value =
        cachedOutputs.get(lowerKey) || // Layer 1
        deterministicOutputs.get(lowerKey) || // Layer 2
        aiMap.get(lowerKey) || // Layer 3
        '';
    }

    value = formatValue(value, key);

    if (Array.isArray(descriptor.options) && descriptor.options.length) {
      value = pickOption(descriptor.options, value);
    }

    return { inputKey: key, value: value ?? '' };
  });

  const filledCount = outputs.filter((o) => o.value && o.value !== '').length;
  return { outputs, filledCount };
}

/* ============================================================
   ROUTES
   ============================================================ */

// ────────────────────────────────────────────────────────────
//  POST /
//  Main autofill endpoint.
//  Body: { inputs[], cvSource: 'profile'|'generate', cvId? }
// ────────────────────────────────────────────────────────────
router.post('/', authMiddleware, isGeneralUser, async (req, res) => {
  const studentId = req.user?._id;
  const { inputs, cvSource, cvId } = req.body;

  if (!studentId) return res.status(400).json({ error: 'User not found' });
  if (!inputs || !Array.isArray(inputs))
    return res.status(400).json({ error: 'Invalid inputs format' });

  // Load base student profile
  let student = await getCachedStudent(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // If "Last Generated CV" was selected, overlay cvData on top of profile
  if (cvSource === 'generate' && cvId) {
    try {
      const cv = await getCachedCV(studentId, cvId);
      if (cv) {
        student = normalizeCVData(cv, student);
      } else {
        console.warn(
          `[Autofill] CV ${cvId} not found or not completed — falling back to profile`,
        );
      }
    } catch (err) {
      // Non-fatal: log and continue with profile data
      console.warn('[Autofill] CV load failed, using profile:', err.message);
    }
  }

  const normalizedInputs = normalizeInputs(inputs);
  const { outputs, filledCount } = await resolveOutputs(
    student,
    normalizedInputs,
  );

  return res.json({
    studentId: student.id,
    outputs,
    stats: {
      total: outputs.length,
      filled: filledCount,
      empty: outputs.length - filledCount,
      source: student._cvId ? 'cv' : 'profile',
    },
  });
});

// ────────────────────────────────────────────────────────────
//  POST /manual
//  Called when user fills the popup and clicks "Save & Fill".
//  Runs the same resolve logic AND persists entered values
//  into student.metadata.autofillCache for future fast fills.
//  Body: { fields: [{ inputKey, value }] }
// ────────────────────────────────────────────────────────────
router.post('/manual', authMiddleware, isGeneralUser, async (req, res) => {
  const studentId = req.user?._id;
  const { fields: inputs } = req.body;

  if (!studentId) return res.status(400).json({ error: 'User not found' });
  if (!inputs || !Array.isArray(inputs))
    return res.status(400).json({ error: 'Invalid inputs format' });

  const student = await getCachedStudent(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const normalizedInputs = normalizeInputs(inputs);
  const { outputs, filledCount } = await resolveOutputs(
    student,
    normalizedInputs,
  );

  // Persist non-empty manually entered values into autofillCache.
  // Next autofill hits Layer 1 for these fields — no AI call needed.
  const cacheUpdate = {};
  inputs.forEach(({ inputKey, value }) => {
    if (!inputKey || !String(value ?? '').trim()) return;
    const nk = normalizeKeyForMatching(String(inputKey));
    if (nk) {
      cacheUpdate[`metadata.autofillCache.${nk}`] = String(value).trim();
    }
  });

  if (Object.keys(cacheUpdate).length > 0) {
    // Fire-and-forget — don't block the HTTP response
    Student.updateOne({ _id: studentId }, { $set: cacheUpdate })
      .then(() => redisClient.del(`autofill:student:${studentId}`))
      .catch((err) => console.error('[Autofill] cache persist error:', err));
  }

  return res.json({
    studentId: student.id,
    outputs,
    stats: {
      total: outputs.length,
      filled: filledCount,
      empty: outputs.length - filledCount,
      learned: Object.keys(cacheUpdate).length,
    },
  });
});

export default router;
