// routes/autofill.js (update)
import { Router } from 'express';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';
import { Student } from '../models/student.model.js';
import mongoose from 'mongoose';

const router = Router();

function safe(fn, fallback = '') {
  try {
    const v = fn();
    if (v === undefined || v === null) return fallback;
    return v;
  } catch (e) {
    return fallback;
  }
}

// Helper to deep-get by dotted path (supports array indices)
function deepGet(obj, path) {
  if (!path) return '';
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return '';
    if (/^\d+$/.test(p)) {
      cur = cur[Number(p)];
    } else {
      cur = cur[p];
    }
  }
  return cur;
}

// Enhanced mapping returning arrays/objects for collection keys
function mapInputToValue(inputKey, studentDoc) {
  if (!inputKey) return '';

  const key = String(inputKey);

  // exact collection requests — return the whole array/object
  if (key === 'education' || key === 'educations') {
    // return array of education objects (lean doc already)
    return safe(() => studentDoc.education || [], []);
  }
  if (key === 'experience' || key === 'experiences') {
    return safe(() => studentDoc.experience || [], []);
  }
  if (key === 'projects' || key === 'project') {
    return safe(() => studentDoc.projects || [], []);
  }
  if (key === 'skills') {
    // return array of skill objects or strings (your choice)
    const skillsArr = safe(() => studentDoc.skills || [], []);
    // prefer returning array of objects with skill & level
    return skillsArr.map((s) => ({
      skill: s.skill,
      level: s.level || 'INTERMEDIATE',
    }));
  }
  if (
    key === 'skills.joined' ||
    key === 'skills_csv' ||
    key === 'skills_string'
  ) {
    const skillsArr = safe(() => studentDoc.skills || [], []);
    return skillsArr
      .map((s) => s.skill)
      .filter(Boolean)
      .join(', ');
  }

  // file / resume
  if (/resume|cv|uploadedcv|uploaded_cv/i.test(key)) {
    const url = safe(() => studentDoc.resumeUrl || studentDoc.uploadedCV || '');
    return url ? { url } : '';
  }

  // dot-notation fallback like 'education.0.institute'
  if (key.indexOf('.') !== -1) {
    const v = deepGet(studentDoc, key);
    if (v === undefined || v === null) return '';
    return v;
  }

  // common scalar fields
  const low = key.toLowerCase();
  if (low === 'fullname' || low === 'name' || low === 'full name') {
    return safe(() => studentDoc.fullName || '', '');
  }
  if (low === 'email') return safe(() => studentDoc.email || '', '');
  if (low === 'phone' || low === 'phonenumber' || low === 'mobile') {
    return safe(() => studentDoc.phone || '', '');
  }
  if (low === 'jobrole' || low === 'job_role' || low === 'jobtitle') {
    return safe(() => studentDoc.jobRole || '', '');
  }

  // jobPreferences full object
  if (low === 'jobpreferences' || low === 'job_preferences') {
    return safe(() => studentDoc.jobPreferences || {}, {});
  }

  // fallback: try direct property
  return safe(() => studentDoc[key], '');
}

// POST /api/autofill
router.post('/', authMiddleware, isStudent, async (req, res) => {
  // prefer authenticated student id, fallback to body.studentId for testing
  const { _id: authId } = req.user || {};
  const studentId = authId || req.body.studentId;
  let { inputs } = req.body || {};

  // tolerate inputs being a JSON-string
  if (!Array.isArray(inputs) && typeof inputs === 'string') {
    try {
      inputs = JSON.parse(inputs);
    } catch (e) {
      /* leave as-is */
    }
  }

  if (!studentId) return res.status(400).json({ error: 'studentId required' });
  if (!Array.isArray(inputs))
    return res.status(400).json({ error: 'inputs must be an array' });

  if (!mongoose.Types.ObjectId.isValid(studentId))
    return res.status(400).json({ error: 'invalid studentId' });

  try {
    const student = await Student.findById(studentId).lean().exec();
    if (!student) return res.status(404).json({ error: 'student not found' });

    const outputs = inputs.map((inp) => {
      const raw = mapInputToValue(inp.inputKey, student);
      const isPrimitive = (v) =>
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean';
      return {
        inputKey: inp.inputKey,
        value: isPrimitive(raw) ? String(raw) : raw,
      };
    });

    return res.json({ studentId, outputs });
  } catch (err) {
    console.error('autofill error', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

export default router;
