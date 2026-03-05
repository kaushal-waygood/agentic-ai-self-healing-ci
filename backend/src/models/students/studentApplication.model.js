// src/models/studentApplication.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', index: true },

    jobTitle: String,
    jobCompany: String,
    jobDescription: String,

    status: {
      type: String,
      enum: [
        'Draft',
        'Applied',
        'Interviewing',
        'Offered',
        'Rejected',
        'Failed',
      ],
      default: 'Draft',
    },

    cvContent: String,
    coverLetterContent: String,
    emailContent: String,
    completedAt: Date,
  },
  { timestamps: true },
);

export const StudentApplication = model('StudentApplication', schema);
