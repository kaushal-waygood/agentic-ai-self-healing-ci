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
import { Job } from '../models/jobs.model.js';
import { runEmailScrape } from '../config/geminiCron.js';

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
          console.log(
            `[Autopilot] ${agent.agentName} daily limit reached (${foundToday}/${agentLimit})`,
          );
        }
        continue;
      }

      if (process.env.DEBUG_AUTOPILOT === '1') {
        console.log(
          `[Autopilot] ${agent.agentName} needs ${remaining} more jobs (${foundToday}/${agentLimit} today)`,
        );
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

      // Fix: parse employmentType if it arrives as a JSON-stringified array
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
        console.log(
          `[Autopilot] agentConfig for ${agent.agentName}:`,
          agentConfig,
        );
      }

      const effectiveStudent = buildEffectiveStudentProfile(
        studentProfile,
        agent,
      );

      // -------- fetch jobs (local first) --------

      // Fix: ensure searchLimit is always large enough to survive filtering
      // even when remaining is small (e.g. remaining=1 → searchLimit at least 40)
      const searchLimit = Math.max(remaining * 10, 40);
      const agentQuery = agent.jobTitle || '';

      let jobs = await getRecommendedJobs({
        studentId,
        agentConfig,
        studentProfile: {
          ...effectiveStudent,
          titles: [agentQuery],
        },
        queryOverride: agentQuery,
        appliedJobIds: [...excludedIds],
        limit: searchLimit,
        skipExternalFetch: true,
        // Fix: always skip cache for autopilot so each cron run
        // gets a fresh pool — not a Redis-cached result from a previous
        // run that had all those jobs already excluded
        skipCacheForAgent: true,
      });

      if (process.env.DEBUG_AUTOPILOT === '1') {
        console.log(
          `[Autopilot] ${agent.agentName} local jobs found: ${jobs.length}`,
        );
      }

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
          queryOverride: agentQuery,
          appliedJobIds: [...excludedIds],
          limit: searchLimit,
          skipExternalFetch: false,
          skipCacheForAgent: true,
        });

        if (process.env.DEBUG_AUTOPILOT === '1') {
          console.log(
            `[Autopilot] ${agent.agentName} fallback (no employmentType) jobs: ${fallbackJobs.length}`,
          );
        }

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
            queryOverride: agentQuery,
            appliedJobIds: [...excludedIds],
            limit: searchLimit,
            skipExternalFetch: false,
            skipCacheForAgent: true,
          });

          if (process.env.DEBUG_AUTOPILOT === '1') {
            console.log(
              `[Autopilot] ${agent.agentName} global fallback jobs: ${globalJobs.length}`,
            );
          }

          fallbackJobs = [...fallbackJobs, ...globalJobs];
        }

        const jobMap = new Map();
        [...jobs, ...fallbackJobs].forEach((j) => {
          const key = String(j._id);
          if (
            !jobMap.has(key) ||
            (j.rankScore || 0) > (jobMap.get(key).rankScore || 0)
          ) {
            jobMap.set(key, j);
          }
        });
        jobs = Array.from(jobMap.values()).sort(
          (a, b) => (b.rankScore || 0) - (a.rankScore || 0),
        );

        if (process.env.DEBUG_AUTOPILOT === '1') {
          console.log(
            `[Autopilot] ${agent.agentName} total after fallback: ${jobs.length}`,
          );
        }
      }

      if (!jobs.length) {
        if (process.env.DEBUG_AUTOPILOT === '1') {
          console.log(`[Autopilot] ${agent.agentName} no jobs found at all`);
        }
        continue;
      }

      // -------- store jobs safely --------

      let stored = 0;

      for (const job of jobs) {
        if (stored >= remaining) break;
        const jobIdStr = String(job._id);
        if (excludedIds.has(jobIdStr)) continue;
        try {
          await AgentFoundJob.create({
            student: studentId,
            agent: agent._id,
            job: job._id,
            foundAt: new Date(),
          });
          excludedIds.add(jobIdStr);
          stored++;
          processed++;

          // 1. Scrape Emails in the background (if missing)
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

          // 2. Generate Draft Application tailored exactly to this job
          const applicationData = buildApplicationData(
            job,
            effectiveStudent,
            agent.finalTouch,
          );
          const newApp = await StudentApplication.create({
            student: studentId,
            job: job._id,
            jobTitle: job.title,
            jobCompany: job.company,
            jobDescription: job.description,
            status: 'Draft',
          });

          // Fire-and-forget generation so the worker loop doesn't timeout natively
          processTailoredApplication(
            studentId,
            newApp._id,
            applicationData,
            null, // no realtime socket.io passed to the script level
            null, // default gemini endpoint
          ).catch((e) =>
            console.error(
              `[Autopilot Generation] Failed for app ${newApp._id}:`,
              e.message,
            ),
          );
        } catch (err) {
          if (err.code !== 11000) {
            console.error('Job insert error:', err.message);
          } else {
            excludedIds.add(jobIdStr);
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
    agentsChecked: activeAgents.length, // Fix: was returning 'studentsChecked' key before
  };
};
