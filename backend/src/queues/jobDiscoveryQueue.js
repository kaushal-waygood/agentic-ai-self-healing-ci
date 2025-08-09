// autopilot/jobDiscoveryQueue.js
import Queue from 'bull';
import { Student } from '../models/student.model.js'; // Adjust path as per your project structure
import { Job } from '../models/jobs.model.js'; // Adjust path as per your project structure
import { AppliedJob } from '../models/AppliedJob.js'; // Adjust path as per your project structure
import jobApplyQueue from './jobApplyQueue.js'; // Import the job application queue

// Assume these utility functions exist in a separate file, e.g., '../utils/jobUtils.js'
// You will need to implement the actual logic for these based on your job and student schemas.
const convertSalaryToYearly = (amount, period) => {
  if (!amount) return null;
  switch (period) {
    case 'HOUR':
      return amount * 8 * 5 * 52; // 8 hours/day, 5 days/week, 52 weeks/year
    case 'DAY':
      return amount * 5 * 52;
    case 'WEEK':
      return amount * 52;
    case 'MONTH':
      return amount * 12;
    case 'YEAR':
      return amount;
    default:
      return amount; // Default to yearly if period is unknown or null
  }
};

const calculateMatchScore = (job, preferences) => {
  let score = 0;
  let maxScore = 0;

  // 1. Location Preferences
  maxScore += 10;
  if (preferences.isRemote && job.isRemote) {
    // Assuming job also has an isRemote field
    score += 10;
  } else if (!preferences.isRemote) {
    if (
      preferences.preferedCountries &&
      preferences.preferedCountries.includes(job.country)
    ) {
      score += 5;
    }
    if (
      preferences.preferedCities &&
      preferences.preferedCities.includes(job.location?.city)
    ) {
      score += 5;
    }
  }

  // 2. Job Titles
  maxScore += 10;
  if (
    preferences.preferedJobTitles &&
    preferences.preferedJobTitles.some((title) =>
      job.title.toLowerCase().includes(title.toLowerCase()),
    )
  ) {
    score += 10;
  }

  // 3. Job Types
  maxScore += 5;
  if (
    preferences.preferedJobTypes &&
    preferences.preferedJobTypes.some((type) => job.jobTypes?.includes(type))
  ) {
    score += 5;
  }

  // 4. Experience Level
  maxScore += 10;
  if (preferences.preferedExperienceLevel && job.experience !== undefined) {
    let studentExpValue = 0;
    switch (preferences.preferedExperienceLevel) {
      case 'ENTRY_LEVEL':
        studentExpValue = 0;
        break;
      case 'MID_LEVEL':
        studentExpValue = 3;
        break;
      case 'SENIOR':
        studentExpValue = 5;
        break;
      case 'EXPERT':
        studentExpValue = 8;
        break;
    }
    // Simple logic: if job requires less or equal experience than student has
    if (job.experience <= studentExpValue) {
      score += 10;
    } else if (job.experience - studentExpValue <= 2) {
      // Slightly above, still some match
      score += 5;
    }
  }

  // 5. Salary (more complex, consider ranges)
  maxScore += 15;
  if (preferences.preferedSalary?.min && job.salary?.min) {
    const studentMinYearly = convertSalaryToYearly(
      preferences.preferedSalary.min,
      preferences.preferedSalary.period,
    );
    const jobMinYearly = convertSalaryToYearly(
      job.salary.min,
      job.salary.period,
    );
    if (jobMinYearly >= studentMinYearly) {
      score += 15;
    } else if (studentMinYearly - jobMinYearly < 10000) {
      // Within a reasonable range
      score += 7;
    }
  }

  // 6. Must-Have Skills
  maxScore += 20;
  if (preferences.mustHaveSkills && preferences.mustHaveSkills.length > 0) {
    let matchedMustHaveSkills = 0;
    for (const prefSkill of preferences.mustHaveSkills) {
      // Check if job description or qualifications include the skill
      if (
        job.description
          ?.toLowerCase()
          .includes(prefSkill.skill.toLowerCase()) ||
        job.qualifications?.some((q) =>
          q.toLowerCase().includes(prefSkill.skill.toLowerCase()),
        ) ||
        job.tags?.some((tag) =>
          tag.toLowerCase().includes(prefSkill.skill.toLowerCase()),
        )
      ) {
        matchedMustHaveSkills++;
      }
    }
    score += (matchedMustHaveSkills / preferences.mustHaveSkills.length) * 20;
  }

  // 7. Nice-To-Have Skills (partial score)
  maxScore += 10;
  if (preferences.niceToHaveSkills && preferences.niceToHaveSkills.length > 0) {
    let matchedNiceToHaveSkills = 0;
    for (const niceSkill of preferences.niceToHaveSkills) {
      if (
        job.description
          ?.toLowerCase()
          .includes(niceSkill.skill.toLowerCase()) ||
        job.qualifications?.some((q) =>
          q.toLowerCase().includes(niceSkill.skill.toLowerCase()),
        ) ||
        job.tags?.some((tag) =>
          tag.toLowerCase().includes(niceSkill.skill.toLowerCase()),
        )
      ) {
        matchedNiceToHaveSkills++;
      }
    }
    score +=
      (matchedNiceToHaveSkills / preferences.niceToHaveSkills.length) * 10;
  }

  // Normalize score to be between 0 and 1 (or 0 and 100 if multiplied by 100)
  return maxScore > 0 ? score / maxScore : 0;
};

// Initialize the Bull.js queue for job discovery tasks
const jobDiscoveryQueue = new Queue('job discovery', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1', // Use environment variable for host
    port: process.env.REDIS_PORT || 6379, // Use environment variable for port
  },
});

/**
 * Processes job discovery tasks.
 * For each student, it finds recommended jobs and adds them to the jobApplyQueue.
 */
jobDiscoveryQueue.process(async (job) => {
  const { studentId } = job.data;
  console.log(
    `[JobDiscoveryQueue] Discovering jobs for student ${studentId}...`,
  );

  try {
    const student = await Student.findById(studentId).select('jobPreferences');
    if (!student) {
      console.error(`[JobDiscoveryQueue] Student ${studentId} not found.`);
      return;
    }

    const preferences = student.jobPreferences;

    // Build the job filter based on student preferences
    const filter = { isActive: true };

    // --- Location filters ---
    if (preferences.isRemote) {
      filter.isRemote = true; // Assuming Job schema has an 'isRemote' field
    } else {
      if (
        preferences.preferedCountries &&
        preferences.preferedCountries.length > 0
      ) {
        filter.country = {
          $in: preferences.preferedCountries.map((c) => new RegExp(c, 'i')),
        };
      }
      if (preferences.preferedCities && preferences.preferedCities.length > 0) {
        filter['location.city'] = {
          $in: preferences.preferedCities.map((c) => new RegExp(c, 'i')),
        };
      }
    }

    // --- Job type filters ---
    if (
      preferences.preferedJobTypes &&
      preferences.preferedJobTypes.length > 0
    ) {
      filter.jobTypes = { $in: preferences.preferedJobTypes };
    }

    // --- Job title filters (using $or for multiple titles) ---
    if (
      preferences.preferedJobTitles &&
      preferences.preferedJobTitles.length > 0
    ) {
      filter.$or = preferences.preferedJobTitles.map((title) => ({
        title: { $regex: title, $options: 'i' },
      }));
    }

    // --- Salary filter ---
    if (preferences.preferedSalary?.min) {
      const minSalary = convertSalaryToYearly(
        preferences.preferedSalary.min,
        preferences.preferedSalary.period,
      );
      filter['salary.min'] = { $gte: minSalary };
    }

    // --- Experience level filter ---
    if (preferences.preferedExperienceLevel) {
      let experienceValue;
      switch (preferences.preferedExperienceLevel) {
        case 'ENTRY_LEVEL':
          experienceValue = 0;
          break;
        case 'MID_LEVEL':
          experienceValue = 3;
          break;
        case 'SENIOR':
          experienceValue = 5;
          break;
        case 'EXPERT':
          experienceValue = 8;
          break; // Added EXPERT for completeness
        default:
          experienceValue = 0;
      }
      filter.experience = { $lte: experienceValue }; // Job experience should be less than or equal to student's preferred level
    }

    // --- Must-have skills filter (matching any relevant field) ---
    if (preferences.mustHaveSkills && preferences.mustHaveSkills.length > 0) {
      // Use $and to ensure ALL must-have skills are present
      filter.$and = preferences.mustHaveSkills.map((skillObj) => ({
        $or: [
          { qualifications: { $regex: skillObj.skill, $options: 'i' } },
          { description: { $regex: skillObj.skill, $options: 'i' } },
          { tags: { $regex: skillObj.skill, $options: 'i' } },
        ],
      }));
    }

    // Exclude jobs already applied for by this student
    const appliedJobs = await AppliedJob.find({ student: studentId }).select(
      'job',
    );
    const appliedJobIds = appliedJobs.map((app) => app.job);
    filter._id = { $nin: appliedJobIds };

    // Fetch a batch of recommended jobs
    const recommendedJobs = await Job.find(filter)
      .sort({ createdAt: -1 }) // Sort by latest jobs
      .limit(20); // Limit the number of jobs to discover per run

    console.log(
      `[JobDiscoveryQueue] Found ${recommendedJobs.length} potential jobs for student ${studentId}.`,
    );

    // Add each recommended job to the main job application queue
    for (const job of recommendedJobs) {
      const matchScore = calculateMatchScore(job, preferences);

      // Only queue jobs with a high enough match score for auto-application
      if (matchScore >= 0.7) {
        // Set your desired match score threshold
        await jobApplyQueue.add(
          {
            studentId: studentId,
            jobData: job.toObject(), // Convert Mongoose document to plain object for queue
          },
          {
            attempts: 3, // Retry failed applications up to 3 times
            backoff: { type: 'exponential', delay: 5000 }, // Exponential backoff starting at 5 seconds
            // Add a job-level timeout if the entire application process (including AI)
            // needs to be limited, e.g., 5 minutes for the entire job process
            timeout: 5 * 60 * 1000, // 5 minutes (in milliseconds)
          },
        );
        console.log(
          `[JobDiscoveryQueue] Added job "${
            job.title
          }" (Score: ${matchScore.toFixed(
            2,
          )}) for student ${studentId} to application queue.`,
        );
      } else {
        console.log(
          `[JobDiscoveryQueue] Job "${job.title}" (Score: ${matchScore.toFixed(
            2,
          )}) for student ${studentId} did not meet auto-apply threshold.`,
        );
      }
    }
  } catch (error) {
    console.error(
      `[JobDiscoveryQueue] Error processing job discovery for student ${studentId}:`,
      error,
    );
    // Throwing an error here will mark the job in Bull as failed and allow retries
    throw error;
  }
});

// Event listeners for monitoring the queue (optional but recommended)
jobDiscoveryQueue.on('completed', (job) => {
  console.log(`[JobDiscoveryQueue] Job discovery task ${job.id} completed.`);
});

jobDiscoveryQueue.on('failed', (job, err) => {
  console.error(
    `[JobDiscoveryQueue] Job discovery task ${job.id} failed:`,
    err.message,
  );
});

jobDiscoveryQueue.on('active', (job) => {
  console.log(`[JobDiscoveryQueue] Job discovery task ${job.id} is active.`);
});

export default jobDiscoveryQueue;
