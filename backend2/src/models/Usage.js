import { Schema, model } from 'mongoose';

const usageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    feature: {
      type: String,
      required: true,
      enum: ['cv-creation', 'cover-letter', 'ai-application', 'auto-apply'],
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    creditsUsed: {
      type: Number,
      default: 1,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index for efficient querying
usageSchema.index({ user: 1, feature: 1, createdAt: -1 });

export const Usage = model('Usage', usageSchema);
