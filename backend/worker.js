// worker.js
import mongoose from 'mongoose';
import connectDb from './src/config/db.js';
import { Student } from './src/models/student.model.js';
import { AppliedJob } from './src/models/AppliedJob.js';
import { getRecommendedJobs } from './src/utils/getRecommendedJobs.js';
import { buildEffectiveStudentProfile } from './src/utils/profileHydration.js';

// Optional CV autogeneration (guarded by env AUTOGEN_CV)
import { processCVGeneration } from './src/utils/cv.background.js';
import { buildJobContextString } from './src/utils/jobContext.js';

const toBool = (v) => v === true || String(v).toLowerCase() === 'true';

const logEnvOnce = () => {
  try {
    const uri = process.env.MONGO_URI || '';
    // mask credentials if present
    const masked =
      uri.indexOf('@') > -1
        ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
        : uri;
    console.log(`[DB] Using ${masked || 'MONGO_URI not set'}`);
  } catch {
    // ignore
  }
};

const findAndProcessJobs = async () => {
  console.log('🚀 [Worker] Starting a new job-finding cycle...');

  // Only students with autopilot enabled and at least one agent
  const students = await Student.find({
    'settings.autopilotEnabled': true,
    isActive: true,
    'autopilotAgent.0': { $exists: true },
  })
    .select(
      'autopilotAgent settings isActive email jobRole jobPreferences skills experience education',
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

    if (agents.length === 0) {
      console.log(`[Worker] Skipping student ${student._id}: no agents.`);
      continue;
    }

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

        // Exclude already-applied jobs
        const appliedJobs = await AppliedJob.find({ student: student._id })
          .select({ job: 1 })
          .lean();
        const appliedJobIds = appliedJobs
          .map((j) => j.job)
          .filter(Boolean)
          .map((id) => new mongoose.Types.ObjectId(id));

        // Sanitize agent config for downstream filter usage
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

        // Hydrate per-agent effective profile (merges uploaded CV data if any)
        const effectiveStudent = buildEffectiveStudentProfile(student, agent);

        // Optional signal check
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

        // Brief titles dump for visibility (not too spammy)
        console.log(
          `[Worker] Titles (${Math.min(10, recommendedJobs.length)} shown):`,
          recommendedJobs
            .slice(0, 10)
            .map((j) => `${j.title} @ ${j.company} [${j.origin || 'HOSTED'}]`),
        );

        // -----------------------------
        // Optional: Auto-generate CVs
        // -----------------------------
        if (toBool(process.env.AUTOGEN_CV || 'false')) {
          const topN = Math.min(
            Number(agent.autopilotLimit || 3),
            recommendedJobs.length,
          );

          for (let i = 0; i < topN; i++) {
            const job = recommendedJobs[i];

            try {
              const jobContextString = buildJobContextString(job);

              // Use the student's profile unless you have a file pipeline in worker
              const studentDataStr = JSON.stringify(effectiveStudent);

              // Link CV subdoc to the real Job ObjectId
              const cvJobId = new mongoose.Types.ObjectId(job._id);

              await Student.updateOne(
                { _id: student._id },
                {
                  $push: {
                    cvs: {
                      $each: [
                        {
                          jobId: cvJobId,
                          status: 'pending',
                          jobContextString,
                          finalTouch: '', // optional agent-level tweak
                          jobTitle: job.title,
                          createdAt: new Date(),
                        },
                      ],
                      $position: 0,
                    },
                  },
                },
              );

              // Worker typically has no socket.io; pass null
              const io = null;
              processCVGeneration(
                student._id,
                cvJobId,
                studentDataStr,
                jobContextString,
                '',
                io,
              );

              console.log(
                `[Worker] CV generation queued for job "${job.title}" (${String(
                  job._id,
                )}).`,
              );
            } catch (e) {
              console.error(
                '[Worker] Failed to queue CV generation:',
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

  console.log('\n✅ Cycle complete. Worker is now exiting.');
  process.exit(0);
};

startWorker();
