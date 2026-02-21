// src/models/studentCoverLetter.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    coverLetter: String,
    coverLetterTitle: String,
  },
  { timestamps: true },
);

export const StudentCoverLetter = model('StudentCoverLetter', schema);
