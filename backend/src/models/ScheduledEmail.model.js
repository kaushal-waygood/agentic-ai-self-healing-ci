import mongoose from 'mongoose';

const scheduledEmailSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: 'Job Application',
    },
    bodyHtml: {
      type: String,
      default: '',
    },
    coverLetterHtml: {
      type: String,
      default: null,
    },
    /** Scheduled send time (UTC) */
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    /** IANA timezone name, stored for reference */
    timezone: {
      type: String,
      default: 'UTC',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    /** Error message if the send attempt failed */
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export const ScheduledEmail = mongoose.model(
  'ScheduledEmail',
  scheduledEmailSchema,
);
