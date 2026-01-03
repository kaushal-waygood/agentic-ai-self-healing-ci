import { Worker } from 'bullmq';
import mongoose from 'mongoose';

import { bullmqConnection } from '../queues/bullmq.connection.js';
import { StudentApplication } from '../models/students/studentApplication.model.js';
import { User } from '../models/User.model.js';

import { buildJobContextString } from '../utils/jobContext.js';
import { processTailoredApplication } from '../utils/tailored.autopilot.js';

new Worker(
  'tailored-application-queue',
  async (job) => {
    const { studentId, userId, job: jobData, effectiveStudent } = job.data;

    try {
      const application = await StudentApplication.create({
        student: studentId,
        jobTitle: jobData.title,
        jobCompany: jobData.company,
        jobDescription: jobData.description,
        status: 'Draft',
      });

      await processTailoredApplication(
        studentId,
        application._id,
        {
          job: {
            ...jobData,
            jobContextString: buildJobContextString(jobData),
          },
          candidate: JSON.stringify(effectiveStudent),
          preferences: '',
        },
        null,
      );

      await StudentApplication.updateOne(
        { _id: application._id },
        { $set: { status: 'Applied' } },
      );
    } catch (err) {
      // FINAL FAILURE → REFUND CREDIT
      if (job.attemptsMade + 1 >= job.opts.attempts) {
        await User.updateOne(
          { _id: userId },
          {
            $inc: { credits: 1 },
            $push: {
              creditTransactions: {
                type: 'ADJUST',
                amount: 1,
                kind: 'AUTOPILOT_REFUND',
                meta: { jobId: job.id },
              },
            },
          },
        );
      }
      throw err; // REQUIRED for BullMQ retry
    }
  },
  {
    connection: bullmqConnection,
    concurrency: 3,
  },
);
