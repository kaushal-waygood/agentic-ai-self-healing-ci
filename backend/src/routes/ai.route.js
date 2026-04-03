import { Router } from 'express';
import mongoose from 'mongoose';
import {
  authMiddleware,
  isUserOrUniStudent,
} from '../middlewares/auth.middleware.js';
import { memoryUpload, upload } from '../middlewares/multer.js';
import {
  convertDataIntoHTML,
  generateCVByJD,
  generateCVByJobId,
  generateCVByTitle,
  generateCoverLetterByJD,
  generateCoverLetterByJobId,
  generateCoverLetterByTitle,
  saveStudentHTMLCV,
  getStudentHTMLCV,
  getSingleStudentHTMLCV,
  savedStudentHTMLLetter,
  getStudentHTMLLetter,
  getSingleStudentHTMLLetter,
  createTailoredApply,
  generateEmailDraft,
  calculateJobMatchScore,
  regenerateCV,
  saveTailoredApplication,
  getSavedApplications,
  regenerateCL,
  getAllCVs,
  getAllCLs,
  getAllTailoredApplications,
  getSingleCV,
  getSingleCL,
  getSingleTailoredApplication,
  deleteSingleCV,
  deleteSingleCL,
  deleteSingleTailoredApplication,
  refreshStatus,
  renameHtmlCV,
  renameCoverLetter,
  calculateATS,
  changeTempateCV,
  getAllTemplates,
  deleteSingleStudentSavedCV,
  deleteSingleStudentSavedCL,
  renameSavedStudentCL,
  renameSavedStudentCV,
  getStudentCLsFromExtension,
  getStudentCVsFromExtension,
  getDocumentCounts,
} from '../controllers/ai.controller.js';
import multer from 'multer';
import {
  cvGenerationSSE,
  getCVGenerationStatus,
} from '../controllers/sse.controller.js';
import {
  extractStudentDataFromCV,
  getStudentDataFromUploadedCV,
} from '../controllers/rough.js';
import { checkCredits } from '../middlewares/checkCredits.js';
import { requireCompleteProfile } from '../middlewares/profileComplete.js';
import { generateContent } from '../config/gemini.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import {
  buildAssistantOperationPrompt,
  buildAssistantPrompt,
} from '../prompt/aiAssistant.js';
import {
  generateEmailPrompt,
  parseEmailDraftResponse,
} from '../prompt/generateEmail.js';
import { extractTextFromFile } from '../controllers/ai.controller.js';
import { applyAssistantOperations } from '../services/assistantProfileOperations.js';
import { getRecommendedJobs } from '../utils/getRecommendedJobs.js';
import { initiateCVGeneration } from '../utils/generateCVCore.js';
import { initiateCoverLetterGeneration } from '../utils/generateCoverLetterCore.js';
import { computeATS } from '../utils/calculateATSScore.js';
import { generatePdfFromHtml } from '../utils/generatePdfFromHtml.js';
import { AssistantChat } from '../models/assistantChat.model.js';
import { AssistantFoundJob } from '../models/AssistantFoundJob.js';
import { AgentFoundJob } from '../models/AgentFoundJob.js';
import { AppliedJob } from '../models/AppliedJob.js';
import { JobApplication } from '../models/JobApplication.js';
import { JobInteraction } from '../models/jobInteraction.model.js';
import { Student } from '../models/students/student.model.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { wrapEmailDraftHtml } from '../utils/emailTemplate.js';

const router = Router();

const ASSISTANT_FILE_FIELDS = [
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 },
  { name: 'attachments', maxCount: 8 },
];

const ASSISTANT_ALLOWED_FIELDS = new Set(
  ASSISTANT_FILE_FIELDS.map((field) => field.name),
);

const ASSISTANT_ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const assistantUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 12,
  },
  fileFilter: (req, file, cb) => {
    if (!ASSISTANT_ALLOWED_FIELDS.has(file.fieldname)) {
      return cb(new Error(`Unsupported assistant upload field "${file.fieldname}"`));
    }

    if (!ASSISTANT_ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`Unsupported file type for "${file.originalname}"`));
    }

    return cb(null, true);
  },
});

function parseAssistantUploads(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }

  assistantUpload.fields(ASSISTANT_FILE_FIELDS)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Unable to read assistant uploads.',
      });
    }

    return next();
  });
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(normalized);
  }
  return false;
}

function looksLikeProfileUpdateRequest(query, jobDescription) {
  const text = `${query || ''} ${jobDescription || ''}`.toLowerCase();

  if (!text.trim()) return false;

  const updateVerb = /\b(update|edit|change|modify|set|add|remove|delete|replace|refresh|sync)\b/.test(
    text,
  );
  const profileNoun = /\b(profile|job role|jobrole|job preferences?|skill|skills|education|experience|project|projects|resume|cv|phone|email|location|name|avatar|photo)\b/.test(
    text,
  );

  return updateVerb && profileNoun;
}

function looksLikeBroadProfileRefresh(query, jobDescription) {
  const text = `${query || ''} ${jobDescription || ''}`.toLowerCase();

  if (!text.trim()) return false;

  return (
    /\b(update( my)? profile|update everything|refresh( my)? profile|optimi[sz]e( my)? profile|improve( my)? profile|use your judgment|do what you think|whatever you think)\b/.test(
      text,
    ) || /\b(broad refresh|full refresh|profile refresh)\b/.test(text)
  );
}

const ASSISTANT_MODES = {
  GENERAL: 'general',
  UPDATE_PROFILE: 'update_profile',
  FIND_JOBS: 'find_jobs',
  REVIEW_CV: 'review_cv',
  GENERATE_CV: 'generate_cv',
  GENERATE_CL: 'generate_cl',
  WRITE_MAIL: 'write_mail',
};

function normalizeAssistantMode(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (
    [
      ASSISTANT_MODES.UPDATE_PROFILE,
      'profile_update',
      'profile',
      'update-profile',
    ].includes(normalized)
  ) {
    return ASSISTANT_MODES.UPDATE_PROFILE;
  }

  if (
    [ASSISTANT_MODES.FIND_JOBS, 'jobs', 'job_search', 'job-search'].includes(
      normalized,
    )
  ) {
    return ASSISTANT_MODES.FIND_JOBS;
  }

  if (
    [ASSISTANT_MODES.REVIEW_CV, 'review_resume', 'cv_review'].includes(
      normalized,
    )
  ) {
    return ASSISTANT_MODES.REVIEW_CV;
  }

  if (
    [ASSISTANT_MODES.GENERATE_CV, 'generate_resume', 'cv_generate'].includes(
      normalized,
    )
  ) {
    return ASSISTANT_MODES.GENERATE_CV;
  }

  if (
    [
      ASSISTANT_MODES.GENERATE_CL,
      'generate_cover_letter',
      'cover_letter',
      'cl_generate',
    ].includes(normalized)
  ) {
    return ASSISTANT_MODES.GENERATE_CL;
  }

  if (
    [ASSISTANT_MODES.WRITE_MAIL, 'write_email', 'email', 'mail'].includes(
      normalized,
    )
  ) {
    return ASSISTANT_MODES.WRITE_MAIL;
  }

  if ([ASSISTANT_MODES.GENERAL, 'auto', 'default'].includes(normalized)) {
    return ASSISTANT_MODES.GENERAL;
  }

  return ASSISTANT_MODES.GENERAL;
}

function inferAssistantMode(query, jobDescription) {
  const text = `${query || ''} ${jobDescription || ''}`.toLowerCase();

  if (looksLikeProfileUpdateRequest(query, jobDescription)) {
    return ASSISTANT_MODES.UPDATE_PROFILE;
  }

  if (
    /\b(find|search|recommend|recommended|suggest)\b.*\b(job|jobs|role|roles|opportunity|opportunities|internship|internships)\b/.test(
      text,
    ) ||
    /\b(job search|job recommendations?|recommended jobs)\b/.test(text)
  ) {
    return ASSISTANT_MODES.FIND_JOBS;
  }

  if (
    /\b(review|analy[sz]e|audit|check|improve|optimi[sz]e)\b.*\b(cv|resume)\b/.test(
      text,
    ) ||
    /\b(ats|ats score|resume review|cv review)\b/.test(text)
  ) {
    return ASSISTANT_MODES.REVIEW_CV;
  }

  if (
    /\b(generate|create|draft|write|make|tailor)\b.*\b(cv|resume)\b/.test(
      text,
    ) ||
    /\b(cv generator|resume generator)\b/.test(text)
  ) {
    return ASSISTANT_MODES.GENERATE_CV;
  }

  if (
    /\b(generate|create|draft|write|tailor)\b.*\b(cover letter|cl)\b/.test(
      text,
    ) ||
    /\b(cover letter|cl)\b.*\b(generate|create|draft|write|tailor)\b/.test(text)
  ) {
    return ASSISTANT_MODES.GENERATE_CL;
  }

  if (
    /\b(write|draft|compose|send|prepare)\b.*\b(email|mail)\b/.test(text) ||
    /\b(email draft|mail draft|recruiter email|follow-up email)\b/.test(text)
  ) {
    return ASSISTANT_MODES.WRITE_MAIL;
  }

  return ASSISTANT_MODES.GENERAL;
}

function resolveAssistantMode(requestedMode, query, jobDescription) {
  const normalized = normalizeAssistantMode(requestedMode);
  if (normalized !== ASSISTANT_MODES.GENERAL) {
    return normalized;
  }

  return inferAssistantMode(query, jobDescription);
}

function buildModeFallbackPrompt(mode, profileSnapshot) {
  switch (mode) {
    case ASSISTANT_MODES.UPDATE_PROFILE:
      return 'Update my profile using your best judgment from the current profile snapshot and uploaded context.';
    case ASSISTANT_MODES.FIND_JOBS:
      return 'Find jobs that best match my current profile.';
    case ASSISTANT_MODES.REVIEW_CV:
      return 'Review my CV and tell me the highest-impact improvements.';
    case ASSISTANT_MODES.GENERATE_CV:
      return `Generate a tailored CV using my profile${profileSnapshot?.jobRole ? ` for ${profileSnapshot.jobRole}` : ''}.`;
    case ASSISTANT_MODES.GENERATE_CL:
      return 'Generate a tailored cover letter using my profile and the available context.';
    case ASSISTANT_MODES.WRITE_MAIL:
      return 'Write a professional application email using my profile and the available context.';
    default:
      return '';
  }
}

function formatJobLocation(job = {}) {
  if (typeof job?.location === 'string') {
    return job.location;
  }
  const city = job?.location?.city || job?.city || '';
  const state = job?.location?.state || job?.state || '';
  const country = job?.country || '';
  return [city, state, country].filter(Boolean).join(', ');
}

function buildMatchPercent(score, topScore) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;

  const normalizedScore = score <= 1 ? score : score / 100;
  const normalizedTopScore =
    typeof topScore === 'number' && !Number.isNaN(topScore)
      ? topScore <= 1
        ? topScore
        : topScore / 100
      : 0;

  if (normalizedTopScore > 0) {
    return Math.max(1, Math.round((normalizedScore / normalizedTopScore) * 100));
  }

  return Math.max(1, Math.round(normalizedScore * 100));
}

function toStringJobId(value) {
  if (!value) return '';
  return String(value).trim();
}

function collectJobIdSet(values = []) {
  return new Set(
    values
      .flat()
      .map((value) => toStringJobId(value))
      .filter(Boolean),
  );
}

function extractJobId(job = {}) {
  return toStringJobId(job?._id || job?.jobId || job?.id);
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ''));
}

function buildJobCard(job = {}, topRankScore = null) {
  const matchPercent = buildMatchPercent(job.rankScore, topRankScore);
  const rawJobUrl =
    job?.applyMethod?.url ||
    job?.job_apply_link ||
    job?.url ||
    '';
  const isExternalUrl = /^https?:\/\//i.test(String(rawJobUrl || ''));
  const internalJobId = job?.jobId || job?._id || job?.id || '';
  const jobUrl = rawJobUrl
    ? rawJobUrl
    : internalJobId
      ? `/jobs/${internalJobId}`
      : '';
  return {
    id: String(job._id || job.id || ''),
    title: job.title || 'Untitled role',
    company: job.company || job.employer || 'Unknown company',
    location: formatJobLocation(job),
    remote: Boolean(job.remote),
    jobTypes: Array.isArray(job.jobTypes) ? job.jobTypes : [],
    salary: job.salary || job.compensation || '',
    rankScore: typeof job.rankScore === 'number' ? job.rankScore : null,
    matchPercent,
    jobUrl,
    isExternalUrl,
    description: String(job.description || '').slice(0, 220),
    origin: job.origin || '',
  };
}

async function getExcludedAssistantJobIds(studentId) {
  const [
    student,
    savedSaved,
    savedApplied,
    viewedInteractions,
    visitedInteractions,
    assistantFound,
    agentFound,
    appliedJobs,
    jobApplications,
    studentApplications,
    tailoredApplications,
  ] =
    await Promise.all([
      Student.findById(studentId)
        .select('savedJobs appliedJobs viewedJobs visitedJobs')
        .lean(),
      JobInteraction.distinct('job', { user: studentId, type: 'SAVED' }),
      JobInteraction.distinct('job', { user: studentId, type: 'APPLIED' }),
      JobInteraction.distinct('job', { user: studentId, type: 'VIEW' }),
      JobInteraction.distinct('job', { user: studentId, type: 'VISIT' }),
      AssistantFoundJob.distinct('job', { student: studentId }),
      AgentFoundJob.distinct('job', { student: studentId }),
      AppliedJob.distinct('job', { student: studentId }),
      JobApplication.distinct('job', { applicant: studentId }),
      StudentApplication.distinct('job', { student: studentId }),
      StudentTailoredApplication.distinct('jobId', { student: studentId }),
    ]);

  const studentSaved = Array.isArray(student?.savedJobs)
    ? student.savedJobs.map((entry) => entry?.job)
    : [];
  const studentApplied = Array.isArray(student?.appliedJobs)
    ? student.appliedJobs.map((entry) => entry?.job)
    : [];
  const studentViewed = Array.isArray(student?.viewedJobs)
    ? student.viewedJobs.map((entry) => entry?.job)
    : [];
  const studentVisited = Array.isArray(student?.visitedJobs)
    ? student.visitedJobs.map((entry) => entry?.job)
    : [];

  return collectJobIdSet([
    studentSaved,
    studentApplied,
    savedSaved,
    savedApplied,
    viewedInteractions,
    visitedInteractions,
    assistantFound,
    agentFound,
    appliedJobs,
    jobApplications,
    studentApplications,
    tailoredApplications,
    studentViewed,
    studentVisited,
  ]);
}

async function saveAssistantFoundJobs(
  studentId,
  assistantMode,
  jobs = [],
  context = {},
) {
  const records = jobs
    .map((job) => {
      const jobId = extractJobId(job);
      if (!jobId || !isValidObjectId(jobId)) return null;
      return {
        updateOne: {
          filter: { student: studentId, job: jobId },
          update: {
            $set: {
              status: 'ACTIVE',
              assistantMode,
              rankScore: typeof job.rankScore === 'number' ? job.rankScore : null,
              matchPercent:
                typeof job.matchPercent === 'number' ? job.matchPercent : null,
              metadata: {
                title: job.title || '',
                company: job.company || '',
                location: job.location || '',
                remote: Boolean(job.remote),
                jobUrl: job.jobUrl || '',
                origin: job.origin || '',
                context,
              },
              lastSeenAt: new Date(),
            },
            $setOnInsert: {
              student: studentId,
              job: jobId,
              foundAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    })
    .filter(Boolean);

  if (!records.length) return 0;

  const result = await AssistantFoundJob.bulkWrite(records, {
    ordered: false,
  });

  return result?.upsertedCount ?? result?.modifiedCount ?? 0;
}

function buildJobsResponseText(jobs = [], { hasMoreJobs = false } = {}) {
  if (!jobs.length) {
    return 'I could not find any new unique jobs from your current profile yet. Try refreshing your profile or widening your job preferences.';
  }

  const lines = [
    `I found ${jobs.length} job match${jobs.length === 1 ? '' : 'es'} for your profile:`,
  ];

  jobs.slice(0, 6).forEach((job, index) => {
    const location = job.location ? ` · ${job.location}` : '';
    const remote = job.remote ? ' · Remote' : '';
    const score =
      job.matchPercent !== null ? ` · Match ${job.matchPercent}%` : '';
    lines.push(
      `${index + 1}. ${job.title} at ${job.company}${location}${remote}${score}`,
    );
  });

  if (hasMoreJobs) {
    lines.push('');
    lines.push('I have more unique jobs I can load if you want to see the next batch.');
  }

  lines.push('');
  lines.push('Tell me if you want me to refine by location, job type, or seniority.');
  return lines.join('\n');
}

function buildCvReviewPrompt({
  query,
  jobDescription,
  profileSnapshot,
  attachments,
}) {
  const attachmentText = attachments
    .map((attachment, index) => {
      const label = attachment.originalname || `Attachment ${index + 1}`;
      return `Attachment ${index + 1} (${label}):\n${attachment.text || '[no readable text found]'}`;
    })
    .join('\n\n---\n\n');

  return `
You are a senior CV reviewer for ZobsAI.

Review the user's CV using the profile snapshot, the uploaded CV text, and any job description.

Requirements:
- Be specific and practical.
- Give the top 5 improvements in priority order.
- Call out ATS, clarity, impact, missing keywords, and formatting issues when relevant.
- If the user provided a job description, include role-fit guidance.
- Do not invent experience or skills.
- If the CV text is missing, clearly say that you are reviewing the available profile context instead.
- Return markdown only.

User request:
${query || 'Review my CV'}

Job description:
${jobDescription || 'Not provided'}

Profile snapshot:
${JSON.stringify(profileSnapshot || {}, null, 2)}

Uploaded CV / attachments:
${attachmentText || 'No readable attachment text was provided.'}

Response structure:
## Overall assessment
## Top issues
## Highest-impact fixes
## Optional improved summary
`.trim();
}

function buildEmailCandidate(profileSnapshot) {
  return {
    fullName: profileSnapshot?.fullName || '',
    email: profileSnapshot?.email || '',
    phone: profileSnapshot?.phone || '',
    location: profileSnapshot?.location || '',
    education: profileSnapshot?.education || [],
    experience: profileSnapshot?.experience || [],
    skills: profileSnapshot?.skills || [],
    projects: profileSnapshot?.projects || [],
  };
}

function buildEmailJobFromContext(query, jobDescription, profileSnapshot) {
  return {
    title: profileSnapshot?.jobRole || query || 'Application',
    company: 'Hiring Team',
    description: `${query || ''}\n${jobDescription || ''}`.trim(),
  };
}

function createMockResponse() {
  const state = {
    statusCode: 200,
    headers: {},
    body: null,
  };

  return {
    state,
    status(code) {
      state.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      state.headers[String(name).toLowerCase()] = value;
      return this;
    },
    json(payload) {
      state.body = payload;
      return this;
    },
    send(payload) {
      state.body = payload;
      return this;
    },
  };
}

async function runDocumentGeneration(
  generator,
  req,
  extraBody = {},
  jobContextString,
  jobTitle,
) {
  const mockReq = {
    ...req,
    app: req.app,
    body: {
      ...(req.body || {}),
      ...extraBody,
    },
  };
  const mockRes = createMockResponse();
  await generator(mockReq, mockRes, jobContextString, jobTitle);
  return mockRes.state;
}

function extractJsonPayload(text) {
  const raw = String(text || '').trim();
  if (!raw) {
    throw new Error('Empty response from assistant action planner.');
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] || raw).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Assistant did not return JSON.');
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function formatOperationResults(results = []) {
  const applied = results.filter((item) => item.status === 'applied');
  const skipped = results.filter((item) => item.status === 'skipped');
  const needsInput = results.filter((item) => item.status === 'needs_input');
  const failed = results.filter((item) => item.status === 'failed');

  if (applied.length === 0 && needsInput.length === 0 && failed.length === 0) {
    return 'I could not find a safe update to apply yet. Please tell me the exact field and new value.';
  }

  const lines = [];

  if (applied.length > 0) {
    lines.push('I updated the following:');
    for (const item of applied) {
      lines.push(`- ${item.message || item.operation}`);
    }
  }

  if (needsInput.length > 0) {
    lines.push('');
    lines.push('I still need a little more detail for:');
    for (const item of needsInput) {
      lines.push(`- ${item.message || item.operation}`);
    }
  }

  if (failed.length > 0) {
    lines.push('');
    lines.push('A few updates did not go through:');
    for (const item of failed) {
      lines.push(`- ${item.message || item.operation}`);
    }
  }

  if (skipped.length > 0 && applied.length === 0) {
    lines.push('');
    lines.push('Nothing was updated because some requested actions were not supported.');
  }

  return lines.join('\n');
}

function formatPlannedOperation(operation) {
  if (!operation || typeof operation !== 'object') {
    return 'Unknown operation';
  }

  const parts = [operation.operation || 'update'];

  const match = operation.match && typeof operation.match === 'object'
    ? Object.entries(operation.match)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}: ${formatListValue(value)}`)
    : [];

  const payload = operation.payload && typeof operation.payload === 'object'
    ? Object.entries(operation.payload)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}: ${formatListValue(value)}`)
    : [];

  if (match.length) parts.push(`match(${match.join(', ')})`);
  if (payload.length) parts.push(`set(${payload.join(', ')})`);

  return parts.join(' • ');
}

function buildUpdatePreviewResponse(operations = []) {
  const plannedOperations = operations.map((operation) => ({
    operation: operation.operation,
    match: operation.match || {},
    payload: operation.payload || {},
  }));

  const plannedSummary = plannedOperations.length
    ? plannedOperations.map((operation) => formatPlannedOperation(operation))
    : ['No update operations were detected.'];

  return {
    success: true,
    needsConfirmation: true,
    message:
      'I found a set of profile updates. Review the plan and confirm to generate the PDF.',
    preview: {
      summary: plannedSummary,
      operations: plannedOperations,
      operationCount: plannedOperations.length,
    },
  };
}

function buildAssistantChatMessage({
  sender,
  text,
  responseType = 'text',
  metadata = {},
}) {
  return {
    sender,
    text: normalizeText(text),
    responseType,
    metadata,
    createdAt: new Date(),
  };
}

async function appendAssistantChatMessage(studentId, message) {
  if (!studentId || !message?.text) return null;

  return AssistantChat.findOneAndUpdate(
    { student: studentId },
    {
      $setOnInsert: { student: studentId },
      $set: { lastMessageAt: message.createdAt || new Date() },
      $push: { messages: message },
    },
    { upsert: true, new: true },
  ).lean();
}

async function saveAssistantChatMessages(studentId, messages = []) {
  for (const message of messages) {
    await appendAssistantChatMessage(studentId, message);
  }
}

async function persistAssistantReply(studentId, text, responseType = 'text', metadata = {}) {
  if (!studentId || !text) return null;
  return appendAssistantChatMessage(
    studentId,
    buildAssistantChatMessage({
      sender: 'assistant',
      text,
      responseType,
      metadata,
    }),
  );
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatListValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatListValue(item))
      .filter(Boolean)
      .join(', ');
  }

  if (value && typeof value === 'object') {
    if (value.skill) {
      return value.level ? `${value.skill} (${value.level})` : value.skill;
    }

    if (value.currency || value.min || value.max || value.period) {
      const min = value.min !== undefined && value.min !== null ? value.min : '';
      const max = value.max !== undefined && value.max !== null ? value.max : '';
      const currency = value.currency ? `${value.currency} ` : '';
      const period = value.period ? ` / ${value.period}` : '';

      if (min || max) {
        return `${currency}${min}${min && max ? ' - ' : ''}${max}${period}`.trim();
      }

      return `${currency}${period}`.trim();
    }

    return Object.entries(value)
      .filter(([, nestedValue]) => nestedValue !== undefined && nestedValue !== null && nestedValue !== '')
      .map(([key, nestedValue]) => `${key}: ${formatListValue(nestedValue)}`)
      .join(', ');
  }

  return String(value ?? '').trim();
}

function renderSummaryRow(label, value) {
  const formatted = formatListValue(value);
  return `
    <div class="summary-row">
      <div class="summary-label">${escapeHtml(label)}</div>
      <div class="summary-value">${formatted ? escapeHtml(formatted) : '<span class="muted">Not provided</span>'}</div>
    </div>
  `;
}

function renderResultSection(title, items, tone) {
  if (!items?.length) return '';

  return `
    <section class="panel panel-${tone}">
      <div class="panel-title">${escapeHtml(title)}</div>
      <ul class="result-list">
        ${items
          .map(
            (item) => `
              <li>
                <strong>${escapeHtml(item.operation || 'update')}</strong>
                <span>${escapeHtml(item.message || 'Completed.')}</span>
              </li>
            `,
          )
          .join('')}
      </ul>
    </section>
  `;
}

function buildAssistantUpdatePdfHtml({
  query,
  jobDescription,
  attachments,
  profileSnapshot,
  operationResults,
}) {
  const applied = operationResults.filter((item) => item.status === 'applied');
  const skipped = operationResults.filter((item) => item.status === 'skipped');
  const needsInput = operationResults.filter((item) => item.status === 'needs_input');
  const failed = operationResults.filter((item) => item.status === 'failed');

  const attachmentItems = (attachments || []).filter(Boolean);
  const now = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const snapshotRows = profileSnapshot
    ? [
        ['Full name', profileSnapshot.fullName || profileSnapshot.name],
        ['Email', profileSnapshot.email],
        ['Phone', profileSnapshot.phone],
        ['Location', profileSnapshot.location],
        ['Job role', profileSnapshot.jobRole],
        ['Preferred cities', profileSnapshot?.jobPreferences?.preferredCities],
        ['Preferred countries', profileSnapshot?.jobPreferences?.preferredCountries],
        ['Preferred job titles', profileSnapshot?.jobPreferences?.preferredJobTitles],
        ['Preferred job types', profileSnapshot?.jobPreferences?.preferredJobTypes],
        ['Remote', profileSnapshot?.jobPreferences?.isRemote],
        ['Education entries', profileSnapshot.education?.length ?? 0],
        ['Experience entries', profileSnapshot.experience?.length ?? 0],
        ['Skills entries', profileSnapshot.skills?.length ?? 0],
        ['Projects entries', profileSnapshot.projects?.length ?? 0],
      ].filter(([, value]) => value !== undefined && value !== null && value !== '')
    : [];

  const snapshotHtml = snapshotRows.length
    ? snapshotRows
        .map(([label, value]) => renderSummaryRow(label, value))
        .join('')
    : '<p class="empty-note">No profile snapshot was available for this update.</p>';

  const attachmentsHtml = attachmentItems.length
    ? `
      <ul class="attachment-list">
        ${attachmentItems
          .map(
            (file) => `
              <li>
                <strong>${escapeHtml(file.originalname || 'Uploaded file')}</strong>
                <span>${escapeHtml(file.fieldname || 'attachment')} · ${escapeHtml(file.mimetype || 'unknown type')}</span>
              </li>
            `,
          )
          .join('')}
      </ul>
    `
    : '<p class="empty-note">No attachments were provided.</p>';

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>ZobsAI Profile Update Summary</title>
      <style>
        :root {
          color-scheme: light;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #0f172a;
          font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13px;
          line-height: 1.55;
        }
        .page {
          padding: 28px;
        }
        .header {
          padding: 24px;
          border: 1px solid #dbeafe;
          border-radius: 20px;
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
          margin-bottom: 18px;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 10px;
          font-weight: 800;
          color: #2563eb;
          margin-bottom: 8px;
        }
        h1 {
          font-size: 28px;
          margin: 0 0 8px;
          line-height: 1.1;
        }
        .meta {
          color: #475569;
          font-size: 12px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .panel {
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 18px;
          background: #fff;
          margin-bottom: 14px;
        }
        .panel-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #64748b;
          margin-bottom: 12px;
        }
        .panel-applied {
          border-color: #bfdbfe;
          background: #eff6ff;
        }
        .panel-pending {
          border-color: #fde68a;
          background: #fffbeb;
        }
        .panel-failed {
          border-color: #fecaca;
          background: #fef2f2;
        }
        .summary-row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #eef2f7;
        }
        .summary-row:last-child {
          border-bottom: 0;
        }
        .summary-label {
          font-weight: 700;
          color: #334155;
        }
        .summary-value {
          color: #0f172a;
          word-break: break-word;
        }
        .muted,
        .empty-note {
          color: #64748b;
        }
        .result-list,
        .attachment-list {
          margin: 0;
          padding-left: 18px;
        }
        .result-list li,
        .attachment-list li {
          margin-bottom: 10px;
        }
        .result-list strong,
        .attachment-list strong {
          display: block;
          margin-bottom: 2px;
        }
        .section-label {
          margin: 0 0 10px;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }
        .text-block {
          white-space: pre-wrap;
        }
        .full-width {
          grid-column: 1 / -1;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="eyebrow">ZobsAI Assistant</div>
          <h1>Profile update summary</h1>
          <div class="meta">Generated on ${escapeHtml(now)}</div>
        </div>

        <div class="grid">
          <section class="panel">
            <div class="panel-title">Requested update</div>
            <div class="section-label">Your message</div>
            <div class="text-block">${escapeHtml(query || 'No direct chat text was provided.')}</div>
          </section>

          <section class="panel">
            <div class="panel-title">Context</div>
            <div class="section-label">Job description</div>
            <div class="text-block">${escapeHtml(jobDescription || 'No job description was provided.')}</div>
          </section>

          <section class="panel full-width">
            <div class="panel-title">Uploaded files</div>
            ${attachmentsHtml}
          </section>

          ${
            applied.length
              ? renderResultSection('Applied changes', applied, 'applied')
              : '<section class="panel full-width"><div class="panel-title">Applied changes</div><p class="empty-note">No profile changes were applied.</p></section>'
          }

          ${needsInput.length ? renderResultSection('Needs more detail', needsInput, 'pending') : ''}

          ${skipped.length ? renderResultSection('Skipped actions', skipped, 'pending') : ''}

          ${failed.length ? renderResultSection('Failed actions', failed, 'failed') : ''}

          <section class="panel full-width">
            <div class="panel-title">Current profile snapshot</div>
            ${snapshotHtml}
          </section>
        </div>
      </div>
    </body>
  </html>`;
}

async function extractAssistantAttachments(filesByField) {
  const files = Object.values(filesByField || {}).flat().filter(Boolean);
  const results = [];

  for (const file of files) {
    try {
      const text = await extractTextFromFile(file);
      results.push({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        text: normalizeText(text),
      });
    } catch (error) {
      results.push({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        text: '',
        error: error?.message || 'Failed to extract text from this file.',
      });
    }
  }

  return results;
}

router.post(
  '/assistant/chat',
  authMiddleware,
  isUserOrUniStudent,
  parseAssistantUploads,
  async (req, res) => {
    try {
      const query =
        typeof req.body?.query === 'string' ? req.body.query.trim() : '';
      const jobDescription =
        typeof req.body?.jobDescription === 'string'
          ? req.body.jobDescription.trim()
          : '';
      const requestedMode =
        typeof req.body?.assistantMode === 'string'
          ? req.body.assistantMode
          : typeof req.body?.mode === 'string'
            ? req.body.mode
            : '';
      const requestedJobPageOffsetRaw = Number(req.body?.jobPageOffset ?? 0);
      const requestedJobPageOffset = Number.isFinite(requestedJobPageOffsetRaw)
        ? Math.max(0, Math.floor(requestedJobPageOffsetRaw))
        : 0;

      const attachments = await extractAssistantAttachments(req.files);

      const userId = req.user?._id?.toString();
      const suppressUserMessage = toBoolean(req.body?.suppressUserMessage);
      const conversationMessages = [];
      let profileSnapshot = null;

      if (userId) {
        try {
          profileSnapshot = await getStudentProfileSnapshot(req.user._id);
        } catch (snapshotError) {
          console.warn('AI assistant profile snapshot error:', snapshotError);
        }
      }

      const assistantMode = resolveAssistantMode(
        requestedMode,
        query,
        jobDescription,
      );
      if (
        assistantMode === ASSISTANT_MODES.GENERAL &&
        !query &&
        !jobDescription &&
        attachments.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Query, job description, or at least one file attachment is required.',
        });
      }
      const effectiveQuery =
        query ||
        buildModeFallbackPrompt(assistantMode, profileSnapshot) ||
        'Shared uploaded context for review.';
      const userMessageText =
        query ||
        jobDescription ||
        (attachments.length > 0
          ? `Shared ${attachments.length} attachment(s) for review.`
          : buildModeFallbackPrompt(assistantMode, profileSnapshot) ||
            'Shared uploaded context for review.');

      if (userId && !suppressUserMessage) {
        conversationMessages.push(
          buildAssistantChatMessage({
            sender: 'user',
            text: userMessageText,
            responseType: 'text',
            metadata: {
              query,
              jobDescription,
              assistantMode,
              attachments: attachments.map((file) => ({
                fieldname: file.fieldname,
                originalname: file.originalname,
                mimetype: file.mimetype,
              })),
            },
          }),
        );

        await saveAssistantChatMessages(userId, conversationMessages);
        conversationMessages.length = 0;
      }

      const confirmUpdate = toBoolean(req.body?.confirmUpdate);
      const wantsBroadProfileRefresh = looksLikeBroadProfileRefresh(
        effectiveQuery,
        jobDescription,
      );

      switch (assistantMode) {
        case ASSISTANT_MODES.UPDATE_PROFILE: {
          if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'You need to be signed in to update your profile.',
            });
          }

          try {
            const actionPrompt = buildAssistantOperationPrompt({
              query: effectiveQuery,
              jobDescription,
              profileSnapshot,
              attachments,
            });

            const rawActionPlan = await generateContent(actionPrompt, {
              userId,
              endpoint: 'ai-assistant-operation-planner',
              temperature: 0.15,
            });

            const actionPlan = extractJsonPayload(rawActionPlan);

            if (actionPlan?.needsClarification && !wantsBroadProfileRefresh) {
              const clarification =
                typeof actionPlan.clarification === 'string'
                  ? actionPlan.clarification.trim()
                  : '';
              if (userId) {
                await persistAssistantReply(
                  userId,
                  clarification ||
                    'I need a little more detail before I can make that update.',
                  'text',
                  {
                    assistantMode,
                    needsConfirmation: false,
                    clarification: true,
                  },
                );
              }
              return res.status(200).json({
                success: true,
                mode: assistantMode,
                answer:
                  clarification ||
                  'I need a little more detail before I can make that update.',
              });
            }

            const operations = Array.isArray(actionPlan?.operations)
              ? actionPlan.operations
              : [];

            if (operations.length > 0) {
              if (!confirmUpdate) {
                const preview = buildUpdatePreviewResponse(operations);
                if (userId) {
                  await persistAssistantReply(
                    userId,
                    preview.message,
                    'preview',
                    {
                      assistantMode,
                      needsConfirmation: true,
                      operationCount: operations.length,
                      summary: operations.map((operation) =>
                        formatPlannedOperation(operation),
                      ),
                    },
                  );
                }
                return res.status(200).json({
                  ...preview,
                  mode: assistantMode,
                });
              }

              const operationResults = await applyAssistantOperations(
                userId,
                operations,
              );
              const appliedCount = operationResults.filter(
                (item) => item.status === 'applied',
              ).length;
              const needsInputCount = operationResults.filter(
                (item) => item.status === 'needs_input',
              ).length;

              if (appliedCount === 0 && needsInputCount > 0) {
                const reply =
                  'I need a little more detail before I can make that update. Please tell me the exact field and new value.';
                if (userId) {
                  await persistAssistantReply(userId, reply, 'text', {
                    assistantMode,
                    needsInput: true,
                  });
                }
                return res.status(200).json({
                  success: true,
                  mode: assistantMode,
                  answer: reply,
                });
              }

              const pdfHtml = buildAssistantUpdatePdfHtml({
                query: effectiveQuery,
                jobDescription,
                attachments,
                profileSnapshot,
                operationResults,
              });
              const pdfBuffer = await generatePdfFromHtml(pdfHtml, {
                documentType: 'document',
                isShowImage: true,
                margin: {
                  top: '12mm',
                  right: '12mm',
                  bottom: '12mm',
                  left: '12mm',
                },
              });

              const safeTitle = `profile_update_${Date.now()}`;
              if (userId) {
                await persistAssistantReply(
                  userId,
                  'Your profile update PDF has been generated and downloaded.',
                  'pdf',
                  {
                    assistantMode,
                    filename: `zobsai_${safeTitle}.pdf`,
                    operationCount: operationResults.length,
                  },
                );
              }
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader(
                'Content-Disposition',
                `attachment; filename="zobsai_${safeTitle}.pdf"`,
              );
              return res.send(pdfBuffer);
            }

            if (wantsBroadProfileRefresh) {
              const broadReply =
                'I reviewed your profile, but I could not confidently apply any safe updates from the current information. Upload a CV or share the target role, and I can make a stronger optimization pass.';

              if (userId) {
                await persistAssistantReply(userId, broadReply, 'text', {
                  assistantMode,
                  broadRefresh: true,
                  noSafeOperations: true,
                });
              }

              return res.status(200).json({
                success: true,
                mode: assistantMode,
                answer: broadReply,
              });
            }

            const clarificationReply =
              typeof actionPlan?.clarification === 'string' &&
              actionPlan.clarification.trim()
                ? actionPlan.clarification.trim()
                : 'I can update your profile, but I need the exact field and new value before I change anything.';

            if (userId) {
              await persistAssistantReply(userId, clarificationReply, 'text', {
                assistantMode,
                needsClarification: true,
              });
            }

            return res.status(200).json({
              success: true,
              mode: assistantMode,
              answer: clarificationReply,
            });
          } catch (actionError) {
            console.warn('AI assistant operation planning failed:', actionError);
            const prompt = buildAssistantPrompt({
              query: effectiveQuery,
              jobDescription,
              profileSnapshot,
              attachments,
            });

            const answer = await generateContent(prompt, {
              userId,
              endpoint: 'ai-assistant-chat',
              temperature: 0.4,
            });

            if (userId) {
              await persistAssistantReply(userId, answer.trim(), 'text', {
                assistantMode,
                jobDescriptionProvided: Boolean(jobDescription),
                attachmentCount: attachments.length,
                fallbackAfterPlannerError: true,
              });
            }

            return res.status(200).json({
              success: true,
              mode: assistantMode,
              responseType: 'text',
              answer: answer.trim(),
            });
          }
        }

        case ASSISTANT_MODES.FIND_JOBS: {
          if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'You need to be signed in to find matched jobs.',
            });
          }

          const excludedJobIds = await getExcludedAssistantJobIds(req.user._id);
          const jobs = await getRecommendedJobs({
            studentId: req.user._id,
            limit: 120,
            pageOffset: requestedJobPageOffset,
          });
          const seenJobIds = new Set();
          const uniqueJobs = Array.isArray(jobs)
            ? jobs.filter((job) => {
                const jobId = extractJobId(job);
                if (!jobId || excludedJobIds.has(jobId) || seenJobIds.has(jobId)) {
                  return false;
                }

                seenJobIds.add(jobId);
                return true;
              })
            : [];
          const topRankScore = uniqueJobs.length
            ? uniqueJobs.reduce(
                (max, job) =>
                  typeof job.rankScore === 'number' && job.rankScore > max
                    ? job.rankScore
                    : max,
                0,
              )
            : 0;
          const persistedJobs = uniqueJobs.map((job) => buildJobCard(job, topRankScore));
          const formattedJobs = persistedJobs.slice(0, 8);
          const hasMoreJobs = persistedJobs.length > formattedJobs.length;
          const jobsCursor = hasMoreJobs
            ? {
                pageOffset: requestedJobPageOffset,
                nextPageOffset: requestedJobPageOffset + 5,
              }
            : null;
          const answer = buildJobsResponseText(formattedJobs, {
            hasMoreJobs,
          });

          await saveAssistantFoundJobs(
            req.user._id,
            assistantMode,
            persistedJobs,
            {
              query: effectiveQuery,
              jobDescription,
              source: 'assistant_chat',
            },
          );

          if (userId) {
            await persistAssistantReply(userId, answer, 'jobs', {
              assistantMode,
              jobs: formattedJobs,
              hasMoreJobs,
              jobsCursor,
            });
          }

          return res.status(200).json({
            success: true,
            mode: assistantMode,
            responseType: 'jobs',
            answer,
            jobs: formattedJobs,
            hasMoreJobs,
            jobsCursor,
          });
        }

        case ASSISTANT_MODES.REVIEW_CV: {
          if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'You need to be signed in to review your CV.',
            });
          }

          const reviewPrompt = buildCvReviewPrompt({
            query: effectiveQuery,
            jobDescription,
            profileSnapshot,
            attachments,
          });

          const reviewAnswer = await generateContent(reviewPrompt, {
            userId,
            endpoint: 'ai-assistant-cv-review',
            temperature: 0.25,
          });

          let finalAnswer = reviewAnswer.trim();

          if (jobDescription) {
            try {
              const ats = await computeATS(jobDescription, {
                _id: req.user._id,
                skills: profileSnapshot?.skills || [],
                experience: profileSnapshot?.experience || [],
                education: profileSnapshot?.education || [],
                projects: profileSnapshot?.projects || [],
              });

              finalAnswer += `\n\n## ATS Snapshot\n- Score: ${ats.atsScore}/100\n- Matched keywords: ${
                Array.isArray(ats.skillsMatched) && ats.skillsMatched.length
                  ? ats.skillsMatched.map((item) => item.skill || item).join(', ')
                  : 'None'
              }\n- Missing keywords: ${
                Array.isArray(ats.skillsMissing) && ats.skillsMissing.length
                  ? ats.skillsMissing.join(', ')
                  : 'None'
              }\n- Suggestions:\n${Array.isArray(ats.suggestions) && ats.suggestions.length ? ats.suggestions.map((item) => `  - ${item}`).join('\n') : '  - Keep the CV aligned to the target role.'}`;
            } catch (atsError) {
              console.warn('AI assistant ATS snapshot failed:', atsError);
            }
          }

          if (userId) {
            await persistAssistantReply(userId, finalAnswer, 'text', {
              assistantMode,
              jobDescriptionProvided: Boolean(jobDescription),
              attachmentCount: attachments.length,
            });
          }

          return res.status(200).json({
            success: true,
            mode: assistantMode,
            responseType: 'text',
            answer: finalAnswer,
          });
        }

        case ASSISTANT_MODES.GENERATE_CV: {
          if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'You need to be signed in to generate a CV.',
            });
          }

          const jobContextString =
            jobDescription ||
            effectiveQuery ||
            buildModeFallbackPrompt(assistantMode, profileSnapshot);
          const jobTitle =
            profileSnapshot?.jobRole ||
            (query && query.length > 4 ? query.slice(0, 80) : 'Tailored CV');
          const generationResult = await runDocumentGeneration(
            initiateCVGeneration,
            req,
            {
              useProfile: 'true',
              finalTouch: 'true',
              flag: 'web',
            },
            jobContextString,
            jobTitle,
          );

          if (userId) {
            await persistAssistantReply(
              userId,
              generationResult.body?.message ||
                generationResult.body?.error ||
                'Your CV generation has started. You will be notified when it is complete.',
              'task',
              {
                assistantMode,
                task: 'cv_generation',
                jobId: generationResult.body?.jobId || null,
                cvId: generationResult.body?.cvId || null,
              },
            );
          }

          return res.status(generationResult.statusCode || 202).json({
            success:
              generationResult.statusCode >= 400
                ? false
                : generationResult.body?.success ?? true,
            mode: assistantMode,
            responseType: 'task',
            ...(generationResult.body || {}),
          });
        }

        case ASSISTANT_MODES.GENERATE_CL: {
          if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'You need to be signed in to generate a cover letter.',
            });
          }

          const jobContextString =
            jobDescription ||
            effectiveQuery ||
            buildModeFallbackPrompt(assistantMode, profileSnapshot);
          const generationResult = await runDocumentGeneration(
            initiateCoverLetterGeneration,
            req,
            {
              useProfile: 'true',
              finalTouch: 'true',
              flag: 'web',
            },
            jobContextString,
          );

          if (userId) {
            await persistAssistantReply(
              userId,
              generationResult.body?.message ||
                generationResult.body?.error ||
                'Your cover letter generation has started. You will be notified when it is complete.',
              'task',
              {
                assistantMode,
                task: 'cover_letter_generation',
                jobId: generationResult.body?.jobId || null,
                clId: generationResult.body?.clId || null,
              },
            );
          }

          return res.status(generationResult.statusCode || 202).json({
            success:
              generationResult.statusCode >= 400
                ? false
                : generationResult.body?.success ?? true,
            mode: assistantMode,
            responseType: 'task',
            ...(generationResult.body || {}),
          });
        }

        case ASSISTANT_MODES.WRITE_MAIL: {
          if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'You need to be signed in to write an email draft.',
            });
          }

          const job = buildEmailJobFromContext(
            effectiveQuery,
            jobDescription,
            profileSnapshot,
          );
          const candidate = buildEmailCandidate(profileSnapshot);
          const emailPrompt = generateEmailPrompt({ job, candidate });
          const rawEmail = await generateContent(emailPrompt, {
            userId,
            endpoint: 'ai-assistant-email-draft',
            temperature: 0.25,
          });
          const parsedEmail = parseEmailDraftResponse(rawEmail);
          const emailDraft = {
            subject: parsedEmail.subject,
            body: parsedEmail.body,
            signature: parsedEmail.signature,
            bodyHtml: wrapEmailDraftHtml(parsedEmail.body, parsedEmail.signature),
          };
          const answer = [
            `**Subject:** ${emailDraft.subject}`,
            '',
            emailDraft.body,
            '',
            `**Signature:** ${emailDraft.signature}`,
          ]
            .filter(Boolean)
            .join('\n');

          if (userId) {
            await persistAssistantReply(userId, answer, 'email', {
              assistantMode,
              task: 'email_draft',
            });
          }

          return res.status(200).json({
            success: true,
            mode: assistantMode,
            responseType: 'email',
            answer,
            emailDraft,
          });
        }

        default: {
          const prompt = buildAssistantPrompt({
            query: effectiveQuery,
            jobDescription,
            profileSnapshot,
            attachments,
          });

          const answer = await generateContent(prompt, {
            userId,
            endpoint: 'ai-assistant-chat',
            temperature: 0.4,
          });

          if (userId) {
            await persistAssistantReply(userId, answer.trim(), 'text', {
              assistantMode,
              jobDescriptionProvided: Boolean(jobDescription),
              attachmentCount: attachments.length,
            });
          }

          return res.status(200).json({
            success: true,
            mode: assistantMode,
            responseType: 'text',
            answer: answer.trim(),
          });
        }
      }
    } catch (err) {
      console.error('AI assistant chat error:', err);
      const status = err?.status || 500;
      const msg =
        status === 429
          ? 'AI service is temporarily busy. Please try again in a moment.'
          : 'Sorry, the AI assistant is currently unavailable. Please try again later.';
      if (req.user?._id) {
        try {
          await persistAssistantReply(req.user._id, msg, 'error', {
            status,
          });
        } catch (persistError) {
          console.warn('Failed to persist assistant error message:', persistError);
        }
      }
      return res.status(status >= 500 ? 503 : status).json({
        success: false,
        message: msg,
      });
    }
  },
);

router.get(
  '/assistant/history',
  authMiddleware,
  isUserOrUniStudent,
  async (req, res) => {
    try {
      const studentId = req.user?._id;
      if (!studentId) {
        return res.status(200).json({ success: true, messages: [] });
      }

      const chat = await AssistantChat.findOne({ student: studentId })
        .sort({ updatedAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        messages: Array.isArray(chat?.messages)
          ? chat.messages.map((message) => ({
              sender: message.sender,
              text: message.text,
              responseType: message.responseType || 'text',
              metadata: message.metadata || {},
              createdAt: message.createdAt || chat.createdAt,
            }))
          : [],
      });
    } catch (error) {
      console.error('AI assistant history error:', error);
      return res.status(500).json({
        success: false,
        message: 'Unable to load assistant chat history.',
      });
    }
  },
);

router.post(
  '/resume/extract',
  authMiddleware,
  isUserOrUniStudent,
  memoryUpload.single('cv'),
  extractStudentDataFromCV,
);

router.get('/templates', authMiddleware, isUserOrUniStudent, getAllTemplates);

router.get(
  '/cv/ext',
  authMiddleware,
  isUserOrUniStudent,
  getStudentCVsFromExtension,
);
router.get(
  '/coverletter/ext',
  authMiddleware,
  isUserOrUniStudent,
  getStudentCLsFromExtension,
);

router.post(
  '/change/template',
  authMiddleware,
  isUserOrUniStudent,
  changeTempateCV,
);

router.get(
  '/resume/convert',
  authMiddleware,
  isUserOrUniStudent,
  convertDataIntoHTML,
);

router.get('/cvs', authMiddleware, isUserOrUniStudent, getAllCVs);
router.get('/cls', authMiddleware, isUserOrUniStudent, getAllCLs);
router.get(
  '/tailored-applications',
  authMiddleware,
  isUserOrUniStudent,
  getAllTailoredApplications,
);

router.get('/cv/:cvId', authMiddleware, isUserOrUniStudent, getSingleCV);
router.get('/cl/:clId', authMiddleware, isUserOrUniStudent, getSingleCL);
router.get(
  '/tailored-application/:applicationId',
  authMiddleware,
  isUserOrUniStudent,
  getSingleTailoredApplication,
);

router.get(
  '/documents/count',
  authMiddleware,
  isUserOrUniStudent,
  getDocumentCounts,
);

router.delete('/cv/:cvId', authMiddleware, isUserOrUniStudent, deleteSingleCV);
router.delete('/cl/:clId', authMiddleware, isUserOrUniStudent, deleteSingleCL);
router.delete(
  '/tailored-applications/:appId',
  authMiddleware,
  isUserOrUniStudent,
  deleteSingleTailoredApplication,
);

router.post(
  '/resume/generate/jd',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('CV_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCVByJD,
);

router.post(
  '/resume/generate/jobid',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('CV_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCVByJobId,
);

router.post(
  '/resume/generate/jobtitle',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('CV_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCVByTitle,
);

router.post(
  '/resume/regenerate',
  authMiddleware,
  isUserOrUniStudent,
  regenerateCV,
);

router.patch(
  '/cv/:id/rename',
  authMiddleware,
  isUserOrUniStudent,
  renameHtmlCV,
);
router.patch(
  '/cl/:id/rename',
  authMiddleware,
  isUserOrUniStudent,
  renameCoverLetter,
);

router.get(
  '/status/:type/:id',
  authMiddleware,
  isUserOrUniStudent,
  refreshStatus,
);

router.get('/sse/:jobId', authMiddleware, isUserOrUniStudent, cvGenerationSSE);
router.get('/status/:jobId', getCVGenerationStatus);

router.post(
  '/coverletter/generate/jd',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('COVER_LETTER_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCoverLetterByJD,
);
router.post(
  '/coverletter/generate/jobid',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('COVER_LETTER_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCoverLetterByJobId,
);
router.post(
  '/coverletter/generate/jobtitle',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('COVER_LETTER_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCoverLetterByTitle,
);

router.post(
  '/coverletter/regenerate',
  authMiddleware,
  isUserOrUniStudent,
  requireCompleteProfile,
  regenerateCL,
);

router.post(
  '/resume/save/html',
  authMiddleware,
  isUserOrUniStudent,
  saveStudentHTMLCV,
);
router.get(
  '/resume/saved',
  authMiddleware,
  isUserOrUniStudent,
  getStudentHTMLCV,
);
router.get(
  '/resume/saved/:cvId',
  authMiddleware,
  isUserOrUniStudent,
  getSingleStudentHTMLCV,
);

router.delete(
  '/resume/saved/:cvId',
  authMiddleware,
  isUserOrUniStudent,
  deleteSingleStudentSavedCV,
);

router.delete(
  '/letter/saved/:clId',
  authMiddleware,
  isUserOrUniStudent,
  deleteSingleStudentSavedCL,
);

router.patch(
  '/letter/saved/:clId/rename',
  authMiddleware,
  isUserOrUniStudent,
  renameSavedStudentCL,
);

router.patch(
  '/resume/saved/:cvId/rename',
  authMiddleware,
  isUserOrUniStudent,
  renameSavedStudentCV,
);

router.post(
  '/letter/save/html',
  authMiddleware,
  isUserOrUniStudent,
  savedStudentHTMLLetter,
);
router.get(
  '/letter/saved',
  authMiddleware,
  isUserOrUniStudent,
  getStudentHTMLLetter,
);

router.get(
  '/letter/saved/:letterId',
  authMiddleware,
  isUserOrUniStudent,
  getSingleStudentHTMLLetter,
);

const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
router.post(
  '/applications/tailor',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('TAILORED_APPLY'),
  requireCompleteProfile,
  uploadToMemory.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'jobDescriptionFile', maxCount: 1 },
  ]),
  createTailoredApply,
);

router.post(
  '/applications/save',
  authMiddleware,
  isUserOrUniStudent,
  saveTailoredApplication,
);

router.post(
  '/email-draft/generate',
  authMiddleware,
  isUserOrUniStudent,
  generateEmailDraft,
);

router.get(
  '/applications',
  authMiddleware,
  isUserOrUniStudent,
  getSavedApplications,
);

router.post(
  '/calculate-match',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('JOB_MATCHING'),
  calculateJobMatchScore,
);

router.post(
  '/extract/onboarding',
  authMiddleware,
  isUserOrUniStudent,
  memoryUpload.single('cv'),
  getStudentDataFromUploadedCV,
);

router.post(
  '/ats-score',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('ATS_SCORE'),
  calculateATS,
);

export default router;
