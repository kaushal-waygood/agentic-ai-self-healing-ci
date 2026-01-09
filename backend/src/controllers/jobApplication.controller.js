// src/controllers/jobApplication.controller.ts
import mongoose from 'mongoose';
import { Job } from '../models/jobs.model.js';
import { Student } from '../models/student.model.js';
import { JobApplication } from '../models/JobApplication.js';
import { JobInteraction } from '../models/jobInteraction.model.js';

export const applyForJob = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const {
      resume,
      coverLetter,
      screeningAnswers = [],
      assignmentSubmission,
      source = 'web',
    } = req.body;

    // 1. Validate job
    const job = await Job.findById(jobId).session(session);
    if (!job || !job.isActive) {
      throw new Error('Job not found or inactive');
    }

    // 2. Validate student
    const student = await Student.findById(userId).session(session);
    if (!student) {
      throw new Error('Student not found');
    }

    // 3. Prevent duplicate applications (hard guard)
    const alreadyApplied = await JobApplication.findOne({
      job: jobId,
      applicant: userId,
    }).session(session);

    if (alreadyApplied) {
      throw new Error('You have already applied to this job');
    }

    // 4. Create JobApplication (SOURCE OF TRUTH)
    const application = await JobApplication.create(
      [
        {
          job: job._id,
          applicant: student._id,
          organizationId: job.organizationId,
          resume,
          coverLetter,
          screeningAnswers,
          assignmentSubmission,
          source,
        },
      ],
      { session },
    );

    // 5. Track analytics event (best-effort)
    await JobInteraction.updateOne(
      {
        user: student._id,
        job: job._id,
        type: 'APPLIED',
      },
      {
        $setOnInsert: {
          user: student._id,
          job: job._id,
          type: 'APPLIED',
        },
      },
      { upsert: true, session },
    );

    // 6. Update student lightweight history
    student.appliedJobs.push({
      job: job._id,
      application: application[0]._id,
      appliedAt: new Date(),
    });

    await student.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application[0]._id,
    });
  } catch (err) {
    await session.abortTransaction();

    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to apply',
    });
  } finally {
    session.endSession();
  }
};
