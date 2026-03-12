import mongoose from 'mongoose';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import { User } from '../models/User.model.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
import { AgentFoundJob } from '../models/AgentFoundJob.js';
import { getRecommendedJobs } from '../utils/getRecommendedJobs.js';
import { buildEffectiveStudentProfile } from '../utils/profileHydration.js';
import { buildJobContextString } from '../utils/jobContext.js';
import { processTailoredApplication } from '../utils/tailored.autopilot.js';

export const toBool = (v) => v === true || String(v).toLowerCase() === 'true';
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
export const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};
export const normalizeLimit = (v, fallback, { min = 0, max = 200 } = {}) =>
  clamp(toInt(v, fallback), min, max);

export const buildApplicationData = (
  job,
  effectiveStudent,
  finalTouch = '',
) => {
  return {
    job: {
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      country: job.country || '',
      location: {
        city: job.location?.city || '',
        state: job.location?.state || '',
      },
      isRemote: !!(job.remote ?? job.isRemote),
      jobTypes: Array.isArray(job.jobTypes) ? job.jobTypes : [],
      qualifications: Array.isArray(job.qualifications)
        ? job.qualifications
        : [],
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities
        : [],
      tags: Array.isArray(job.tags) ? job.tags : [],
      applyMethod: job.applyMethod || {},
      salary: job.salary || null,
      jobContextString: buildJobContextString(job),
    },
    candidate: JSON.stringify(effectiveStudent),
    coverLetter: '',
    preferences: finalTouch,
  };
};

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

export const findAndProcessJobs = async () => {
  const activeAgents = await StudentAgent.find({
    isAgentActive: true,
    status: 'completed',
  })
    .select(
      'student agentName jobTitle agentDailyLimit employmentType country isRemote',
    )
    .lean();

  if (!activeAgents.length) {
    return { processed: 0, agentsChecked: 0 };
  }

  let processed = 0;

  for (const agent of activeAgents) {
    const studentId = new mongoose.Types.ObjectId(agent.student);

    try {
      const studentProfile = await getStudentProfileSnapshot(studentId);
      if (!studentProfile) continue;

      if (studentProfile.settings?.autopilotEnabled === false) continue;

      // -------- daily limit --------

      const agentLimit = normalizeLimit(agent.agentDailyLimit, 5, {
        min: 1,
        max: 50,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const foundToday = await AgentFoundJob.countDocuments({
        student: studentId,
        agent: agent._id,
        foundAt: { $gte: today },
      });

      const remaining = Math.max(0, agentLimit - foundToday);

      if (remaining === 0) {
        if (process.env.DEBUG_AUTOPILOT === '1') {
          console.log(`[Autopilot] ${agent.agentName} limit reached`);
        }
        continue;
      }

      // -------- build exclusion set --------

      const [applied, pending, discovered] = await Promise.all([
        AppliedJob.find({ student: studentId }).select('job').lean(),
        StudentApplication.find({ student: studentId }).select('job').lean(),
        AgentFoundJob.find({ student: studentId }).select('job').lean(),
      ]);

      const excludedIds = new Set([
        ...applied.map((x) => String(x.job)),
        ...pending.map((x) => String(x.job)),
        ...discovered.map((x) => String(x.job)),
      ]);

      // -------- agent config --------

      const agentConfig = {
        jobTitle: agent.jobTitle,
        country: agent.country,
        isRemote: agent.isRemote,
        employmentType: agent.employmentType,
      };

      const effectiveStudent = buildEffectiveStudentProfile(
        studentProfile,
        agent,
      );

      // -------- fetch jobs (local first) --------

      const searchLimit = remaining * 4;

      let jobs = await getRecommendedJobs({
        studentId,
        agentConfig,
        studentProfile: effectiveStudent,
        appliedJobIds: [...excludedIds],
        limit: searchLimit,
        skipExternalFetch: true,
        skipCacheForAgent: true,
      });

      // -------- fallback to RapidAPI --------

      if (jobs.length < remaining) {
        // Relax filters: remove employment type
        const relaxedConfig = {
          ...agentConfig,
          employmentType: undefined,
        };

        let fallbackJobs = await getRecommendedJobs({
          studentId,
          agentConfig: relaxedConfig,
          studentProfile: effectiveStudent,
          appliedJobIds: [...excludedIds],
          limit: searchLimit,
          skipExternalFetch: false,
        });

        // If still small, remove country restriction
        if (fallbackJobs.length < remaining) {
          const globalConfig = {
            ...relaxedConfig,
            country: undefined,
          };

          const globalJobs = await getRecommendedJobs({
            studentId,
            agentConfig: globalConfig,
            studentProfile: effectiveStudent,
            appliedJobIds: [...excludedIds],
            limit: searchLimit,
            skipExternalFetch: false,
          });

          fallbackJobs = [...fallbackJobs, ...globalJobs];
        }

        const jobMap = new Map();

        [...jobs, ...fallbackJobs].forEach((j) => {
          jobMap.set(String(j._id), j);
        });

        jobs = Array.from(jobMap.values());
        jobs.sort(() => Math.random() - 0.5);
      }

      if (!jobs.length) continue;

      // -------- store jobs safely --------

      let stored = 0;

      for (const job of jobs) {
        if (stored >= remaining) break;

        if (excludedIds.has(String(job._id))) continue;

        try {
          await AgentFoundJob.create({
            student: studentId,
            agent: agent._id,
            job: job._id,
            foundAt: new Date(),
          });

          stored++;
          processed++;
        } catch (err) {
          // ignore duplicate index errors
          if (err.code !== 11000) {
            console.error('Job insert error:', err.message);
          }
        }
      }

      if (process.env.DEBUG_AUTOPILOT === '1') {
        console.log(
          `[Autopilot] ${agent.agentName} stored ${stored}/${remaining}`,
        );
      }
    } catch (err) {
      console.error(`Autopilot agent failed (${agent.agentName})`, err.message);
    }
  }

  return {
    processed,
    agentsChecked: activeAgents.length,
  };
};
