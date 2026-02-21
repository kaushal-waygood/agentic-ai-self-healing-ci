import mongoose, { Schema } from 'mongoose';

const jobAnalyticsSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      unique: true,
      index: true,
    },

    totalViews: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    totalApplies: { type: Number, default: 0 },
    totalSaves: { type: Number, default: 0 },

    conversionRate: { type: Number, default: 0 },

    lastUpdated: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const JobAnalytics = mongoose.model('JobAnalytics', jobAnalyticsSchema);
