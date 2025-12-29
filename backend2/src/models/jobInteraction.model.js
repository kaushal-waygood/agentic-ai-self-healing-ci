import { Schema, model } from 'mongoose';

const jobInteractionSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
      index: true,
    },
    query: {
      type: String,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['impression', 'click', 'apply'],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for analytics queries
jobInteractionSchema.index({ jobId: 1, action: 1, createdAt: -1 });

export const JobInteraction = model('JobInteraction', jobInteractionSchema);
