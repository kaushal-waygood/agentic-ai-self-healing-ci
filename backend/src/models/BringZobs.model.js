import { Schema, model } from 'mongoose';

const bringZobsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['UNIVERSITY', 'COMPANY'], // 'STUDENT' here likely refers to TPO/Uni rep
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    organizationDetails: {
      name: { type: String }, // Company Name or University Name
      size: { type: String }, // e.g., "1-10", "11-50"
      industry: { type: String },
      website: { type: String },
      description: { type: String },
      address: { type: String },
    },

    freeJobPosted: {
      isPosted: { type: Boolean, default: false },
      jobId: { type: Schema.Types.ObjectId, ref: 'Job' }, // Assuming you have a Job model
    },

    documentUrl: { type: String }, // The file path

    onboardingStep: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
      // 0: Initial Request (Email Sent)
      // 1: Details Filled
      // 2: Free Job Posted
      // 3: Documents Uploaded (Verification Pending)
    },

    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true },
);

export const BringZobs = model('BringZobs', bringZobsSchema);
