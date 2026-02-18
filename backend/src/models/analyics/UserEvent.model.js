import mongoose, { Schema } from 'mongoose';

const userEventSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    accountType: {
      type: String,
      index: true,
    },

    role: {
      type: String,
      index: true,
    },

    eventType: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'PAGE_VIEW',
        'JOB_VIEW',
        'JOB_APPLY',
        'JOB_SAVE',
        'SEARCH',
        'CV_CREATED',
        'COVER_LETTER_CREATED',
        'AI_APPLICATION',
        'AUTOPILOT_RUN',
        'ATS_SCORE_CHECK',
        'PLAN_PURCHASE',
        'LOGOUT',
      ],
      index: true,
    },

    page: String,

    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      index: true,
    },

    metadata: {
      searchQuery: String,
      source: String,
      device: String,
      browser: String,
      location: String,
    },

    duration: {
      type: Number, // ms (for PAGE_VIEW)
      default: 0,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  },
);

userEventSchema.index({ userId: 1, timestamp: -1 });
userEventSchema.index({ eventType: 1, timestamp: -1 });

export const UserEvent = mongoose.model('UserEvent', userEventSchema);
