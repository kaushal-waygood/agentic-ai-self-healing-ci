// src/models/studentHtmlCV.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    html: String,
    htmlCVTitle: String,
    ats: String,
    template: String,
  },
  { timestamps: true },
);

export const StudentHtmlCV = model('StudentHtmlCV', schema);
