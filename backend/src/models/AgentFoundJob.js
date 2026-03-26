import { Schema, model } from 'mongoose';

const agentFoundJobSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'StudentAgent',
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
    foundAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

agentFoundJobSchema.index({ student: 1, agent: 1, job: 1 }, { unique: true });

export const AgentFoundJob = model('AgentFoundJob', agentFoundJobSchema);
