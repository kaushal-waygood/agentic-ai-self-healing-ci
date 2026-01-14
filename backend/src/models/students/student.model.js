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

    profileImage: {
      type: String,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: null,
    },

    jobRole: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },

    hasCompletedOnboarding: { type: Boolean, default: false },

    jobPreferences: {
      preferredJobTypes: {
        type: [String],
        default: [],
      },
      preferredCities: {
        type: [String],
        default: [],
      },

      preferredCountries: {
        type: String,
        default: null,
      },
      // mustHaveSkills: {
      //   type: [String],
      //   default: null,
      // },
      preferredSalary: {
        min: {
          type: Number,
          default: null,
        },
        currency: {
          type: String,
          default: null,
        },
        period: {
          type: String,
          default: null,
        },
      },
      immediateAvailability: {
        type: Boolean,
        default: false,
      },
      isRemote: {
        type: Boolean,
        default: false,
      },
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
