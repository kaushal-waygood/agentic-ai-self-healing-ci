// models/AppliedJob.js
import { Schema, model } from 'mongoose';

const appliedJobSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    applicationDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        'APPLIED',
        'SELECTED',
        'REJECTED',
        'INTERVIEW',
        'CANCELLED',
        'SHORTLISTED',
      ],
      default: 'APPLIED',
    },

    applicationMethod: {
      type: String,
      enum: ['AUTOPILOT', 'MANUAL'],
      required: true,
    },

    cvLink: String,
    coverLetterLink: String,

    // ✅ NEW: Screening answers
    screeningAnswers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        question: String,
        answer: Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true },
);

appliedJobSchema.index({ student: 1, job: 1 }, { unique: true });

export const AppliedJob = model('AppliedJob', appliedJobSchema);
