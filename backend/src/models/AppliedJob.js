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
      // required: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'ACCEPTED', 'REJECTED', 'INTERVIEW', 'CANCELED'],
      default: 'APPLIED',
    },
    applicationMethod: {
      type: String,
      enum: ['AUTOPILOT', 'MANUAL'],
      required: true,
    },
    // Optional: store the AI-generated cover letter or CV link
    coverLetterLink: String,
    cvLink: String,
  },
  { timestamps: true },
);

// This ensures a student cannot apply to the same job twice
appliedJobSchema.index({ student: 1, job: 1 }, { unique: true });

export const AppliedJob = model('AppliedJob', appliedJobSchema);
