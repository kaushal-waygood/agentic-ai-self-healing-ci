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
        startDate: String,
        endDate: String,
        grade: String,
        country: String,
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
        employmentType: {
          type: String,
          enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
          default: 'FULL_TIME',
        },
        location: {
          type: String,
        },
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
          enum: ['BEGINNER', 'INTERMEDIATE', 'EXPERT'],
        },
      },
    ],

    projects: [
      {
        projectName: String,
        description: String,
        startDate: Date,
        endDate: Date,
        technologies: [String],
        link: String,
        isWorkingActive: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Location Preferences
    preferredCities: [String],
    preferredStates: [String],
    preferredCountries: [String],
    preferredPostalCodes: [String],
    preferredAddress: {
      type: String,
    },
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
    htmlCV: [
      {
        html: {
          type: String,
        },
        htmlCVTitle: {
          type: String,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    coverLetter: [
      {
        coverLetter: {
          type: String,
        },
        coverLetterTitle: {
          type: String,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export const Student = model('Student', studentSchema);
