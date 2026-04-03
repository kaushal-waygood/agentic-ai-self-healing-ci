import { Schema, model } from 'mongoose';

const assistantFoundJobSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'NOT_INTERESTED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    assistantMode: {
      type: String,
      default: 'find_jobs',
    },
    rankScore: {
      type: Number,
      default: null,
    },
    matchPercent: {
      type: Number,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    foundAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

assistantFoundJobSchema.index({ student: 1, job: 1 }, { unique: true });

export const AssistantFoundJob = model(
  'AssistantFoundJob',
  assistantFoundJobSchema,
);
