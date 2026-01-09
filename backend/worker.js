// worker.js
import mongoose from 'mongoose';
import connectDb from './src/config/db.js';
import { Student } from './src/models/student.model.js';
import { User } from './src/models/User.model.js';
import { StudentApplication } from './src/models/students/studentApplication.model.js';
import { AppliedJob } from './src/models/AppliedJob.js';
import { getRecommendedJobs } from './src/utils/getRecommendedJobs.js';
import { buildEffectiveStudentProfile } from './src/utils/profileHydration.js';
import { buildJobContextString } from './src/utils/jobContext.js';
import { processTailoredApplication } from './src/utils/tailored.autopilot.js';
import { config } from './src/config/config.js';

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
    const uri = config.mongoUrl;
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

const findAndProcessJobs = async () => {
  console.log('🚀 [Worker] Starting a new job-finding cycle...');

  const studentCursor = Student.find({
    'settings.autopilotEnabled': true,
    isActive: true,
    'autopilotAgent.0': { $exists: true },
  })
    .select(
      'autopilotAgent settings isActive email fullName phone jobRole jobPreferences skills experience education',
    )
    .cursor();

  console.log(`[Worker] Cursor initialized. Iterating students...`);

  for (
    let student = await studentCursor.next();
    student != null;
    student = await studentCursor.next()
  ) {
    // 1. Fetch User to check Plan Limits & Current Usage
    const user = await User.findById(student._id)
      .select('usageLimits usageCounters')
      .lean();

    // 2. Extract Limits (Default to 0 for safety)
    const userPlanLimit = user?.usageLimits?.aiAutoApplyDailyLimit || 0;
    const userUsageCount = user?.usageCounters?.aiAutoApplyDailyLimit || 0;

    // 3. Extract Student Preference
    const studentPrefLimit = normalizeLimit(
      student?.settings?.autopilotLimit,
      5,
      { min: 0, max: 200 },
    );

    // 4. Calculate Effective Maximum (Lower of Plan vs Preference)
    const effectiveMaxLimit = Math.min(userPlanLimit, studentPrefLimit);

    // 5. Calculate Actual Remaining Capacity
    let remainingForStudent = Math.max(0, effectiveMaxLimit - userUsageCount);

    console.log(`[Worker Limits ${student._id}]`);
    console.log(`   - Plan Limit: ${userPlanLimit}`);
    console.log(`   - User Usage: ${userUsageCount}`);
    console.log(`   - Student Pref: ${studentPrefLimit}`);
    console.log(`   - Effective Remaining: ${remainingForStudent}`);

    if (remainingForStudent <= 0) {
      const reason =
        userPlanLimit < studentPrefLimit
          ? 'Plan Limit Reached'
          : 'User Preference Reached';
      console.log(
        `[Limit] Skipping student ${student._id}. Reason: ${reason} (${userUsageCount}/${effectiveMaxLimit})`,
      );
      continue;
    }

    const agents = Array.isArray(student.autopilotAgent)
      ? student.autopilotAgent
      : [];

    if (!agents.length) continue;

    for (const agent of agents) {
      if (remainingForStudent <= 0) break; // Stop if we ran out of credits mid-loop

      const enabled = toBool(agent?.autopilotEnabled ?? true);
      if (!enabled) continue;

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

        const { _id, autopilotLimit, ...agentConfig } = agent || {};
        const effectiveStudent = buildEffectiveStudentProfile(student, agent);

        // Agent-level cap
        const agentCap = normalizeLimit(autopilotLimit, 3, { min: 0, max: 50 });
        const batchSize = Math.min(remainingForStudent, agentCap);

        if (batchSize <= 0) continue;

        const recommendedJobs = await getRecommendedJobs({
          studentId: student._id,
          agentConfig,
          studentProfile: effectiveStudent,
          appliedJobIds,
          limit: batchSize,
        });

        if (!recommendedJobs.length) {
          console.log(
            `[Worker] No new jobs found for agent "${agent.agentName}".`,
          );
          continue;
        }

        if (toBool(process.env.AUTOGEN_TAILORED || 'false')) {
          const concurrency = Math.max(
            1,
            toInt(process.env.AUTOGEN_CONCURRENCY, 3) || 3,
          );

          await runWithConcurrency(
            recommendedJobs,
            async (job) => {
              // Double-check remaining capacity before processing
              if (remainingForStudent <= 0) return;

              // Create Draft Application
              const application = await StudentApplication.create({
                student: student._id,
                jobTitle: job.title,
                jobCompany: job.company,
                jobDescription: job.description,
                status: 'Draft',
              });

              const applicationData = buildApplicationData(
                job,
                effectiveStudent,
                '',
              );

              // Process AI Generation
              await processTailoredApplication(
                student._id,
                application._id,
                applicationData,
                null, // No socket in worker
              );

              // ✅ IMPORTANT: Increment the Usage Counter
              await User.updateOne(
                { _id: student._id },
                { $inc: { 'usageCounters.aiAutoApplyDailyLimit': 1 } },
              );

              // Decrement local counter
              remainingForStudent--;

              console.log(
                `[Worker] Tailored application created: ${application._id} for ${job.title}. Remaining: ${remainingForStudent}`,
              );
            },
            concurrency,
          );
        }
      } catch (error) {
        console.error(
          `❌ Failed agent "${agent.agentName}":`,
          error?.message || error,
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

    if (toBool(process.env.WORKER_KEEP_ALIVE || 'false')) {
      console.log('\n✅ Cycle complete. Keeping process alive...');
      setInterval(() => {}, 1 << 30);
    } else {
      console.log('\n✅ Cycle complete. Exiting.');
      process.exit(0);
    }
  }
};

startWorker();
