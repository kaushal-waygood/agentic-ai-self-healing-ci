// src/models/studentProject.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },

    projectName: String,
    description: String,
    technologies: [String],
    link: String,

    startDate: Date,
    endDate: Date,
    isWorkingActive: { type: Boolean, default: false },

    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const StudentProject = model('StudentProject', schema);
