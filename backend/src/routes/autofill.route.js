// routes/autofill-ai.js
import { Router } from 'express';
import { authMiddleware, isGeneralUser, isStudent } from '../middlewares/auth.middleware.js';
import { Student } from '../models/students/student.model.js';
import mongoose from 'mongoose';
import { genAIRequest as genAI } from '../config/gemini.js';

const router = Router();

/* ---------- Basic helpers (kept local to avoid extra imports) ---------- */

function safe(fn, fallback = '') {
  try {
    const v = fn();
    if (v === undefined || v === null) return fallback;
    return v;
  } catch (e) {
    return fallback;
  }
}

function deepGet(obj, path) {
  if (!path) return '';
  const parts = String(path).split('.');
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

function canonicalDescriptorKey(descriptor = {}) {
  const lbl = descriptor.label || descriptor.labelText || descriptor.name || '';
  const key = descriptor.inputKey || descriptor.name || '';
  const winner = String(lbl).trim() || String(key).trim() || '';
  return winner.toLowerCase();
}

function normalizeOptionToString(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'string') return opt;
  if (typeof opt === 'object')
    return opt.value || opt.label || JSON.stringify(opt);
  return String(opt);
}

function isNameKey(lowKey) {
  if (!lowKey) return false;
  const nameIndicators = [
    'full',
    'name',
    'first',
    'given',
    'last',
    'surname',
    'family',
    'middle',
    'middlename',
    'displayname',
    'display-name',
    'preferredname',
    'nickname',
    'legalname',
    'personname',
  ];
  return nameIndicators.some((ind) => lowKey.includes(ind));
}

function splitFullName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { first: '', middle: '', last: '' };
  if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
  if (parts.length === 2)
    return { first: parts[0], middle: '', last: parts[1] };
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(' '),
    last: parts[parts.length - 1],
  };
}

function resolveNameFieldForKey(lowKey, studentDoc = {}) {
  const full = safe(
    () => studentDoc.fullName || studentDoc.fullname || studentDoc.name || '',
    '',
  );
  const first = safe(
    () =>
      studentDoc.firstName ||
      studentDoc.first_name ||
      studentDoc.givenName ||
      studentDoc.given_name ||
      '',
    '',
  );
  const last = safe(
    () =>
      studentDoc.lastName ||
      studentDoc.last_name ||
      studentDoc.familyName ||
      studentDoc.family_name ||
      studentDoc.surname ||
      '',
    '',
  );
  const middle = safe(
    () =>
      studentDoc.middleName ||
      studentDoc.middle_name ||
      studentDoc.middlename ||
      '',
    '',
  );
  const display = safe(
    () => studentDoc.displayName || studentDoc.display_name || '',
    '',
  );
  const nick = safe(
    () =>
      studentDoc.nickname ||
      studentDoc.preferredName ||
      studentDoc.preferred_name ||
      '',
    '',
  );

  if (/(^|[^a-z])(first|given)/.test(lowKey)) {
    if (first) return first;
    if (full) return splitFullName(full).first;
  }
  if (/(^|[^a-z])(middle|middl)/.test(lowKey)) {
    if (middle) return middle;
    if (full) return splitFullName(full).middle || '';
  }
  if (/(^|[^a-z])(last|surname|family)/.test(lowKey)) {
    if (last) return last;
    if (full) return splitFullName(full).last || '';
  }
  if (/(display|preferred|nick|nickname)/.test(lowKey)) {
    return display || nick || full || '';
  }
  if (
    /(^|[^a-z])(full|^name$|^fullname|full-name|name$|name[^a-z])/.test(
      lowKey,
    ) ||
    lowKey === 'name'
  ) {
    return full || [first, middle, last].filter(Boolean).join(' ') || '';
  }
  if (lowKey.includes('name')) {
    return full || [first, middle, last].filter(Boolean).join(' ') || '';
  }
  return full || first || last || middle || display || nick || '';
}

function mapInputToValue(inputKeyOrLabel, studentDoc = {}) {
  if (!inputKeyOrLabel) return '';

  const key = String(inputKeyOrLabel);

  if (key === 'education' || key === 'educations')
    return safe(() => studentDoc.education || [], []);
  if (key === 'experience' || key === 'experiences')
    return safe(() => studentDoc.experience || [], []);
  if (key === 'projects' || key === 'project')
    return safe(() => studentDoc.projects || [], []);
  if (key === 'skills') {
    const skillsArr = safe(() => studentDoc.skills || [], []);
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
  if (/resume|cv|uploadedcv|uploaded_cv/i.test(key)) {
    const url = safe(() => studentDoc.resumeUrl || studentDoc.uploadedCV || '');
    return url ? { url } : '';
  }

  if (key.indexOf('.') !== -1) {
    const v = deepGet(studentDoc, key);
    if (v !== undefined && v !== null && v !== '') return v;
  }

  const low = key.toLowerCase();

  if (isNameKey(low)) return resolveNameFieldForKey(low, studentDoc);
  if (low === 'email' || low.includes('email'))
    return safe(() => studentDoc.email || '', '');
  if (
    low === 'phone' ||
    low === 'phonenumber' ||
    low === 'mobile' ||
    low.includes('phone')
  )
    return safe(() => studentDoc.phone || '', '');
  if (low === 'jobrole' || low === 'job_role' || low === 'jobtitle')
    return safe(() => studentDoc.jobRole || '', '');
  if (low === 'jobpreferences' || low === 'job_preferences')
    return safe(() => studentDoc.jobPreferences || {}, {});

  return safe(() => studentDoc[key], '');
}

function findOptionMatchForStudent(options = [], studentDoc = {}) {
  const opts = (options || []).map(normalizeOptionToString);
  const email = (studentDoc.email || '').toLowerCase();
  if (email) {
    const domain = email.split('@')[1] || '';
    const opt = opts.find(
      (o) =>
        o.toLowerCase().includes(email) ||
        (domain && o.toLowerCase().includes(domain)),
    );
    if (opt) return opt;
  }
  const phone = (studentDoc.phone || '').replace(/\s/g, '');
  if (phone) {
    const codeCandidates = ['+91', '91', '+1', '1', '+44', '44'];
    for (const c of codeCandidates) {
      const found = opts.find((o) => o.includes(c));
      if (found) return found;
    }
    const numeric = phone.replace(/\D/g, '');
    if (numeric.length >= 4) {
      const found = opts.find((o) =>
        o.replace(/\D/g, '').endsWith(numeric.slice(-4)),
      );
      if (found) return found;
    }
  }
  const emailOpt = opts.find((o) => /@/.test(o));
  if (emailOpt) return emailOpt;
  return null;
}

function normalizeOutputValue(
  inputDescriptor = {},
  modelValue,
  studentDoc = {},
) {
  if (modelValue !== undefined && modelValue !== null) {
    if (typeof modelValue === 'string' && modelValue.trim() !== '')
      return modelValue;
    if (typeof modelValue === 'number' || typeof modelValue === 'boolean')
      return modelValue;
    if (Array.isArray(modelValue) && modelValue.length > 0) return modelValue;
    if (typeof modelValue === 'object' && Object.keys(modelValue).length > 0)
      return modelValue;
  }

  const canonKey = canonicalDescriptorKey(inputDescriptor || {});
  if (isNameKey(canonKey)) {
    const nameResolved = resolveNameFieldForKey(canonKey, studentDoc);
    if (nameResolved) return nameResolved;
  }

  const mapped = mapInputToValue(canonKey, studentDoc);
  if (mapped !== undefined && mapped !== null && mapped !== '') return mapped;

  if (
    Array.isArray(inputDescriptor.options) &&
    inputDescriptor.options.length
  ) {
    const optMatch = findOptionMatchForStudent(
      inputDescriptor.options,
      studentDoc,
    );
    if (optMatch) return optMatch;
  }

  return '';
}

function findAiEntryForDescriptor(parsedOutputs = [], descriptor = {}) {
  if (!Array.isArray(parsedOutputs) || !descriptor) return null;
  const descKey = String(descriptor.inputKey || '').toLowerCase();
  const descLabel = String(
    descriptor.label || descriptor.name || '',
  ).toLowerCase();
  return (
    parsedOutputs.find((o) => {
      const oKey = String(o.inputKey || '').toLowerCase();
      const oLabel = String(o.label || '').toLowerCase();
      return (
        (oKey && (oKey === descKey || oKey === descLabel)) ||
        (oLabel && (oLabel === descKey || oLabel === descLabel))
      );
    }) || null
  );
}

function buildStudentSnapshot(student = {}) {
  return {
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    jobRole: student.jobRole,
    education: student.education || [],
    experience: student.experience || [],
    skills: student.skills || [],
    projects: student.projects || [],
    jobPreferences: student.jobPreferences || {},
    uploadedCV: student.uploadedCV || student.resumeUrl || '',
    firstName:
      student.firstName ||
      student.first_name ||
      student.givenName ||
      student.given_name ||
      '',
    lastName:
      student.lastName ||
      student.last_name ||
      student.familyName ||
      student.family_name ||
      student.surname ||
      '',
    middleName:
      student.middleName || student.middle_name || student.middlename || '',
    displayName: student.displayName || student.display_name || '',
    nickname:
      student.nickname || student.preferredName || student.preferred_name || '',
    // optional helpful fields for heuristics
    currentSalary:
      student.currentSalary ||
      student.current_ctc ||
      student.currentSalaryLPA ||
      null,
  };
}

/* ---------- Grouping & radio/select heuristics ---------- */

function groupDescriptorsByInputKey(descriptors = []) {
  const map = new Map();
  for (const d of descriptors) {
    const key = String(d.inputKey || '').trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(d);
  }
  return map; // Map<inputKey, Array<descriptor>>
}

function chooseRadioOptionFromDescriptors(descriptors = [], studentDoc = {}) {
  const labels = descriptors.map((d) => (d.label || '').trim()).filter(Boolean);

  // yes/no pair
  const yesNoLabels = labels.filter((l) => /^(yes|no)$/i.test(l.trim()));
  if (yesNoLabels.length === 2) {
    const boolCandidates = [
      studentDoc.visaSponsorshipRequired,
      studentDoc.willingToRelocate,
      safe(
        () =>
          studentDoc.jobPreferences &&
          studentDoc.jobPreferences.immediateAvailability,
        null,
      ),
      safe(() => studentDoc.canWorkRemotely, null),
    ];
    const truthy = boolCandidates.find((b) => b === true);
    if (truthy !== undefined) {
      return truthy
        ? labels.find((l) => /yes/i.test(l)) || labels[0]
        : labels.find((l) => /no/i.test(l)) || labels[0];
    }
    return labels.find((l) => /no/i.test(l)) || labels[0];
  }

  // availability / notice period
  const availImmediate = labels.find((l) => /immediate/i.test(l));
  const avail30 = labels.find((l) => /30/i.test(l));
  const avail45 = labels.find((l) => /45/i.test(l));
  const availMore = labels.find((l) => /more|> 45|greater/i.test(l));

  if (availImmediate || avail30 || avail45 || availMore) {
    const immediate = safe(
      () =>
        studentDoc.jobPreferences &&
        studentDoc.jobPreferences.immediateAvailability,
      false,
    );
    const noticeDays = safe(() => {
      const jp = studentDoc.jobPreferences || {};
      return (
        jp.noticePeriodDays ||
        jp.noticePeriod ||
        jp.preferredNoticePeriod ||
        null
      );
    }, null);

    if (immediate && availImmediate) return availImmediate;
    if (typeof noticeDays === 'number') {
      if (noticeDays <= 0 && availImmediate) return availImmediate;
      if (noticeDays <= 30 && avail30) return avail30;
      if (noticeDays <= 45 && avail45) return avail45;
      if (noticeDays > 45 && availMore) return availMore;
    }
    return availImmediate || avail30 || avail45 || availMore || labels[0];
  }

  // language proficiency
  const proficiencyLabels = labels.filter((l) =>
    /(fluent|native|advanced|intermediate|beginner)/i.test(l),
  );
  if (proficiencyLabels.length) {
    const langPref = safe(
      () => studentDoc.languageProficiency || studentDoc.languages || '',
      '',
    );
    if (typeof langPref === 'string' && langPref) {
      const match = proficiencyLabels.find((l) =>
        l.toLowerCase().includes(langPref.toLowerCase()),
      );
      if (match) return match;
    }
    const order = ['fluent', 'native', 'advanced', 'intermediate', 'beginner'];
    for (const token of order) {
      const found = proficiencyLabels.find((l) =>
        l.toLowerCase().includes(token),
      );
      if (found) return found;
    }
  }

  // email/phone match
  const emailMatch = labels.find(
    (l) =>
      studentDoc.email &&
      l.toLowerCase().includes(String(studentDoc.email).toLowerCase()),
  );
  if (emailMatch) return emailMatch;
  const phoneMatch = labels.find((l) => {
    const numeric = String(l).replace(/\D/g, '');
    const studentPhone = String(safe(() => studentDoc.phone || '', '')).replace(
      /\D/g,
      '',
    );
    return numeric && studentPhone && studentPhone.endsWith(numeric.slice(-4));
  });
  if (phoneMatch) return phoneMatch;

  return labels[0] || '';
}

function chooseOptionFromOptionsArray(options = [], studentDoc = {}) {
  const match = findOptionMatchForStudent(options, studentDoc);
  if (match) return match;

  const preferred = safe(
    () =>
      studentDoc.jobPreferences &&
      studentDoc.jobPreferences.preferredSalary &&
      studentDoc.jobPreferences.preferredSalary.min,
    null,
  );
  const currentSalary = safe(
    () =>
      studentDoc.currentSalary ||
      studentDoc.current_ctc ||
      studentDoc.currentSalaryLPA ||
      null,
    null,
  );
  const opts = (options || []).map(normalizeOptionToString);

  const findNumericClosest = (value) => {
    if (!value) return null;
    const parsed = opts
      .map((o) => {
        const m = ('' + o).match(/(\d+(?:[\.,]\d+)?)/);
        if (!m) return null;
        return { raw: o, num: parseFloat(m[1].replace(',', '.')) };
      })
      .filter(Boolean);
    if (!parsed.length) return null;
    const target = Number(value);
    let best = parsed[0];
    let bestDiff = Math.abs(parsed[0].num - target);
    for (const p of parsed) {
      const d = Math.abs(p.num - target);
      if (d < bestDiff) {
        best = p;
        bestDiff = d;
      }
    }
    return best ? best.raw : null;
  };

  const byPreferred = findNumericClosest(preferred);
  if (byPreferred) return byPreferred;
  const byCurrent = findNumericClosest(currentSalary);
  if (byCurrent) return byCurrent;

  return opts[0] || '';
}

function buildGroupedOutputs(
  inputsArray = [],
  parsedAiOutputs = [],
  studentDoc = {},
) {
  const grouped = groupDescriptorsByInputKey(inputsArray); // Map<inputKey, descriptors[]>
  const outputs = [];

  for (const [inputKey, descriptors] of grouped.entries()) {
    const descriptor =
      descriptors.find((d) => Array.isArray(d.options) && d.options.length) ||
      descriptors[0];

    // AI-provided value for group?
    const aiEntry = (parsedAiOutputs || []).find((o) => {
      const oKey = String(o.inputKey || '').toLowerCase();
      const oLabel = String(o.label || '').toLowerCase();
      const descKey = String(inputKey || '').toLowerCase();
      const descLabel = String(
        descriptor.label || descriptor.name || '',
      ).toLowerCase();
      return (
        (oKey && (oKey === descKey || oKey === descLabel)) ||
        (oLabel && (oLabel === descKey || oLabel === descLabel))
      );
    });

    if (
      aiEntry &&
      aiEntry.value !== undefined &&
      aiEntry.value !== null &&
      String(aiEntry.value).trim() !== ''
    ) {
      outputs.push({
        inputKey,
        label: descriptor.label || descriptors.map((d) => d.label).join(' / '),
        value: aiEntry.value,
      });
      continue;
    }

    if (Array.isArray(descriptor.options) && descriptor.options.length) {
      const opt = chooseOptionFromOptionsArray(descriptor.options, studentDoc);
      outputs.push({
        inputKey,
        label: descriptor.label || '',
        value: opt || '',
      });
      continue;
    }

    if (descriptors.length > 1) {
      const chosenLabel = chooseRadioOptionFromDescriptors(
        descriptors,
        studentDoc,
      );
      outputs.push({ inputKey, label: chosenLabel, value: chosenLabel || '' });
      continue;
    }

    const fallbackVal = normalizeOutputValue(descriptor, undefined, studentDoc);
    outputs.push({
      inputKey,
      label: descriptor.label || '',
      value: fallbackVal || '',
    });
  }

  return outputs;
}

/* ---------- Route ---------- */

router.post('/', authMiddleware, isGeneralUser, async (req, res) => {
  const { _id: authId } = req.user || {};
  const studentId = authId || req.body.studentId;
  let { inputs } = req.body || {};

  console.log('autofill-ai request', { studentId, inputs });

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

    const studentSnapshot = buildStudentSnapshot(student);

    // Minimal few-shot examples to encourage JSON structured output
    const exampleInputs = [
      {
        inputKey: 'example-email',
        label: 'Email address',
        type: 'select',
        options: ['vk2@gmail.com', 'someone@example.com'],
      },
      {
        inputKey: 'example-phone',
        label: 'Mobile phone number',
        type: 'text',
        options: [],
      },
      {
        inputKey: 'example-first',
        label: 'First name',
        type: 'text',
        options: [],
      },
      {
        inputKey: 'example-last',
        label: 'Last name',
        type: 'text',
        options: [],
      },
      {
        inputKey: 'example-full',
        label: 'Full name',
        type: 'text',
        options: [],
      },
    ];

    const exampleStudent = {
      fullName: 'Aman Gupta',
      firstName: 'Aman',
      lastName: 'Gupta',
      email: 'vk2@gmail.com',
      phone: '+911234567890',
      jobRole: 'Full stack developer',
      education: [{ institute: 'IGNOI', degree: 'Bachelor' }],
      skills: [{ skill: 'React' }, { skill: 'Node.js' }],
    };

    const exampleOutput = {
      studentId: 'EXAMPLE_ID',
      outputs: [
        { inputKey: 'example-email', value: 'vk2@gmail.com' },
        { inputKey: 'example-phone', value: '+911234567890' },
        { inputKey: 'example-first', value: 'Aman' },
        { inputKey: 'example-last', value: 'Gupta' },
        { inputKey: 'example-full', value: 'Aman Gupta' },
      ],
    };

    const prompt = [
      'You are an assistant that returns machine-readable JSON only. No commentary, no explanation.',
      'Input: a student JSON and an array of input descriptors called `inputs`.',
      'Output: a single JSON object with shape:',
      "  { studentId: '<id>', outputs: [{ inputKey: '<string>', value: <string|number|boolean|object|array> }, ...] }",
      'Rules:',
      ' - Respond with valid JSON only (no surrounding backticks).',
      ' - Prefer studentSnapshot values when filling fields. If an inputs.options contains an exact match for a student value, pick that.',
      ' - For collection inputs (education, experience, projects, skills) return arrays/objects, not CSV, unless inputKey explicitly asks for a joined string (e.g. skills.joined).',
      ' - If a field is missing, return empty string "" or empty array/object as appropriate.',
      '',
      'Example:',
      'student:',
      JSON.stringify(exampleStudent, null, 2),
      'inputs:',
      JSON.stringify(exampleInputs, null, 2),
      'expected output:',
      JSON.stringify(exampleOutput, null, 2),
      '',
      'Now, real student:',
      JSON.stringify(studentSnapshot, null, 2),
      'Inputs:',
      JSON.stringify(inputs, null, 2),
      '',
      'Produce the JSON now.',
    ].join('\n');

    // Call Gemini wrapper
    let aiResponseText = null;
    try {
      const aiResult = await genAI(prompt, {
        model: 'gemini-2.0-flash',
        generationConfig: { temperature: 0.0, maxOutputTokens: 2048 },
      });
      aiResponseText =
        typeof aiResult === 'string' ? aiResult : String(aiResult);
      console.log('Gemini raw response length:', aiResponseText.length);
    } catch (aiErr) {
      console.warn(
        'Gemini error, falling back to deterministic mapping',
        aiErr?.message || aiErr,
      );
    }

    // Defensive parse
    let parsed = null;
    if (aiResponseText) {
      try {
        parsed = JSON.parse(aiResponseText);
      } catch (e) {
        const start = aiResponseText.indexOf('{');
        const end = aiResponseText.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          const candidate = aiResponseText.slice(start, end + 1);
          try {
            parsed = JSON.parse(candidate);
          } catch (e2) {
            parsed = null;
          }
        }
      }
    }

    // Use grouped outputs if possible (handles radio groups)
    if (parsed && parsed.outputs && Array.isArray(parsed.outputs)) {
      parsed.studentId = parsed.studentId || String(studentId);

      const groupedOutputs = buildGroupedOutputs(
        inputs,
        parsed.outputs,
        student,
      );

      console.log(
        'autofill-ai: groupedOutputs',
        JSON.stringify(groupedOutputs, null, 2),
      );
      return res.json({
        studentId: String(studentId),
        outputs: groupedOutputs,
      });
    }

    // Deterministic grouped outputs fallback
    const deterministicGroupedOutputs = buildGroupedOutputs(
      inputs,
      [],
      student,
    );
    console.log(
      'autofill-ai: deterministicGroupedOutputs',
      JSON.stringify(deterministicGroupedOutputs, null, 2),
    );
    return res.json({
      studentId: String(studentId),
      outputs: deterministicGroupedOutputs,
    });
  } catch (err) {
    console.error('autofill-ai error', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

export default router;
