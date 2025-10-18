// src/models/queueJob.model.js
import mongoose from 'mongoose';

const queueJobSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'find-recommended-jobs',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    error: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const QueueJob = mongoose.model('QueueJob', queueJobSchema);
