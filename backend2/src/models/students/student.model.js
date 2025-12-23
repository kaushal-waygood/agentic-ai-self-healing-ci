import mongoose, { Schema } from 'mongoose';

const studentSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,

    profileImage: String,
    resumeUrl: String,

    jobRole: String,
    location: String,

    hasCompletedOnboarding: { type: Boolean, default: false },

    jobPreferences: {
      preferredJobTypes: [String],
      preferredCities: [String],
      preferredCountries: [String],
      preferredSalary: {
        min: Number,
        currency: String,
        period: String,
      },
      immediateAvailability: Boolean,
      isRemote: Boolean,
    },

    settings: {
      autopilotEnabled: { type: Boolean, default: false },
      autopilotLimit: { type: Number, default: 5 },
    },

    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false },
);

export const Student =
  mongoose.models.Student || mongoose.model('Students', studentSchema);
