// src/models/jobInteraction.model.js
import { Schema, model } from 'mongoose';

const jobInteractionSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
    query: { type: String },
    action: {
      type: String,
      enum: ['impression', 'click', 'apply'],
      required: true,
    },
  },
  { timestamps: true },
);

jobInteractionSchema.index({ jobId: 1, action: 1 });
jobInteractionSchema.index({ query: 1 });

export const JobInteraction = model('JobInteraction', jobInteractionSchema);
