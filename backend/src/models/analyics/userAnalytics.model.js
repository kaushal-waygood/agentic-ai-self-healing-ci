import mongoose, { Schema } from 'mongoose';

const userAnalyticsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    totalSessions: { type: Number, default: 0 },
    totalJobViews: { type: Number, default: 0 },
    totalApplies: { type: Number, default: 0 },
    totalSaves: { type: Number, default: 0 },

    totalCvCreated: { type: Number, default: 0 },
    totalAiApplications: { type: Number, default: 0 },
    totalAutopilotRuns: { type: Number, default: 0 },
    totalAtsChecks: { type: Number, default: 0 },

    avgSessionDuration: { type: Number, default: 0 },

    engagementScore: { type: Number, default: 0 },

    lastActiveAt: { type: Date, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const UserAnalytics = mongoose.model(
  'UserAnalytics',
  userAnalyticsSchema,
);
