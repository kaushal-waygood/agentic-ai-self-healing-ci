import mongoose from 'mongoose';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import { User } from '../models/User.model.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
import { AgentFoundJob } from '../models/AgentFoundJob.js';
import { getRecommendedJobs } from '../utils/getRecommendedJobs.js';
import { buildEffectiveStudentProfile } from '../utils/profileHydration.js';
import { Job } from '../models/jobs.model.js';
import { runEmailScrape } from '../config/geminiCron.js';
import {
  AUTOPILOT_AGENT_JOB_LIMITS,
  getAutopilotEntitlements,
} from '../utils/credits.js';
import { initiateTailoredJobGeneration } from '../utils/tailoredJobs.js';

export const toBool = (v) => v === true || String(v).toLowerCase() === 'true';
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
export const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};
export const normalizeLimit = (v, fallback, { min = 0, max = 200 } = {}) =>
  clamp(toInt(v, fallback), min, max);
const isSameOrAfter = (date, floor) => {
  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) && timestamp >= floor.getTime();
};
const activeFoundJobFilter = () => ({
  $or: [{ status: 'ACTIVE' }, { status: { $exists: false } }],
});
const rankScoreOf = (job) =>
  Number.isFinite(job?.rankScore) ? Number(job.rankScore) : 0;
const mergeCandidateJobs = (jobMap, jobs, excludedIds) => {
  for (const job of jobs || []) {
    const key = String(job?._id || '');
    if (!key || excludedIds.has(key)) continue;
    const existing = jobMap.get(key);
    if (!existing || rankScoreOf(job) > rankScoreOf(existing)) {
      jobMap.set(key, job);
    }
  }
};
const agentDiscoveryLocks = new Set();
const getAgentDiscoveryLockKey = (agent) =>
  String(agent?._id || agent?.agentId || '');
const toJobIdString = (value) => {
  if (!value) return null;
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    if (value.job) {
      return toJobIdString(value.job);
    }
    if (value.jobId) {
      return toJobIdString(value.jobId);
    }
    if (value._id) {
      return toJobIdString(value._id);
    }
  }

  return null;
};
const collectJobIds = (items) =>
  (items || [])
    .map((item) => toJobIdString(item))
    .filter(Boolean);

export const runWithConcurrency = async (items, handler, concurrency = 3) => {
  const queue = [...items];
  const runners = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      for (;;) {
        const next = queue.shift();
        if (!next) break;
        await handler(next);
      }
    },
  );
  await Promise.allSettled(runners);
};

export const processAgentDiscovery = async (
  agent,
  { force = false, requestedSlots = null, planEntitlements = null } = {},
) => {
  const lockKey = getAgentDiscoveryLockKey(agent);
  if (lockKey && agentDiscoveryLocks.has(lockKey)) {
    if (process.env.DEBUG_AUTOPILOT === '1') {
      console.log(
        `[Autopilot] ${agent.agentName || lockKey} discovery already in progress; skipping overlap`,
      );
    }
    return { processed: 0, reason: 'discoveryInProgress' };
  }

  if (lockKey) {
    agentDiscoveryLocks.add(lockKey);
  }

  try {
    const studentId = new mongoose.Types.ObjectId(agent.student);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entitlements =
      planEntitlements || (await getAutopilotEntitlements(studentId));

    const studentProfile = await getStudentProfileSnapshot(studentId);
    if (!studentProfile) {
      return { processed: 0, reason: 'missingProfile' };
    }

    if (studentProfile.settings?.autopilotEnabled === false) {
      return { processed: 0, reason: 'autopilotDisabled' };
    }

    const agentLimit = normalizeLimit(
      entitlements.dailyJobLimit,
      AUTOPILOT_AGENT_JOB_LIMITS.DEFAULT,
      {
        min: 1,
        max: AUTOPILOT_AGENT_JOB_LIMITS.MAX,
      },
    );

    const activeFoundCount = await AgentFoundJob.countDocuments({
      student: studentId,
      agent: agent._id,
      ...activeFoundJobFilter(),
    });

    const remainingCapacity = Math.max(0, agentLimit - activeFoundCount);
    const remaining = Math.max(
      0,
      requestedSlots == null
        ? remainingCapacity
        : Math.min(requestedSlots, remainingCapacity),
    );

    if (remaining === 0) {
      return { processed: 0, reason: 'poolAlreadyFull' };
    }

    const searchedToday =
      !force && isSameOrAfter(agent.lastDiscoveryRunAt, today);
    if (searchedToday && process.env.DEBUG_AUTOPILOT === '1') {
      console.log(
        `[Autopilot] ${agent.agentName} is still under target at ${activeFoundCount}/${agentLimit}; retrying same-day discovery`,
      );
    }

    if (process.env.DEBUG_AUTOPILOT === '1') {
      console.log(
        `[Autopilot] ${agent.agentName} has ${activeFoundCount}/${agentLimit} active jobs and needs ${remaining} more`,
      );
    }

    const [applied, pendingTailored, pendingLegacy, discovered] = await Promise.all([
      AppliedJob.find({ student: studentId }).select('job').lean(),
      StudentTailoredApplication.find({
        student: studentId,
        flag: 'agent',
      })
        .select('jobId')
        .lean(),
      StudentApplication.find({ student: studentId }).select('job').lean(),
      AgentFoundJob.find({ student: studentId }).select('job').lean(),
    ]);

    const excludedIds = new Set([
      ...collectJobIds(studentProfile?.savedJobs),
      ...collectJobIds(studentProfile?.visitedJobs),
      ...collectJobIds(studentProfile?.viewedJobs),
      ...collectJobIds(studentProfile?.appliedJobs),
      ...applied.map((x) => String(x.job)),
      ...pendingTailored.map((x) => String(x.jobId)),
      ...pendingLegacy.map((x) => String(x.job)),
      ...discovered.map((x) => String(x.job)),
    ]);

    let employmentType = agent.employmentType;
    if (
      typeof employmentType === 'string' &&
      employmentType.trim().startsWith('[')
    ) {
      try {
        const parsed = JSON.parse(employmentType);
        employmentType = Array.isArray(parsed)
          ? parsed.join(',')
          : employmentType;
      } catch {
        // leave as-is if parse fails
      }
    }

    const agentConfig = {
      jobTitle: agent.jobTitle,
      country: agent.country,
      isRemote: agent.isRemote,
      employmentType,
    };

    if (process.env.DEBUG_AUTOPILOT === '1') {
      console.log(`[Autopilot] agentConfig for ${agent.agentName}:`, agentConfig);
    }

    const effectiveStudent = buildEffectiveStudentProfile(studentProfile, agent);
    const searchLimit = Math.max(remaining * 10, 40);
    const agentQuery = agent.jobTitle || '';
    const relaxedConfig = {
      ...agentConfig,
      employmentType: undefined,
    };
    const globalConfig = {
      ...relaxedConfig,
      country: undefined,
    };
    const exactStudentProfile = {
      ...effectiveStudent,
      titles: [agentQuery],
    };

    // Extract skills for fallback queries
    const skills = effectiveStudent?.skills || [];
    const skillBasedQuery =
      skills.length > 0
        ? skills.slice(0, 5).join(' ')
        : agentQuery || 'Software Engineer';

    const searchStrategies = [
    {
      label: 'local-exact',
      agentConfig,
      studentProfile: exactStudentProfile,
      queryOverride: agentQuery,
      skipExternalFetch: true,
    },
    {
      label: 'external-exact',
      agentConfig,
      studentProfile: exactStudentProfile,
      queryOverride: agentQuery,
      skipExternalFetch: false,
    },
    {
      label: 'external-no-employment-type',
      agentConfig: relaxedConfig,
      studentProfile: effectiveStudent,
      queryOverride: agentQuery,
      skipExternalFetch: false,
    },
    {
      label: 'external-no-country',
      agentConfig: globalConfig,
      studentProfile: effectiveStudent,
      queryOverride: agentQuery,
      skipExternalFetch: false,
    },
    {
      label: 'profile-query',
      agentConfig,
      studentProfile: effectiveStudent,
      queryOverride: null,
      skipExternalFetch: false,
    },
    {
      label: 'profile-query-no-employment-type',
      agentConfig: relaxedConfig,
      studentProfile: effectiveStudent,
      queryOverride: null,
      skipExternalFetch: false,
    },
    {
      label: 'profile-query-no-country',
      agentConfig: globalConfig,
      studentProfile: effectiveStudent,
      queryOverride: null,
      skipExternalFetch: false,
    },
    // Aggressive fallback: skills-based query with no country restriction
    {
      label: 'skill-based-global',
      agentConfig: {
        jobTitle: undefined,
        country: undefined,
        isRemote: undefined,
        employmentType: undefined,
      },
      studentProfile: effectiveStudent,
      queryOverride: skillBasedQuery,
      skipExternalFetch: false,
    },
    // Fallback: Try US market (largest job market) if agent's country fails
    ...(agent.country && agent.country.toUpperCase() !== 'US'
      ? [
          {
            label: 'fallback-us',
            agentConfig: {
              ...agentConfig,
              country: 'US',
            },
            studentProfile: effectiveStudent,
            queryOverride: agentQuery || skillBasedQuery,
            skipExternalFetch: false,
          },
        ]
      : []),
    // Fallback: Try generic job title search if specific title fails
    // Use skills as query if available, otherwise use a generic fallback
    ...(agentQuery && agentQuery.length > 3
      ? [
          {
            label: 'generic-title-fallback',
            agentConfig: {
              jobTitle: undefined,
              country: undefined,
              isRemote: undefined,
              employmentType: undefined,
            },
            studentProfile: effectiveStudent,
            queryOverride: skillBasedQuery || 'Developer',
            skipExternalFetch: false,
          },
        ]
      : []),
    ];
    const jobsById = new Map();

    for (const strategy of searchStrategies) {
      if (jobsById.size >= remaining) break;
      const strategyJobs = await getRecommendedJobs({
        studentId,
        agentConfig: strategy.agentConfig,
        studentProfile: strategy.studentProfile,
        queryOverride: strategy.queryOverride,
        appliedJobIds: [...excludedIds, ...jobsById.keys()],
        limit: searchLimit,
        skipExternalFetch: strategy.skipExternalFetch,
        skipCacheForAgent: true,
      });
      mergeCandidateJobs(jobsById, strategyJobs, excludedIds);

      if (process.env.DEBUG_AUTOPILOT === '1') {
        console.log(
          `[Autopilot] ${agent.agentName} ${strategy.label} produced ${strategyJobs.length} jobs (${jobsById.size}/${remaining} unique collected)`,
        );
      }
    }

    const jobs = Array.from(jobsById.values()).sort(
      (a, b) => rankScoreOf(b) - rankScoreOf(a),
    );

    if (!jobs.length) {
      await StudentAgent.updateOne(
        { _id: agent._id },
        {
          $set: {
            lastDiscoveryRunAt: new Date(),
            lastDiscoveryActiveCount: activeFoundCount,
            lastDiscoveryTargetLimit: agentLimit,
          },
        },
      );

      const debugInfo = {
        agentName: agent.agentName,
        jobTitle: agent.jobTitle,
        country: agent.country,
        isRemote: agent.isRemote,
        employmentType: agent.employmentType,
        effectiveStudentTitles: effectiveStudent?.titles || [],
        effectiveStudentSkills: effectiveStudent?.skills || [],
        excludedJobCount: excludedIds.size,
        remaining,
      };

      if (process.env.DEBUG_AUTOPILOT === '1') {
        console.log(`[Autopilot] ${agent.agentName} no jobs found at all`);
        console.log(
          '[Autopilot] Debug info:',
          JSON.stringify(debugInfo, null, 2),
        );
      } else {
        console.log(
          `[Autopilot] ⚠️ ${agent.agentName} - No jobs found. JobTitle: "${agent.jobTitle}", Country: "${agent.country}", Skills: ${(effectiveStudent?.skills || []).slice(0, 3).join(', ')}`,
        );
      }
      return { processed: 0, reason: 'noJobsFound', debug: debugInfo };
    }

    let stored = 0;

    for (const job of jobs) {
      if (stored >= remaining) break;
      const jobIdStr = String(job._id);
      if (excludedIds.has(jobIdStr)) continue;
      try {
        const currentActiveCount = activeFoundCount + stored;
        if (currentActiveCount >= agentLimit) {
          if (process.env.DEBUG_AUTOPILOT === '1') {
            console.log(
              `[Autopilot] ${agent.agentName} reached cap during insert loop at ${currentActiveCount}/${agentLimit}`,
            );
          }
          break;
        }

        await AgentFoundJob.create({
          student: studentId,
          agent: agent._id,
          job: job._id,
          status: 'ACTIVE',
          foundAt: new Date(),
        });
        excludedIds.add(jobIdStr);
        stored++;

        if (!job.scrapedEmails || job.scrapedEmails.length === 0) {
          if (job.company) {
            const locationStr = [
              job.location?.city,
              job.location?.state,
              job.country,
            ]
              .filter(Boolean)
              .join(', ');
            runEmailScrape(job.company, locationStr)
              .then((res) => {
                if (res?.allFoundDetails?.length > 0) {
                  Job.updateOne(
                    { _id: job._id },
                    { $set: { scrapedEmails: res.allFoundDetails } },
                  ).catch(console.error);
                }
              })
              .catch((e) =>
                console.error(
                  `[Autopilot Scrape] Failed for ${job.company}:`,
                  e.message,
                ),
              );
          }
        }

        const generation = await initiateTailoredJobGeneration({
          studentId,
          agentIdParam: agent._id,
          jobId: job._id,
        });

        if (!generation?.success) {
          console.error(
            `[Autopilot] Failed to auto-start tailored docs for agent=${agent.agentId} job=${job._id}: ${generation?.message || 'Unknown error'}`,
          );
        }
      } catch (err) {
        if (err.code !== 11000) {
          console.error('Job insert error:', err.message);
        } else {
          excludedIds.add(jobIdStr);
        }
      }
    }

    if (process.env.DEBUG_AUTOPILOT === '1') {
      console.log(`[Autopilot] ${agent.agentName} stored ${stored}/${remaining}`);
    }

    await StudentAgent.updateOne(
      { _id: agent._id },
      {
        $set: {
          lastDiscoveryRunAt: new Date(),
          lastDiscoveryActiveCount: activeFoundCount + stored,
          lastDiscoveryTargetLimit: agentLimit,
        },
      },
    );

    return { processed: stored, reason: stored > 0 ? null : 'noJobsFound' };
  } finally {
    if (lockKey) {
      agentDiscoveryLocks.delete(lockKey);
    }
  }
};

export const findAndProcessJobs = async () => {
  const activeAgents = await StudentAgent.find({
    isAgentActive: true,
    status: 'completed',
  })
    .select(
      'student agentName jobTitle agentDailyLimit employmentType country isRemote lastDiscoveryRunAt lastDiscoveryActiveCount lastDiscoveryTargetLimit createdAt',
    )
    .lean();
  activeAgents.sort(
    (a, b) =>
      new Date(a.createdAt || 0).getTime() -
      new Date(b.createdAt || 0).getTime(),
  );

  if (!activeAgents.length) {
    return {
      processed: 0,
      agentsChecked: 0,
      alreadySearchedToday: 0,
      poolAlreadyFull: 0,
      planAgentCapReached: 0,
      autopilotDisabled: 0,
      missingProfile: 0,
      noJobsFound: 0,
    };
  }

  const activeAgentIds = activeAgents.map((agent) => agent._id).filter(Boolean);
  const activeCountsRaw =
    activeAgentIds.length > 0
      ? await AgentFoundJob.aggregate([
          {
            $match: {
              agent: { $in: activeAgentIds },
              ...activeFoundJobFilter(),
            },
          },
          {
            $group: {
              _id: '$agent',
              count: { $sum: 1 },
            },
          },
        ])
      : [];
  const activeCountByAgent = new Map(
    activeCountsRaw.map((row) => [String(row._id), Number(row.count) || 0]),
  );

  const studentConcurrency = normalizeLimit(
    process.env.AUTOPILOT_STUDENT_CONCURRENCY,
    8,
    { min: 1, max: 50 },
  );
  const groupedAgents = new Map();

  for (const agent of activeAgents) {
    const studentKey = String(agent.student);
    const existing = groupedAgents.get(studentKey);
    if (existing) {
      existing.push(agent);
    } else {
      groupedAgents.set(studentKey, [agent]);
    }
  }

  const studentBatches = Array.from(groupedAgents.values());
  const summaries = [];

  await runWithConcurrency(
    studentBatches,
    async (studentAgents) => {
      const summary = {
        processed: 0,
        alreadySearchedToday: 0,
        poolAlreadyFull: 0,
        planAgentCapReached: 0,
        autopilotDisabled: 0,
        missingProfile: 0,
        noJobsFound: 0,
      };

      if (!studentAgents.length) {
        summaries.push(summary);
        return;
      }

      let entitlements = null;
      try {
        entitlements = await getAutopilotEntitlements(studentAgents[0].student);
      } catch (err) {
        console.error(
          `[Autopilot] Failed to load entitlements for student ${studentAgents[0].student}:`,
          err.message,
        );
        summaries.push(summary);
        return;
      }

      for (let index = 0; index < studentAgents.length; index++) {
        const agent = studentAgents[index];

        try {
          if (
            Number.isFinite(entitlements.maxAgents) &&
            index >= entitlements.maxAgents
          ) {
            summary.planAgentCapReached++;
            continue;
          }

          const strictAgentLimit = normalizeLimit(
            entitlements.dailyJobLimit,
            AUTOPILOT_AGENT_JOB_LIMITS.DEFAULT,
            { min: 1, max: AUTOPILOT_AGENT_JOB_LIMITS.MAX },
          );
          const strictActiveCount =
            activeCountByAgent.get(String(agent._id)) || 0;

          if (strictActiveCount >= strictAgentLimit) {
            summary.poolAlreadyFull++;

            await StudentAgent.updateOne(
              { _id: agent._id },
              {
                $set: {
                  lastDiscoveryRunAt: new Date(),
                  lastDiscoveryActiveCount: strictActiveCount,
                  lastDiscoveryTargetLimit: strictAgentLimit,
                },
              },
            ).catch(() => {});

            if (process.env.DEBUG_AUTOPILOT === '1') {
              console.log(
                `[Autopilot] ${agent.agentName} already full at ${strictActiveCount}/${strictAgentLimit}; skipping discovery`,
              );
            }
            continue;
          }

          const result = await processAgentDiscovery(agent, {
            planEntitlements: entitlements,
          });

          summary.processed += result.processed || 0;

          switch (result.reason) {
            case 'alreadySearchedToday':
              summary.alreadySearchedToday++;
              break;
            case 'poolAlreadyFull':
              summary.poolAlreadyFull++;
              break;
            case 'planAgentCapReached':
              summary.planAgentCapReached++;
              break;
            case 'autopilotDisabled':
              summary.autopilotDisabled++;
              break;
            case 'missingProfile':
              summary.missingProfile++;
              break;
            case 'noJobsFound':
              summary.noJobsFound++;
              break;
            default:
              break;
          }
        } catch (err) {
          console.error(
            `Autopilot agent failed (${agent.agentName})`,
            err.message,
          );
        }
      }

      summaries.push(summary);
    },
    studentConcurrency,
  );

  const totals = summaries.reduce(
    (acc, summary) => ({
      processed: acc.processed + summary.processed,
      alreadySearchedToday:
        acc.alreadySearchedToday + summary.alreadySearchedToday,
      poolAlreadyFull: acc.poolAlreadyFull + summary.poolAlreadyFull,
      planAgentCapReached:
        acc.planAgentCapReached + summary.planAgentCapReached,
      autopilotDisabled: acc.autopilotDisabled + summary.autopilotDisabled,
      missingProfile: acc.missingProfile + summary.missingProfile,
      noJobsFound: acc.noJobsFound + summary.noJobsFound,
    }),
    {
      processed: 0,
      alreadySearchedToday: 0,
      poolAlreadyFull: 0,
      planAgentCapReached: 0,
      autopilotDisabled: 0,
      missingProfile: 0,
      noJobsFound: 0,
    },
  );

  return {
    processed: totals.processed,
    agentsChecked: activeAgents.length,
    alreadySearchedToday: totals.alreadySearchedToday,
    poolAlreadyFull: totals.poolAlreadyFull,
    planAgentCapReached: totals.planAgentCapReached,
    autopilotDisabled: totals.autopilotDisabled,
    missingProfile: totals.missingProfile,
    noJobsFound: totals.noJobsFound,
  };
};
