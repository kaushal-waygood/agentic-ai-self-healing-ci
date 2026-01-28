// src/models/studentApplication.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Students', index: true },

    jobTitle: String,
    jobCompany: String,
    jobDescription: String,

    status: {
      type: String,
      enum: ['Draft', 'Applied', 'Interviewing', 'Offered', 'Rejected'],
      default: 'Draft',
    },

    cvContent: String,
    coverLetterContent: String,
    emailContent: String,
  },
  { timestamps: true },
);

export const StudentApplication = model('StudentApplication', schema);
