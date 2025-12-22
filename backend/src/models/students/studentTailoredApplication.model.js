// src/models/studentTailoredApplication.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },

    jobTitle: String,
    companyName: String,
    jobDescription: String,

    useProfile: { type: Boolean, default: true },
    savedCVId: String,
    savedCoverLetterId: String,

    finalTouch: String,
    coverLetterText: String,

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },

    tailoredCV: Object,
    tailoredCoverLetter: Object,
    applicationEmail: Object,

    error: String,
    flag: { type: String, enum: ['web', 'app', 'extension'] },

    completedAt: Date,
  },
  { timestamps: true },
);

export const StudentTailoredApplication = model(
  'StudentTailoredApplication',
  schema,
);
