// models/Usage.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const usageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    feature: { type: String, required: true }, // keep flexible (e.g. "cv-creation", "cover-letter")
    action: { type: String, required: false }, // optional: action name or reason
    details: { type: Schema.Types.Mixed, required: false }, // store any extra metadata/json
    creditsUsed: { type: Number, required: true, default: 1, min: 0 },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
    // optional: link to purchase or operation id if you want to trace
    referenceId: { type: String, required: false },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  },
);

// Compound index to help common queries (user + createdAt range or feature)
usageSchema.index({ user: 1, createdAt: -1 });
usageSchema.index({ feature: 1, createdAt: -1 });

// A tiny helper to summarize usage for a given user + feature + period
/**
 * Usage.getUsageCount(userId, feature, { startDate, endDate })
 * returns total creditsUsed (Number)
 */
usageSchema.statics.getUsageCount = async function (
  userId,
  feature,
  { startDate, endDate } = {},
) {
  const match = { user: mongoose.Types.ObjectId(userId) };
  if (feature) match.feature = feature;
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const res = await this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$creditsUsed' } } },
  ]);

  return (res[0] && res[0].total) || 0;
};

export const Usage = model('Usage', usageSchema);
export default Usage;
