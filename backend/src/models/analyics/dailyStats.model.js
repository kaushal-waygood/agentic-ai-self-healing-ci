import mongoose, { Schema } from 'mongoose';

const dailyStatsSchema = new Schema(
  {
    date: {
      type: String, // "2026-02-13"
      required: true,
      unique: true,
      index: true,
    },

    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },

    totalSessions: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },

    totalJobViews: { type: Number, default: 0 },
    totalApplies: { type: Number, default: 0 },
    totalSaves: { type: Number, default: 0 },

    totalCvCreated: { type: Number, default: 0 },
    totalAiApplications: { type: Number, default: 0 },

    newPaidUsers: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    conversionRate: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

export const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);
