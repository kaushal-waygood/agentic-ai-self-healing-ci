import mongoose, { Schema } from 'mongoose';

const sessionSchema = new Schema(
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
      unique: true,
    },

    startedAt: {
      type: Date,
      required: true,
      index: true,
    },

    endedAt: Date,

    duration: {
      type: Number,
      default: 0,
    },

    pagesVisited: { type: Number, default: 0 },
    jobViews: { type: Number, default: 0 },
    applies: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    searches: { type: Number, default: 0 },

    device: String,
    browser: String,
    location: String,
  },
  { timestamps: true, versionKey: false },
);

sessionSchema.index({ userId: 1, startedAt: -1 });

export const Session = mongoose.model('Session', sessionSchema);
