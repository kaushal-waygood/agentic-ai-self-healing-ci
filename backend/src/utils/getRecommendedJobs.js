// src/utils/getRecommendedJobs.js
import mongoose from 'mongoose';
import { Student } from '../models/students/student.model.js';
import {
  retrieveCandidates,
  applyFilters,
  rankJobsWithIntentBoost,
  normalizeSet,
  buildInteractionContext,
} from './jobHelpers.js';

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

/**
 * Extract profile.titles and profile.skills from student/studentProfile for jobHelpers context.
 * Used for accurate vector search and intent-based ranking.
 */
function extractProfileFromStudent(student) {
  const titles = new Set();
  const skills = new Set();

  if (student?.jobRole) titles.add(String(student.jobRole).trim());
  toArray(student?.jobPreferences?.preferredJobTitles).forEach((t) =>
    titles.add(String(t || '').trim()),
  );
  toArray(student?.experience).forEach((exp) => {
    if (exp?.title) titles.add(String(exp.title).trim());
    if (exp?.designation) titles.add(String(exp.designation).trim());
  });
  toArray(student?.education).forEach((edu) => {
    if (edu?.fieldOfStudy) titles.add(String(edu.fieldOfStudy).trim());
    if (edu?.degree) titles.add(String(edu.degree).trim());
  });
  toArray(student?.skills).forEach((s) => {
    const sk = s?.skill || s;
    if (sk) skills.add(String(sk).trim());
  });
  toArray(student?.jobPreferences?.mustHaveSkills).forEach((s) => {
    if (s?.skill) skills.add(String(s.skill).trim());
  });

  return {
    titles: normalizeSet(Array.from(titles).filter(Boolean)),
    skills: normalizeSet(Array.from(skills).filter(Boolean)),
  };
}

/**
 * Build search query string from student profile for keyword/vector search.
 */
function buildSearchQuery(student, agentConfig) {
  const parts = [];
  const role = agentConfig?.jobTitle || student?.jobRole;
  if (role) parts.push(String(role));
  const profile = extractProfileFromStudent(student);
  parts.push(profile.titles.join(' '), profile.skills.join(' '));
  return parts.filter(Boolean).join(' ').trim() || 'Software Engineer';
}

/**
 * Build jobHelpers context from studentProfile + agentConfig for accurate job matching.
 */
function buildRecommendationContext(studentId, studentProfile, agentConfig, appliedJobIds) {
  const profile = extractProfileFromStudent(studentProfile);
  const query = buildSearchQuery(studentProfile, agentConfig);

  const filters = {};
  const country = agentConfig?.country || studentProfile?.jobPreferences?.preferredCountries?.[0];
  if (country) filters.country = String(country).toUpperCase().trim();
  if (agentConfig?.state) filters.state = String(agentConfig.state).trim();
  if (agentConfig?.city) filters.city = String(agentConfig.city).trim();
  if (agentConfig?.employmentType) filters.employmentType = agentConfig.employmentType;
  else if (studentProfile?.jobPreferences?.preferredJobTypes?.length) {
    filters.employmentType = studentProfile.jobPreferences.preferredJobTypes.join(',');
  }

  const applied = new Set((appliedJobIds || []).map((id) => String(id)));

  return {
    type: 'recommendation',
    query,
    filters,
    userId: studentId,
    profile,
    interactions: {
      applied,
      saved: new Set(),
      views: {},
    },
  };
}

export const getRecommendedJobs = async ({
  studentId,
  agentConfig = {},
  studentProfile,
  appliedJobIds = [],
  limit = 50,
  skipExternalFetch = false, // true for autopilot to avoid RapidAPI 429
}) => {
  const student = studentProfile || (await Student.findById(studentId).lean());
  if (!student) throw new Error('Student not found');

  const poolSize = Math.max(limit * 4, 200);
  const context = buildRecommendationContext(
    studentId,
    student,
    agentConfig,
    appliedJobIds,
  );
  context.skipExternalFetch = skipExternalFetch;

  // Merge JobInteraction-based applied/saved if available (e.g. from dashboard)
  const interactionCtx = await buildInteractionContext(studentId);
  if (interactionCtx) {
    context.interactions.applied = new Set([
      ...context.interactions.applied,
      ...interactionCtx.applied,
    ]);
    context.interactions.saved = interactionCtx.saved;
    context.interactions.views = interactionCtx.views;
  }

  let candidates = await retrieveCandidates(context, poolSize);
  let filterContext = context;

  // When autopilot gets 0 local jobs, retry with relaxed country filter (DB may have jobs from other regions)
  if (skipExternalFetch && candidates.length === 0 && context.filters?.country) {
    const relaxedContext = { ...context, filters: { ...context.filters } };
    delete relaxedContext.filters.country;
    relaxedContext.skipExternalFetch = true;
    candidates = await retrieveCandidates(relaxedContext, poolSize);
    filterContext = relaxedContext; // use relaxed filters so we don't filter out the fallback jobs
  }

  let filtered = applyFilters(candidates, filterContext);

  if (agentConfig?.isRemote || student?.jobPreferences?.isRemote) {
    filtered = filtered.filter((j) => !!j.remote);
  }

  const ranked = rankJobsWithIntentBoost(filtered, context);

  const jobs = ranked.slice(0, limit);

  if (process.env.DEBUG_JOBS === '1') {
    const preview = jobs.slice(0, Math.min(20, jobs.length)).map((job) => ({
      id: String(job._id || ''),
      origin: job.origin || 'HOSTED',
      title: job.title,
      company: job.company || '',
      country: job.country || '',
      city: job.location?.city || '',
      type: (job.jobTypes || []).join(','),
      isRemote: !!job.remote,
      rankScore: job.rankScore,
    }));
    console.log('[Recommended Preview]', preview);
  }

  return jobs;
};
