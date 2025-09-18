import { Schema, model } from 'mongoose';

const bugReportSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
    },
    bugTitle: {
      type: String,
      required: [true, 'Bug title is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    attachments: {
      type: [String], // An array of strings for Cloudinary URLs
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

export const BugReport = model('BugReport', bugReportSchema);
