import mongoose, { Schema } from 'mongoose';

const loginHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for failed attempts when user doesn't exist
      index: true,
    },

    sessionId: {
      type: String,
      index: true,
    },

    ipAddress: {
      type: String,
      required: true,
    },

    userAgent: String,
    device: String,
    browser: String,
    os: String,

    location: {
      country: String,
      city: String,
    },

    loginMethod: {
      type: String,
      enum: ['google', 'local', 'firebase', 'linkedin'],
      default: 'local',
    },

    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'LOGOUT'],
      required: true,
      index: true,
    },

    logoutAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

loginHistorySchema.index({ userId: 1, createdAt: -1 });

export const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
