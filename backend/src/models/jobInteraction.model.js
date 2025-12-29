import { Schema, model } from 'mongoose';

const jobInteractionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },

    // What kind of interaction this is
    type: {
      type: String,
      enum: ['IMPRESSION', 'VIEW', 'CLICK', 'SAVED', 'APPLIED', 'VISIT'],
      required: true,
      index: true,
    },

    // Only relevant for APPLIED interactions
    status: {
      type: String,
      enum: ['APPLIED', 'REJECTED', 'HIRED', 'WITHDRAWN'],
      default: 'APPLIED',
    },

    // Optional analytics metadata
    meta: {
      query: { type: String, trim: true },
      source: { type: String }, // search, recommendation, external, etc.
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate stateful interactions
jobInteractionSchema.index(
  { user: 1, job: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: { $in: ['SAVED', 'APPLIED'] },
    },
  },
);

// Fast analytics queries
jobInteractionSchema.index({ job: 1, type: 1, createdAt: -1 });
jobInteractionSchema.index({ user: 1, type: 1, createdAt: -1 });

export const JobInteraction = model('JobInteraction', jobInteractionSchema);
