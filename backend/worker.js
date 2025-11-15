// worker.js
import mongoose from 'mongoose';
import connectDb from './src/config/db.js';
import { Student } from './src/models/student.model.js';
import { AppliedJob } from './src/models/AppliedJob.js';
import { getRecommendedJobs } from './src/utils/getRecommendedJobs.js';
import { buildEffectiveStudentProfile } from './src/utils/profileHydration.js';
import { buildJobContextString } from './src/utils/jobContext.js';
import { processTailoredApplication } from './src/utils/tailored.autopilot.js';

const toBool = (v) => v === true || String(v).toLowerCase() === 'true';

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeLimit = (v, fallback, { min = 0, max = 200 } = {}) =>
  clamp(toInt(v, fallback), min, max);

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
    candidate: JSON.stringify(effectiveStudent),
    coverLetter: '',
    preferences: finalTouch,
  };
};

const runWithConcurrency = async (items, handler, concurrency = 3) => {
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

// Count how many tailoredApplications were created today for a student
const countTailoredAppsToday = async (studentId) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [{ todayCount } = { todayCount: 0 }] = await Student.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(studentId) } },
    {
      $project: {
        todayCount: {
          $size: {
            $filter: {
              input: '$tailoredApplications',
              as: 't',
              cond: {
                $and: [
                  { $gte: ['$$t.createdAt', start] },
                  { $lte: ['$$t.createdAt', end] },
                ],
              },
            },
          },
        },
      },
    },
  ]);

  return todayCount || 0;
};

const findAndProcessJobs = async () => {
  console.log('🚀 [Worker] Starting a new job-finding cycle...');

  const students = await Student.find({
    'settings.autopilotEnabled': true,
    isActive: true,
    'autopilotAgent.0': { $exists: true },
  })
    .select(
      'autopilotAgent settings isActive email fullName phone jobRole jobPreferences skills experience education tailoredApplications',
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

    // Enforce a per-student daily limit
    const studentDailyLimit = normalizeLimit(
      student?.settings?.autopilotLimit,
      50,
      { min: 0, max: 200 },
    );
    const alreadyToday = await countTailoredAppsToday(student._id);
    let remainingForStudent = Math.max(0, studentDailyLimit - alreadyToday);

    if (remainingForStudent === 0) {
      console.log(
        `[Limit] Student ${student._id} is at daily limit (${studentDailyLimit}). Skipping all agents.`,
      );
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
          autopilotLimit, // agent-level
          createdAt,
          updatedAt,
          ...agentConfig
        } = agent || {};

        const effectiveStudent = buildEffectiveStudentProfile(student, agent);

        const hasSignals =
          (effectiveStudent.jobRole && effectiveStudent.jobRole.trim()) ||
          (effectiveStudent.skills && effectiveStudent.skills.length > 0) ||
          (effectiveStudent.jobPreferences?.mustHaveSkills?.length ?? 0) > 0 ||
          (effectiveStudent.jobPreferences?.preferredJobTitles?.length ?? 0) >
            0;

        if (!hasSignals) {
          console.warn(
            '[Scoring] Effective profile has weak signals (role/skills/titles empty). Expect low scores.',
          );
        }

        // Compute the hard cap for this agent this cycle
        const agentCap = normalizeLimit(autopilotLimit, 3, {
          min: 0,
          max: 50,
        });
        // Remaining capacity for the student today
        const remaining = Math.min(remainingForStudent, agentCap);
        if (remaining <= 0) {
          console.log(
            `[Limit] No remaining capacity for agent "${
              agent.agentName || 'Unnamed'
            }" (student remaining ${remainingForStudent}, agent cap ${agentCap}).`,
          );
          continue;
        }

        // Fetch only as many as we could possibly process
        const fetchLimit = remaining; // do not overfetch
        const recommendedJobs = await getRecommendedJobs({
          studentId: student._id,
          agentConfig,
          studentProfile: effectiveStudent,
          appliedJobIds,
          limit: fetchLimit,
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
          }" (capacity ${remaining}).`,
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
          const finalTouch = ''; // optional hook for agent-specific fine-tuning

          // Re-check today's count to avoid races if multiple agents run
          const nowCount = await countTailoredAppsToday(student._id);
          const nowRemainingForStudent = Math.max(
            0,
            studentDailyLimit - nowCount,
          );
          const topN = Math.min(
            nowRemainingForStudent,
            recommendedJobs.length,
            remaining, // agent cap snapshot
          );

          if (topN <= 0) {
            console.log(
              `[Limit] Capacity exhausted while preparing queue for agent "${
                agent.agentName || 'Unnamed'
              }".`,
            );
            continue;
          }

          const jobsToProcess = recommendedJobs.slice(0, topN);
          const concurrency = Math.max(
            1,
            toInt(process.env.AUTOGEN_CONCURRENCY, 3) || 3,
          );

          await runWithConcurrency(
            jobsToProcess,
            async (job) => {
              // Double-guard capacity just before writing
              const beforePushCount = await countTailoredAppsToday(student._id);
              if (beforePushCount >= studentDailyLimit) {
                console.log(
                  `[Limit] Hit daily limit (${studentDailyLimit}) prior to push for student ${
                    student._id
                  }. Skipping job ${String(job._id)}.`,
                );
                return;
              }

              // Create tailoredApplications subdoc with status=pending
              const applicationId = new mongoose.Types.ObjectId();
              const subdoc = {
                _id: applicationId,
                jobId: job._id,
                jobTitle: job.title,
                companyName: job.company,
                jobDescription: job.description,
                useProfile: true,
                status: 'pending',
                finalTouch,
                createdAt: new Date(),
              };

              const resPush = await Student.updateOne(
                {
                  _id: student._id,
                  // Guard again in the write: only push if still under limit
                  $expr: {
                    $lt: [
                      {
                        $size: {
                          $filter: {
                            input: '$tailoredApplications',
                            as: 't',
                            cond: {
                              $and: [
                                {
                                  $gte: [
                                    '$$t.createdAt',
                                    new Date(new Date().setHours(0, 0, 0, 0)),
                                  ],
                                },
                                {
                                  $lte: [
                                    '$$t.createdAt',
                                    new Date(
                                      new Date().setHours(23, 59, 59, 999),
                                    ),
                                  ],
                                },
                              ],
                            },
                          },
                        },
                      },
                      studentDailyLimit,
                    ],
                  },
                },
                {
                  $push: {
                    tailoredApplications: { $each: [subdoc], $position: 0 },
                  },
                },
              );

              if (resPush.matchedCount !== 1 || resPush.modifiedCount !== 1) {
                console.error(
                  '[Worker] FAILED to push tailoredApplications subdoc (limit or race); skipping this job.',
                );
                return;
              }

              const applicationData = buildApplicationData(
                job,
                effectiveStudent,
                finalTouch,
              );

              const io = null; // No socket.io in worker context

              await processTailoredApplication(
                student._id,
                applicationId,
                applicationData,
                io,
              );

              console.log(
                `[Worker] Tailored application completed for "${
                  job.title
                }" (${String(job._id)}), applicationId=${String(
                  applicationId,
                )}.`,
              );
            },
            concurrency,
          );

          // Decrease in-memory remaining for this student so later agents respect it
          remainingForStudent = Math.max(
            0,
            studentDailyLimit - (await countTailoredAppsToday(student._id)),
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed to process agent "${agent.agentName || 'Unnamed'}":`,
          error?.stack || error?.message || error,
        );
      }
    }
  }
};

const startWorker = async () => {
  try {
    await connectDb();
    logEnvOnce();
    console.log('✅ DB Worker connected.');

    await findAndProcessJobs();
  } catch (err) {
    console.error('❌ Fatal worker error:', err?.stack || err);
  } finally {
    try {
      await mongoose.connection.close();
      await mongoose.disconnect();
      console.log('🔌 Mongo disconnected.');
    } catch {}

    // If you truly want a daemon, keep alive. Otherwise exit cleanly after all awaited work.
    if (toBool(process.env.WORKER_KEEP_ALIVE || 'false')) {
      console.log(
        '\n✅ Cycle complete. Keeping process alive for background work...',
      );
      // Keep the event loop alive without hot-spinning
      setInterval(() => {}, 1 << 30);
    } else {
      console.log('\n✅ Cycle complete. Exiting.');
      process.exit(0);
    }
  }
};

startWorker();
