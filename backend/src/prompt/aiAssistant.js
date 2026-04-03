const MAX_PROFILE_ITEMS = 5;
const MAX_PROFILE_CHARS = 8_000;
const MAX_ATTACHMENT_CHARS = 4_000;
const MAX_BLOCK_CHARS = 18_000;

function cleanText(value) {
  return String(value ?? '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncate(value, limit) {
  const text = cleanText(value);
  if (!text) return '';
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}… [truncated]`;
}

function compactList(items, projector) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, MAX_PROFILE_ITEMS).map((item) => projector(item));
}

function compactEditableSnapshot(snapshot) {
  if (!snapshot) return null;

  return {
    fullName: snapshot.fullName || '',
    email: snapshot.email || '',
    phone: snapshot.phone || '',
    jobRole: snapshot.jobRole || '',
    location: snapshot.location || '',
    profileImage: snapshot.profileImage || '',
    resumeUrl: snapshot.resumeUrl || '',
    uploadedCV: snapshot.uploadedCV || '',
    hasCompletedOnboarding: Boolean(snapshot.hasCompletedOnboarding),
    jobPreferences: snapshot.jobPreferences || {},
    education: compactList(snapshot.education, (item) => ({
      id: item?._id || item?.educationId || '',
      educationId: item?.educationId || item?._id || '',
      institute: item?.institute || '',
      degree: item?.degree || '',
      fieldOfStudy: item?.fieldOfStudy || '',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
      grade: item?.grade || '',
      country: item?.country || '',
      isCurrentlyStudying: Boolean(item?.isCurrentlyStudying),
      order: Number(item?.order || 0),
    })),
    experience: compactList(snapshot.experience, (item) => ({
      id: item?._id || item?.experienceId || '',
      experienceId: item?.experienceId || item?._id || '',
      company: item?.company || '',
      title: item?.title || '',
      designation: item?.designation || '',
      employmentType: item?.employmentType || '',
      location: item?.location || '',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
      currentlyWorking: Boolean(item?.currentlyWorking),
      description: item?.description || '',
      order: Number(item?.order || 0),
    })),
    skills: compactList(snapshot.skills, (item) => ({
      id: item?._id || item?.skillId || '',
      skillId: item?.skillId || item?._id || '',
      skill: item?.skill || '',
      level: item?.level || '',
      order: Number(item?.order || 0),
    })),
    projects: compactList(snapshot.projects, (item) => ({
      id: item?._id || '',
      projectName: item?.projectName || '',
      description: item?.description || '',
      technologies: Array.isArray(item?.technologies)
        ? item.technologies.slice(0, 10)
        : [],
      link: item?.link || '',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
      isWorkingActive: Boolean(item?.isWorkingActive),
      order: Number(item?.order || 0),
    })),
  };
}

export const AI_ASSISTANT_SYSTEM_PROMPT = `
You are ZobsAI Assistant, a career operations copilot and product support specialist for the ZobsAI platform.

What you can help with:
- Platform navigation and support questions.
- Profile setup, profile review, and profile improvement suggestions.
- CV review, CV rewriting, ATS optimization, and resume tailoring.
- Cover letter drafting, rewriting, and tailoring.
- Job description analysis and match guidance.
- Application strategy, interview prep, and job search advice.

Operating rules:
- Treat the user's message, uploaded documents, pasted job description, and profile snapshot as the source of truth.
- If the user uploads a CV, cover letter, job description, screenshot, or image, read it and use it directly.
- If the user asks for a profile operation, give the exact fields, steps, or content needed to complete it.
- Do not claim that a backend action happened unless the request explicitly contains the result of that action.
- If the user is missing key information, ask only for the missing fields instead of guessing.
- If uploaded documents conflict with the user's message, point out the conflict clearly.
- For rewriting tasks, return ready-to-use content first, then brief improvement notes if helpful.
- Keep the tone concise, accurate, and practical.
`.trim();

export function compactAssistantProfileSnapshot(snapshot) {
  if (!snapshot) return null;

  const compact = {
    fullName: snapshot.fullName || '',
    email: snapshot.email || '',
    phone: snapshot.phone || '',
    jobRole: snapshot.jobRole || '',
    location: snapshot.location || '',
    resumeUrl: snapshot.resumeUrl || '',
    profileImage: snapshot.profileImage || '',
    uniEmail: snapshot.uniEmail || '',
    profileVisibility: snapshot.profileVisibility || '',
    hasCompletedOnboarding: Boolean(snapshot.hasCompletedOnboarding),
    jobPreferences: snapshot.jobPreferences || {},
    settings: snapshot.settings || {},
    metadata: snapshot.metadata || {},
    education: compactList(snapshot.education, (item) => ({
      institute: item?.institute || item?.school || '',
      degree: item?.degree || '',
      fieldOfStudy: item?.fieldOfStudy || '',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
      grade: item?.grade || '',
    })),
    experience: compactList(snapshot.experience, (item) => ({
      company: item?.company || '',
      title: item?.title || '',
      location: item?.location || '',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
      employmentType: item?.employmentType || '',
    })),
    skills: compactList(snapshot.skills, (item) => ({
      skill: item?.skill || '',
      level: item?.level || '',
    })),
    projects: compactList(snapshot.projects, (item) => ({
      projectName: item?.projectName || '',
      description: item?.description || '',
      technologies: Array.isArray(item?.technologies)
        ? item.technologies.slice(0, 8)
        : [],
    })),
  };

  const compactText = JSON.stringify(compact, null, 2);
  return truncate(compactText, MAX_PROFILE_CHARS);
}

export function formatAssistantAttachments(attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) return '';

  return attachments
    .map((attachment, index) => {
      const label = attachment.label || attachment.originalname || `File ${index + 1}`;
      const text = truncate(attachment.text || '', MAX_ATTACHMENT_CHARS) || '[No readable text extracted]';
      const note = attachment.error ? `\nExtraction note: ${cleanText(attachment.error)}` : '';

      return `Attachment ${index + 1}
Field: ${attachment.fieldname || 'attachment'}
Name: ${label}
Type: ${attachment.mimetype || 'unknown'}
Content:
${text}${note}`;
    })
    .join('\n\n---\n\n');
}

export function buildAssistantPrompt({
  query = '',
  jobDescription = '',
  profileSnapshot = null,
  attachments = [],
} = {}) {
  const userQuery = cleanText(query);
  const jobDescriptionText = cleanText(jobDescription);
  const profileText = compactAssistantProfileSnapshot(profileSnapshot);
  const attachmentText = formatAssistantAttachments(attachments);

  const blocks = [
    AI_ASSISTANT_SYSTEM_PROMPT,
    profileText
      ? `CURRENT USER PROFILE SNAPSHOT:\n${profileText}`
      : 'CURRENT USER PROFILE SNAPSHOT:\nNo saved profile data was found.',
    userQuery ? `USER REQUEST:\n${truncate(userQuery, MAX_BLOCK_CHARS)}` : '',
    jobDescriptionText
      ? `PASTED JOB DESCRIPTION:\n${truncate(jobDescriptionText, MAX_BLOCK_CHARS)}`
      : '',
    attachmentText ? `UPLOADED FILE CONTEXT:\n${attachmentText}` : '',
    `
Response rules:
- Use the strongest available context first.
- If the request is for CV, cover letter, or JD tailoring, provide a ready-to-use draft or an actionable edit plan.
- If the request is about updating profile data, help the user specify the exact fields when needed and support direct updates when the assistant has enough detail.
- If the user is asking a support question, answer directly and briefly.
- If the user needs more information, ask only for the missing pieces.
`.trim(),
    'ANSWER:',
  ].filter(Boolean);

  return blocks.join('\n\n');
}

export function buildAssistantOperationPrompt({
  query = '',
  jobDescription = '',
  profileSnapshot = null,
  attachments = [],
} = {}) {
  const userQuery = cleanText(query);
  const jobDescriptionText = cleanText(jobDescription);
  const editableSnapshot = compactEditableSnapshot(profileSnapshot);
  const attachmentText = formatAssistantAttachments(attachments);

  const payload = {
    userQuery,
    jobDescription: jobDescriptionText,
    currentProfile: editableSnapshot,
    uploadedAttachments: attachmentText || '',
  };

  return `
You are an operation planner for ZobsAI's chat-based profile editor.

Return JSON only. No markdown. No extra text.

JSON shape:
{
  "needsClarification": boolean,
  "clarification": string,
  "operations": [
    {
      "operation": "update_profile" | "update_job_preferences" | "add_skill" | "update_skill" | "delete_skill" | "add_education" | "update_education" | "delete_education" | "add_experience" | "update_experience" | "delete_experience" | "add_project" | "update_project" | "delete_project",
      "match": {
        "id": string,
        "skillId": string,
        "educationId": string,
        "experienceId": string,
        "projectName": string,
        "skill": string,
        "company": string,
        "title": string,
        "institute": string
      },
      "payload": object
    }
  ]
}

Rules:
- Only include operations you are confident about.
- If the user says update profile, update everything, refresh my profile, optimize my profile, or use similar broad wording, treat that as permission to make a best-effort profile refresh using the current snapshot and uploaded context.
- For broad refresh requests, do not ask for clarification if you can infer at least one safe improvement from the snapshot or attachments.
- Break broad refreshes into the smallest safe operations you can infer.
- If the user did not provide enough detail for a specific edit, set "needsClarification" to true and ask only for the missing values.
- For profile updates, use payload fields like fullName, email, phone, jobRole, location, profileImage, resumeUrl, uploadedCV.
- For job preferences, use the exact jobPreferences keys available in the snapshot.
- For skills, education, experience, and projects, prefer the IDs from the snapshot when you can match an existing record.
- If the request is about changing values rather than adding/removing records, choose the matching update operation.
- If no operations are safe to perform, leave "operations" empty and set needsClarification to true.

Broad refresh guidance:
- Prefer practical improvements the user would reasonably want from a career profile review.
- Use explicit evidence from the profile snapshot, attachments, and job description first.
- You may infer missing but strongly supported improvements, such as a clearer job role, cleaner location, stronger skill wording, or job preference normalization.
- Do not invent unrelated facts. If something is not supported by the profile or uploaded context, leave it unchanged.

Context:
${JSON.stringify(payload, null, 2)}

Return only valid JSON.
`.trim();
}
