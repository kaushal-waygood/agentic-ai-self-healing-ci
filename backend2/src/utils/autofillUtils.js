// utils/autofillUtils.js
/**
 * Utility helpers for autofill-ai route.
 * Keep these pure and well-documented so tests are easy to write.
 */

export function safe(fn, fallback = '') {
  try {
    const v = fn();
    if (v === undefined || v === null) return fallback;
    return v;
  } catch (e) {
    return fallback;
  }
}

/** Deep-get by dotted path (supports numeric array indices) */
export function deepGet(obj, path) {
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

/** Build canonical key for a descriptor: prefer label then inputKey/name */
export function canonicalDescriptorKey(descriptor = {}) {
  const lbl = descriptor.label || descriptor.labelText || descriptor.name || '';
  const key = descriptor.inputKey || descriptor.name || '';
  const winner = String(lbl).trim() || String(key).trim() || '';
  return winner.toLowerCase();
}

/** Normalize an input option (object/string) to a string */
export function normalizeOptionToString(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'string') return opt;
  if (typeof opt === 'object')
    return opt.value || opt.label || JSON.stringify(opt);
  return String(opt);
}

/** Heuristics to detect name-related keys */
export function isNameKey(lowKey) {
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

/** Split full name into { first, middle, last } reasonably */
export function splitFullName(fullName) {
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

/** Resolve a name-like descriptor key to a student name fragment or full name */
export function resolveNameFieldForKey(lowKey, studentDoc = {}) {
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

/** Map a canonical input key or label to a student value (fallbacks included) */
export function mapInputToValue(inputKeyOrLabel, studentDoc = {}) {
  if (!inputKeyOrLabel) return '';

  const key = String(inputKeyOrLabel);
  // Common collection fields
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

  // dot-notation fallback
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

/** Find a best-matching option from UI options given the student doc */
export function findOptionMatchForStudent(options = [], studentDoc = {}) {
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

/** Normalize AI model output value vs student doc and options */
export function normalizeOutputValue(
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

/** Find AI entry matching descriptor by inputKey or label */
export function findAiEntryForDescriptor(parsedOutputs = [], descriptor = {}) {
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

/** Build compact student snapshot used in prompts */
export function buildStudentSnapshot(student = {}) {
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
  };
}
