import mongoose from 'mongoose';
import { StudentAgent } from '../models/students/studentAgent.model.js';
import { getStudentProfileSnapshot } from '../services/getStudentProfileSnapshot.js';
import { User } from '../models/User.model.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
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
      'student agentId agentName jobTitle agentDailyLimit uploadedCVData employmentType country isRemote',
    )
    .lean();

  if (!activeAgents?.length) {
    return { processed: 0, reason: 'no_active_agents' };
  }

  const agentsByStudent = new Map();
  for (const agent of activeAgents) {
    const sid = agent.student?.toString();
    if (!sid) continue;
    if (!agentsByStudent.has(sid)) agentsByStudent.set(sid, []);
    agentsByStudent.get(sid).push(agent);
  }

  let totalProcessed = 0;
  const totalStudents = agentsByStudent.size;

  for (const [studentIdStr, agents] of agentsByStudent) {
    const studentId = new mongoose.Types.ObjectId(studentIdStr);

    const user = await User.findById(studentId)
      .select('usageLimits usageCounters')
      .lean();

    const userPlanLimit = user?.usageLimits?.aiAutoApplyDailyLimit || 0;
    const userUsageCount = user?.usageCounters?.aiAutoApplyDailyLimit || 0;

    const studentProfile = await getStudentProfileSnapshot(studentId);
    if (!studentProfile) continue;

    if (studentProfile.settings?.autopilotEnabled === false) continue;

    const studentPrefLimit = normalizeLimit(
      studentProfile?.settings?.autopilotLimit,
      5,
      { min: 0, max: 200 },
    );

    const effectiveMaxLimit = Math.min(userPlanLimit, studentPrefLimit);
    let remainingForStudent = Math.max(0, effectiveMaxLimit - userUsageCount);

    if (remainingForStudent <= 0) continue;

    for (const agent of agents) {
      if (remainingForStudent <= 0) break;

      try {
        const [appliedJobs, pendingApplications] = await Promise.all([
          AppliedJob.find({ student: studentId }).select({ job: 1 }).lean(),
          StudentApplication.find({ student: studentId })
            .select({ job: 1 })
            .lean(),
        ]);

        const appliedJobIds = [
          ...new Set([
            ...appliedJobs.map((j) => j.job?.toString()).filter(Boolean),
            ...pendingApplications
              .map((j) => j.job?.toString())
              .filter(Boolean),
          ]),
        ].map((id) => new mongoose.Types.ObjectId(id));

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

        const agentCap = normalizeLimit(agent.agentDailyLimit, 3, {
          min: 0,
          max: 50,
        });
        const batchSize = Math.min(remainingForStudent, agentCap);

        if (batchSize <= 0) continue;

        const recommendedJobs = await getRecommendedJobs({
          studentId,
          agentConfig,
          studentProfile: effectiveStudent,
          appliedJobIds,
          limit: batchSize,
          skipExternalFetch: true, // avoid RapidAPI 429 when processing many students
        });

        if (!recommendedJobs.length) continue;

        if (!toBool(process.env.AUTOGEN_TAILORED || 'false')) continue;

        const concurrency = Math.max(
          1,
          toInt(process.env.AUTOGEN_CONCURRENCY, 3) || 3,
        );

        await runWithConcurrency(
          recommendedJobs,
          async (job) => {
            if (remainingForStudent <= 0) return;

            const alreadyExists = await AppliedJob.exists({
              student: studentId,
              job: job._id,
            });
            if (alreadyExists) return;

            const existingDraft = await StudentApplication.findOne({
              student: studentId,
              job: job._id,
            });
            if (existingDraft) return;

            let application;
            try {
              application = await StudentApplication.create({
                student: studentId,
                job: job._id,
                jobTitle: job.title,
                jobCompany: job.company,
                jobDescription: job.description,
                status: 'Draft',
              });
            } catch (createErr) {
              if (createErr?.code === 11000) return;
              throw createErr;
            }

            const applicationData = buildApplicationData(
              job,
              effectiveStudent,
              '',
            );

            const success = await processTailoredApplication(
              studentId,
              application._id,
              applicationData,
              null,
            );

            if (!success) return;

            await User.updateOne(
              { _id: studentId },
              { $inc: { 'usageCounters.aiAutoApplyDailyLimit': 1 } },
            );

            remainingForStudent--;
            totalProcessed++;

            await AppliedJob.create({
              student: studentId,
              job: job._id,
              applicationMethod: 'AUTOPILOT',
              status: 'APPLIED',
            });
          },
          concurrency,
        );
      } catch (error) {
        console.error(
          `❌ Failed agent "${agent.agentName}":`,
          error?.message || error,
        );
      }
    }
  }

  return { processed: totalProcessed, studentsChecked: totalStudents };
};
