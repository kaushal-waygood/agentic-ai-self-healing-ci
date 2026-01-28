// src/models/studentCV.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Students', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },

    status: { type: String, enum: ['pending', 'completed', 'failed'] },
    flag: { type: String, enum: ['web', 'app', 'extension'] },
    template: {
      type: String,
      enum: [
        'classic',
        'modern',
        'minimal',
        'executive',
        'compact',
        'academic',
        'tech',
        'government',
        'sales',
        'legal',
        'student',
      ],
    },

    cvTitle: String,
    jobContextString: String,
    finalTouch: String,

    cvData: Object,
    error: String,

    completedAt: Date,
  },
  { timestamps: true },
);

export const StudentCV = model('StudentCV', schema);
