// worker.js
import mongoose from 'mongoose';
import connectDb from './src/config/db.js';
import { Student } from './src/models/student.model.js';
import { AppliedJob } from './src/models/AppliedJob.js';
import { getRecommendedJobs } from './src/utils/getRecommendedJobs.js';
import { buildEffectiveStudentProfile } from './src/utils/profileHydration.js';

import { buildJobContextString } from './src/utils/jobContext.js';
import { processTailoredApplication } from './src/utils/tailoredApply.background.js';

const toBool = (v) => v === true || String(v).toLowerCase() === 'true';

const logEnvOnce = () => {
  try {
    const uri = process.env.MONGO_URI || '';
    const masked = uri.includes('@')
      ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
      : uri;
    console.log(`[DB] Using ${masked || 'MONGO_URI not set'}`);
  } catch {}
};

const buildApplicationData = (job, effectiveStudent, finalTouch = '') => {
  return {
    job: {
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      // Optional extras for your prompts if they read them:
      country: job.country || '',
      location: {
        city: job.location?.city || '',
        state: job.location?.state || '',
      },
      isRemote: !!job.isRemote,
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
    // Prompts expect `candidate` as a JSON string (matches your API path)
    candidate: JSON.stringify(effectiveStudent),
    coverLetter: '', // worker doesn’t have a prewritten CL
    preferences: finalTouch,
  };
};

const findAndProcessJobs = async () => {
  console.log('🚀 [Worker] Starting a new job-finding cycle...');

  const students = await Student.find({
    'settings.autopilotEnabled': true,
    isActive: true,
    'autopilotAgent.0': { $exists: true },
  })
    .select(
      'autopilotAgent settings isActive email fullName phone jobRole jobPreferences skills experience education',
    )
    .lean();

  console.log(
    `[Worker] Found ${students.length} students with autopilot enabled.`,
  );

  for (const student of students) {
    const agents = Array.isArray(student.autopilotAgent)
      ? student.autopilotAgent
      : [];
    console.log(`[Worker] Student ${student._id} has ${agents.length} agents.`);

    if (!agents.length) continue;

    for (const agent of agents) {
      const enabled = toBool(agent?.autopilotEnabled ?? true);
      if (!enabled) {
        console.log(
          `[Worker] Skipping agent "${
            agent?.agentName || 'Unnamed'
          }" (disabled).`,
        );
        continue;
      }

      try {
        console.log(
          `🔍 Processing agent "${agent.agentName || 'Unnamed'}" for student ${
            student._id
          }...`,
        );

        // exclude already-applied jobs
        const appliedJobs = await AppliedJob.find({ student: student._id })
          .select({ job: 1 })
          .lean();
        const appliedJobIds = appliedJobs
          .map((j) => j.job)
          .filter(Boolean)
          .map((id) => new mongoose.Types.ObjectId(id));

        // sanitize agentConfig for downstream filter
        const {
          _id,
          agentId,
          agentName,
          uploadedCVData,
          autopilotEnabled,
          autopilotLimit,
          createdAt,
          updatedAt,
          ...agentConfig
        } = agent || {};

        // per-agent hydrated profile
        const effectiveStudent = buildEffectiveStudentProfile(student, agent);

        const hasSignals =
          (effectiveStudent.jobRole && effectiveStudent.jobRole.trim()) ||
          (effectiveStudent.skills && effectiveStudent.skills.length > 0) ||
          effectiveStudent.jobPreferences?.mustHaveSkills?.length > 0 ||
          effectiveStudent.jobPreferences?.preferredJobTitles?.length > 0;

        if (!hasSignals) {
          console.warn(
            '[Scoring] Effective profile has weak signals (role/skills/titles empty). Expect low scores.',
          );
        }

        const limit = student?.settings?.autopilotLimit || 50;

        const recommendedJobs = await getRecommendedJobs({
          studentId: student._id,
          agentConfig,
          studentProfile: effectiveStudent,
          appliedJobIds,
          limit,
        });

        if (!recommendedJobs.length) {
          console.log(
            `[Worker] No new jobs found for agent "${
              agent.agentName || 'Unnamed'
            }".`,
          );
          continue;
        }

        console.log(
          `✅ Found ${recommendedJobs.length} new jobs for agent "${
            agent.agentName || 'Unnamed'
          }".`,
        );
        console.log(
          `[Worker] Titles (${Math.min(10, recommendedJobs.length)} shown):`,
          recommendedJobs
            .slice(0, 10)
            .map((j) => `${j.title} @ ${j.company} [${j.origin || 'HOSTED'}]`),
        );

        // ------------------------------------------------------------
        // Auto-generate TAILORED APPLICATIONS (CV + CL + Email)
        // ------------------------------------------------------------
        if (toBool(process.env.AUTOGEN_TAILORED || 'false')) {
          const topN = Math.min(
            Number(agent.autopilotLimit || 3),
            recommendedJobs.length,
          );
          const finalTouch = ''; // optionally pull from agent

          for (let i = 0; i < topN; i++) {
            const job = recommendedJobs[i];

            try {
              // Build prompt payload
              const applicationData = buildApplicationData(
                job,
                effectiveStudent,
                finalTouch,
              );

              // Create tailoredApplications subdoc with status=pending
              const applicationId = new mongoose.Types.ObjectId();
              const subdoc = {
                _id: applicationId,
                jobId: job._id, // link to Job
                jobTitle: job.title,
                companyName: job.company,
                jobDescription: job.description,
                useProfile: true, // worker uses hydrated profile
                status: 'pending',
                finalTouch,
                createdAt: new Date(),
              };

              const resPush = await Student.updateOne(
                { _id: student._id },
                {
                  $push: {
                    tailoredApplications: { $each: [subdoc], $position: 0 },
                  },
                },
              );

              console.log('[Worker] push tailoredApplications =>', resPush);
              if (resPush.matchedCount !== 1 || resPush.modifiedCount !== 1) {
                console.error(
                  '[Worker] FAILED to push tailoredApplications subdoc; skipping this job.',
                );
                continue;
              }

              // No socket.io in worker context
              const io = null;

              // Fire the background generator
              processTailoredApplication(
                student._id,
                applicationId,
                applicationData,
                io,
              );

              console.log(
                `[Worker] Tailored application queued for "${
                  job.title
                }" (${String(job._id)}), applicationId=${String(
                  applicationId,
                )}.`,
              );
            } catch (e) {
              console.error(
                '[Worker] Failed to queue tailored application:',
                e?.message || e,
              );
            }
          }
        }
      } catch (error) {
        console.error(
          `❌ Failed to process agent "${agent.agentName || 'Unnamed'}":`,
          error?.message || error,
        );
      }
    }
  }
};

const startWorker = async () => {
  await connectDb();
  logEnvOnce();
  console.log('✅ DB Worker connected.');

  await findAndProcessJobs();

  if (toBool(process.env.WORKER_KEEP_ALIVE || 'false')) {
    console.log(
      '\n✅ Cycle complete. Keeping process alive for background work...',
    );
    setInterval(() => {}, 1 << 30);
  } else {
    console.log('\n✅ Cycle complete. Worker is now exiting.');
    process.exit(0);
  }
};

startWorker();
