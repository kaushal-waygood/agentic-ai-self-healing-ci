import { Schema, model } from 'mongoose';

const studentSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // password: {
    //   type: String,
    //   required: true,
    // },

    // Basic Info
    phone: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    resumeUrl: {
      type: String, // URL to uploaded resume
    },

    education: [
      {
        educationId: {
          type: String,
          required: true,
        },
        institute: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        grade: String,
        isCurrentlyStudying: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Work Experience (if any)
    experience: [
      {
        experienceId: {
          type: String,
          required: true,
        },
        company: String,
        title: String,
        startDate: Date,
        endDate: Date,
        description: String,
        currentlyWorking: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Job-Related Preferences
    jobRole: {
      type: String,
    },

    skills: [
      {
        skillId: { type: String, required: true, unique: true },
        skill: {
          type: String,
        },
        level: {
          type: String,
          enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        },
      },
    ],

    preferredLocations: [String],

    // Application Info
    appliedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    savedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
  },
  { timestamps: true },
);

export const Student = model('Student', studentSchema);
