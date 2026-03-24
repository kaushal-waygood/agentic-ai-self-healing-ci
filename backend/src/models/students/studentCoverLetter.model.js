// src/models/studentCoverLetter.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    coverLetter: String,
    coverLetterTitle: String,
  },
  { timestamps: true },
);

export const StudentCoverLetter = model('StudentCoverLetter', schema);
