import { Schema, model } from 'mongoose';

const jobPreferenceSchema = new Schema({
  // Location Preferences
  preferedCountries: {
    type: [String],
    default: [],
  },
  preferedCities: {
    type: [String],
    default: [],
  },
  isRemote: {
    type: Boolean,
    default: false,
  },
  relocationWillingness: {
    type: String,
    default: false,
  },

  // Job Details
  preferedJobTitles: {
    type: [String],
    default: [],
  },
  preferedJobTypes: {
    type: [String],
    default: ['FULL_TIME'],
  },
  preferedIndustries: {
    type: [String],
    default: [],
  },
  preferedExperienceLevel: {
    type: String,

    default: null,
  },

  // Compensation
  preferedSalary: {
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    period: {
      type: String,
      enum: ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR', null],
      default: 'YEAR',
    },
  },

  // Skills & Qualifications
  mustHaveSkills: [
    {
      skill: String,
      level: {
        type: String,
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      },
    },
  ],
  niceToHaveSkills: [
    {
      skill: String,
      level: {
        type: String,
        // enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      },
    },
  ],
  preferedCertifications: {
    type: [String],
    default: [],
  },
  preferedEducationLevel: {
    type: String,
    // enum: ['HIGHSCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD', null],
    default: null,
  },

  // Company Preferences
  preferedCompanySizes: {
    type: [String],
    // enum: ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE', null],
    default: [],
  },
  preferedCompanyCultures: {
    type: [String],
    default: [],
  },

  // Additional Preferences
  visaSponsorshipRequired: {
    type: Boolean,
    default: false,
  },
  immediateAvailability: {
    type: Boolean,
    default: false,
  },
});

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
        experienceYrs: {
          type: Number,
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

    jobRole: {
      type: String,
    },

    skills: [
      {
        skillId: { type: String, unique: true, index: true },
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

    jobPreferences: {
      type: jobPreferenceSchema,
      default: () => ({}), // Use a function to ensure new objects
      select: true, // Explicitly include in queries
    },
    // Application Info
    appliedJobs: [
      {
        job: {
          type: Schema.Types.ObjectId,
          ref: 'Job',
        },

        status: {
          type: String,
          default: 'applied',
        },

        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    savedJobs: [
      {
        job: {
          type: Schema.Types.ObjectId,
          ref: 'Job',
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
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

studentSchema.index({ 'skills.skillId': 1 }, { unique: false });

export const Student = model('Student', studentSchema);
