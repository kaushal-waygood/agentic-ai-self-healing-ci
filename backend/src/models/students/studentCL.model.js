// src/models/studentCL.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Students', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },

    status: { type: String, enum: ['pending', 'completed', 'failed'] },
    flag: { type: String, enum: ['web', 'app', 'extension'] },

    clTitle: String,
    jobContextString: String,
    finalTouch: String,

    clData: Object,
    error: String,

    completedAt: Date,
  },
  { timestamps: true },
);

export const StudentCL = model('StudentCL', schema);
