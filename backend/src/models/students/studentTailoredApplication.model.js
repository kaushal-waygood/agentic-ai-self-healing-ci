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
    retryCount: { type: Number, default: 0 },
    flag: { type: String, enum: ['web', 'app', 'extension', 'agent'] },

    completedAt: Date,
  },
  { timestamps: true },
);

schema.index({ student: 1, createdAt: -1 });

export const StudentTailoredApplication = model(
  'StudentTailoredApplication',
  schema,
);
