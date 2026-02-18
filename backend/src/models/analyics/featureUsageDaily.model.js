import mongoose, { Schema } from 'mongoose';

const featureUsageDailySchema = new Schema(
  {
    date: {
      type: String,
      required: true,
      index: true,
    },

    feature: {
      type: String,
      enum: [
        'cvCreation',
        'coverLetter',
        'aiApplication',
        'aiAutoApply',
        'atsScore',
        'jobMatching',
      ],
      required: true,
      index: true,
    },

    totalUsage: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },

    freeUsersUsage: { type: Number, default: 0 },
    paidUsersUsage: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

featureUsageDailySchema.index({ date: 1, feature: 1 }, { unique: true });

export const FeatureUsageDaily = mongoose.model(
  'FeatureUsageDaily',
  featureUsageDailySchema,
);
