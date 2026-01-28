// src/models/studentEducation.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Students', index: true },
    educationId: { type: String, required: true },

    institute: String,
    degree: String,
    fieldOfStudy: String,
    country: String,

    startDate: String,
    endDate: String,
    grade: String,

    isCurrentlyStudying: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const StudentEducation = model('StudentEducation', schema);
