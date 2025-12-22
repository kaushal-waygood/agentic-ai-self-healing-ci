// src/models/student.model.js
import { Schema, model } from 'mongoose';

const studentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    fullName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: String,
    profileImage: String,
    resumeUrl: String,
    uploadedCV: String,

    jobRole: String,
    location: { type: String, trim: true },

    hasCompletedOnboarding: { type: Boolean, default: false },

    jobPreferences: { type: Object, default: {} },

    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },

    settings: {
      autopilotEnabled: { type: Boolean, default: false },
      autopilotLimit: { type: Number, default: 5 },
    },

    autopilotAgent: [Object],

    appliedJobs: [Object],
    savedJobs: [Object],
    viewedJobs: [Object],
    visitedJobs: [Object],

    tours: {
      type: Map,
      of: new Schema(
        {
          currentStep: Number,
          completed: Boolean,
          updatedAt: Date,
        },
        { _id: false },
      ),
      default: {},
    },

    isActive: { type: Boolean, default: true },
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
  },
  { timestamps: true },
);

export const Student = model('Student', studentSchema);
