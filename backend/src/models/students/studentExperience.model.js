// src/models/studentExperience.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    experienceId: { type: String, required: true },

    company: String,
    title: String,
    designation: String,
    location: String,

    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'],
      default: 'FULL_TIME',
    },

    experienceYrs: Number,
    startDate: String,
    endDate: String,

    currentlyWorking: { type: Boolean, default: false },
    description: String,

    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const StudentExperience = model('StudentExperience', schema);
