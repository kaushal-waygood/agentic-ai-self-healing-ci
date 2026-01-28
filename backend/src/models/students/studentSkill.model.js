// src/models/studentSkill.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Students', index: true },
    skillId: { type: String, required: true },

    skill: { type: String, required: true },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      default: 'INTERMEDIATE',
    },

    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

schema.index({ student: 1, skill: 1 }, { unique: true });

export const StudentSkill = model('StudentSkill', schema);
