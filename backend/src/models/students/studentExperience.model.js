// src/models/studentExperience.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Students', index: true },
    experienceId: { type: String, required: true },

    company: String,
    title: String,
    designation: String,
    location: String,

    employmentType: {
      type: String,
      enum: [
        'FULL-TIME',
        'PART-TIME',
        'SELF-EMPLOYED',
        'FREELANCE',
        'INTERNSHIP',
        'CONTRACT',
        'APPRENTICESHIP',
      ],
      default: 'FULL-TIME',
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
