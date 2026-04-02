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
import { sanitizeCountry, sanitizeEmploymentType } from './profileHydration.js';

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const shouldDebugJobs = () =>
  process.env.DEBUG_JOBS === '1' || process.env.DEBUG_AUTOPILOT === '1';

function cloneContextWithRelaxedFilters(
  context,
  {
    dropCountry = false,
    dropState = false,
    dropCity = false,
    dropEmploymentType = false,
    dropQueryOverride = false,
  } = {},
) {
  const filters = { ...(context.filters || {}) };

  if (dropCountry) delete filters.country;
  if (dropState) delete filters.state;
  if (dropCity) delete filters.city;
  if (dropEmploymentType) delete filters.employmentType;

  const nextContext = {
    ...context,
    filters,
  };

  if (dropQueryOverride) {
    nextContext.queryOverride = null;
  }

  return nextContext;
}

function buildRecommendationRelaxationStages(context) {
  const stages = [];
  const seen = new Set();

  const pushStage = (label, options = {}) => {
    const stageContext = cloneContextWithRelaxedFilters(context, options);
    const signature = JSON.stringify({
      queryOverride: stageContext.queryOverride || null,
      country: stageContext.filters?.country || null,
      state: stageContext.filters?.state || null,
      city: stageContext.filters?.city || null,
      employmentType: stageContext.filters?.employmentType || null,
    });

    if (seen.has(signature)) return;
    seen.add(signature);
    stages.push({ label, context: stageContext });
  };

  pushStage('titleRelaxed', { dropQueryOverride: true });
  pushStage('locationRelaxed', { dropState: true, dropCity: true });
  pushStage('titleLocationRelaxed', {
    dropQueryOverride: true,
    dropState: true,
    dropCity: true,
  });
  pushStage('employmentTypeRelaxed', { dropEmploymentType: true });
  pushStage('titleEmploymentTypeRelaxed', {
    dropQueryOverride: true,
    dropEmploymentType: true,
  });
  pushStage('countryRelaxed', {
    dropCountry: true,
    dropState: true,
    dropCity: true,
  });
  pushStage('titleCountryRelaxed', {
    dropQueryOverride: true,
    dropCountry: true,
    dropState: true,
    dropCity: true,
  });
  pushStage('employmentTypeCountryRelaxed', {
    dropEmploymentType: true,
    dropCountry: true,
    dropState: true,
    dropCity: true,
  });
  pushStage('broadFallback', {
    dropQueryOverride: true,
    dropEmploymentType: true,
    dropCountry: true,
    dropState: true,
    dropCity: true,
  });

  return stages;
}

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

function buildSearchQuery(student, agentConfig, queryOverride) {
  if (queryOverride) return queryOverride;
  const parts = [];
  const role = agentConfig?.jobTitle || student?.jobRole;
  if (role) parts.push(String(role));
  const profile = extractProfileFromStudent(student);
  parts.push(profile.titles.join(' '), profile.skills.join(' '));
  return parts.filter(Boolean).join(' ').trim() || 'Software Engineer';
}

function buildRecommendationContext(
  studentId,
  studentProfile,
  agentConfig,
  appliedJobIds,
  queryOverride,
) {
  const profile = extractProfileFromStudent(studentProfile);
  const query = buildSearchQuery(studentProfile, agentConfig, queryOverride);

  const filters = {};

  // ── Country ──────────────────────────────────────────────────────────────
  // sanitizeCountry already returns uppercase ISO-2 in every code path,
  // so no extra .toUpperCase() needed. Guard with a truthiness check so the
  // key is never set to undefined (which some filter impls treat differently
  // from the key being absent).
  const rawCountry =
    agentConfig?.country ||
    studentProfile?.jobPreferences?.preferredCountries?.[0];
  if (rawCountry) {
    const normalizedCountry = sanitizeCountry(String(rawCountry).trim());
    if (normalizedCountry) filters.country = normalizedCountry;
  }

  if (agentConfig?.state) filters.state = String(agentConfig.state).trim();
  if (agentConfig?.city) filters.city = String(agentConfig.city).trim();

  // ── Employment type ───────────────────────────────────────────────────────
  // Always run through sanitizeEmploymentType so arrays, mixed-case strings,
  // and legacy "full-time" values all normalise to "FULL_TIME" / "PART_TIME"
  // before reaching applyFilters.
  if (agentConfig?.employmentType) {
    const sanitized = sanitizeEmploymentType(agentConfig.employmentType);
    if (sanitized) filters.employmentType = sanitized;
  } else if (studentProfile?.jobPreferences?.preferredJobTypes?.length) {
    filters.employmentType =
      studentProfile.jobPreferences.preferredJobTypes.join(',');
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
    queryOverride: queryOverride || null,
  };
}

export const getRecommendedJobs = async ({
  studentId,
  agentConfig = {},
  studentProfile,
  appliedJobIds = [],
  limit = 50,
  skipExternalFetch = false,
  includeAppliedInResults = false,
  queryOverride,
  skipCacheForAgent = false,
  skipQueryOverrideFallback = false,
}) => {
  const student = studentProfile || (await Student.findById(studentId).lean());
  if (!student) throw new Error('Student not found');

  const poolSize = Math.max(limit * 4, 200);
  const context = buildRecommendationContext(
    studentId,
    student,
    agentConfig,
    appliedJobIds,
    queryOverride,
  );
  context.skipExternalFetch = skipExternalFetch;
  context.includeAppliedInResults = includeAppliedInResults;
  // ── Fix: use the passed-in value, not includeAppliedInResults ────────────
  context.skipCacheForAgent = skipCacheForAgent;

  // ── Fix: additive override — keeps existing profile titles and skills ─────
  // Previously this replaced context.profile.titles with [queryOverride] only,
  // stripping all skill-based ranking signals from the student profile.
  if (queryOverride) {
    context.query = queryOverride;
    context.profile.titles = normalizeSet([
      queryOverride,
      ...context.profile.titles,
    ]);
  }

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
  let appliedFilterStage = 'strict';

  // When autopilot gets 0 local jobs, retry with relaxed country filter
  if (
    skipExternalFetch &&
    candidates.length === 0 &&
    context.filters?.country
  ) {
    const relaxedContext = { ...context, filters: { ...context.filters } };
    delete relaxedContext.filters.country;
    relaxedContext.skipExternalFetch = true;
    candidates = await retrieveCandidates(relaxedContext, poolSize);
    filterContext = relaxedContext;
  }

  const strictFiltered = applyFilters(candidates, filterContext);
  let filtered = strictFiltered;
  const relaxationDebug = [
    {
      stage: 'strict',
      count: strictFiltered.length,
      queryOverride: filterContext.queryOverride,
      filters: filterContext.filters,
    },
  ];

  if (
    !filtered.length &&
    candidates.length > 0 &&
    filterContext.type === 'recommendation'
  ) {
    const relaxationStages = buildRecommendationRelaxationStages(filterContext);

    for (const stage of relaxationStages) {
      const stageFiltered = applyFilters(candidates, stage.context);
      relaxationDebug.push({
        stage: stage.label,
        count: stageFiltered.length,
        queryOverride: stage.context.queryOverride,
        filters: stage.context.filters,
      });

      if (stageFiltered.length > 0) {
        filtered = stageFiltered;
        filterContext = stage.context;
        appliedFilterStage = stage.label;
        break;
      }
    }
  }

  // if (shouldDebugJobs() && candidates.length > 0) {
  //   console.log('[DEBUG_JOBS] Agent filter summary:', {
  //     query: context.query,
  //     queryOverride: context.queryOverride,
  //     candidates: candidates.length,
  //     stages: relaxationDebug.map((entry) => ({
  //       stage: entry.stage,
  //       count: entry.count,
  //       queryOverride: entry.queryOverride,
  //       filters: entry.filters,
  //     })),
  //     chosenStage: appliedFilterStage,
  //   });
  // }

  if (
    !filtered.length &&
    candidates.length > 0 &&
    filterContext.queryOverride
  ) {
    const relaxedTitleContext = {
      ...filterContext,
      queryOverride: null,
    };
    const titleRelaxed = applyFilters(candidates, relaxedTitleContext);

    if (titleRelaxed.length > 0) {
      filtered = titleRelaxed;
      filterContext = relaxedTitleContext;
      appliedFilterStage = `${appliedFilterStage}:titleRelaxedFinal`;
    }
  }

  // Remote filter: prefer remote jobs but don't drop all results if none match
  const prefersRemote =
    agentConfig?.isRemote || student?.jobPreferences?.isRemote;
  if (prefersRemote) {
    const remoteOnly = filtered.filter((j) => !!j.remote);
    filtered = remoteOnly.length > 0 ? remoteOnly : filtered;
  }

  // If still no results and we haven't tried broader queries, add fallback strategies
  if (!filtered.length && candidates.length === 0 && !skipExternalFetch) {
    if (shouldDebugJobs()) {
      console.log(
        '[DEBUG_JOBS] No local candidates found, trying broader external search',
      );
    }

    const profileData = context.profile || { skills: [], titles: [] };

    // Try with a more generic query based on profile titles/skills
    const broaderContext = {
      ...context,
      query:
        profileData.skills && profileData.skills.length > 0
          ? profileData.skills.slice(0, 5).join(' ')
          : (profileData.titles && profileData.titles[0]) ||
            'Software Engineer',
      filters: {
        ...context.filters,
        employmentType: undefined, // Remove employment type filter
      },
      skipCacheForAgent: true,
    };

    candidates = await retrieveCandidates(broaderContext, poolSize);
    filtered = applyFilters(candidates, broaderContext);
  }

  const ranked = rankJobsWithIntentBoost(filtered, context);
  const jobs = ranked.slice(0, limit);

  if (shouldDebugJobs()) {
    // console.log('[DEBUG_JOBS] Recommendation summary:', {
    //   query: context.query,
    //   queryOverride: context.queryOverride,
    //   filters: filterContext.filters,
    //   candidates: candidates.length,
    //   strictFiltered: strictFiltered.length,
    //   appliedFilterStage,
    //   finalFiltered: filtered.length,
    //   remotePreferred: !!prefersRemote,
    //   finalJobs: jobs.length,
    // });

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
    // console.log(`[DEBUG_JOBS] Top ${preview.length} jobs:`, preview);
  }

  if (!jobs.length && queryOverride && !skipQueryOverrideFallback) {
    if (shouldDebugJobs()) {
      // console.log('[DEBUG_JOBS] Retrying with profile-derived query:', {
      //   failedQueryOverride: queryOverride,
      //   filters: filterContext.filters,
      // });
    }

    return getRecommendedJobs({
      studentId,
      agentConfig: { ...agentConfig, jobTitle: undefined },
      studentProfile: student,
      appliedJobIds,
      limit,
      skipExternalFetch,
      includeAppliedInResults,
      queryOverride: null,
      skipCacheForAgent,
      skipQueryOverrideFallback: true,
    });
  }

  return jobs;
};
