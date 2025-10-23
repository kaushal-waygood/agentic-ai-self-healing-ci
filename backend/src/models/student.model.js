import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Sub-schemas
const jobPreferenceSchema = new Schema({
  preferredCountries: { type: [String] },
  preferredCities: { type: [String] },
  isRemote: { type: Boolean, default: false },
  relocationWillingness: { type: String, default: false },
  preferredJobTitles: { type: [String], default: [] },
  preferredJobTypes: { type: [String], default: ['FULL_TIME'] },
  preferredIndustries: { type: [String], default: [] },
  preferredExperienceLevel: { type: String, default: null },
  preferredSalary: {
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    currency: { type: String, default: 'USD' },
    period: {
      type: String,
      enum: ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR', null],
      default: 'YEAR',
    },
  },
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
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      },
    },
  ],
  preferredCertifications: { type: [String], default: [] },
  preferredEducationLevel: { type: String, default: null },
  preferredCompanySizes: { type: [String], default: [] },
  preferredCompanyCultures: { type: [String], default: [] },
  visaSponsorshipRequired: { type: Boolean, default: false },
  immediateAvailability: { type: Boolean, default: false },
});

const tokenSchema = new Schema({
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number,
});

const educationSchema = new Schema({
  educationId: { type: String, required: true },
  institute: String,
  degree: String,
  fieldOfStudy: String,
  startDate: String,
  endDate: String,
  grade: String,
  country: String,
  isCurrentlyStudying: { type: Boolean, default: false },
});

const experienceSchema = new Schema({
  experienceId: { type: String, required: true },
  company: String,
  title: String,
  employmentType: { type: String, default: 'FULL_TIME' },
  location: String,
  experienceYrs: Number,
  designation: String,
  startDate: String,
  endDate: String,
  description: String,
  currentlyWorking: { type: Boolean, default: false },
});

const skillSchema = new Schema({
  skillId: { type: String, required: true },
  skill: String,
  level: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    default: 'INTERMEDIATE',
  },
});

const projectSchema = new Schema({
  projectName: String,
  description: String,
  startDate: Date,
  endDate: Date,
  technologies: [String],
  link: String,
  isWorkingActive: { type: Boolean, default: false },
});

const autopilotAgentSchema = new Schema({
  autopilotEnabled: { type: Boolean, default: false },
  autopilotLimit: { type: Number, default: 5 },
  agentName: String,
  agentId: String,
  jobTitle: String,
  jobLocation: String,
  jobDescription: String,
  jobLink: String,
  country: String,
  isRemote: { type: Boolean, default: false },
  isOnsite: { type: Boolean, default: false },
  employmentType: {
    type: String,
    // enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'],
  },
  cvOption: {
    type: String,
    enum: ['current_profile', 'uploaded_pdf'],
    default: 'current_profile',
  },
  uploadedCVData: {
    education: [educationSchema],
    experience: [experienceSchema],
    jobRole: String,
    skills: [skillSchema],
    projects: [projectSchema],
  },
});

const htmlCVSchema = new Schema({
  html: String,
  htmlCVTitle: String,
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const coverLetterSchema = new Schema({
  coverLetter: String,
  coverLetterTitle: String,
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const applicationSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    jobCompany: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },

    // --- Other fields remain the same ---
    status: {
      type: String,
      enum: ['Draft', 'Applied', 'Interviewing', 'Offered', 'Rejected'],
      default: 'Draft',
    },
    cvContent: {
      type: String,
      required: true,
    },
    coverLetterContent: {
      type: String,
      required: true,
    },
    emailContent: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Main schema
const studentSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    token: tokenSchema,
    phone: String,
    profileImage: String,
    resumeUrl: String,
    education: [educationSchema],
    experience: [experienceSchema],
    jobRole: String,
    skills: [skillSchema],
    projects: [projectSchema],
    applications: [applicationSchema],
    jobPreferences: {
      type: jobPreferenceSchema,
      default: () => ({}),
      select: true,
    },
    appliedJobs: [
      {
        job: { type: Schema.Types.ObjectId, ref: 'Job' },
        status: { type: String, default: 'applied' },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    savedJobs: [
      {
        _id: false, // Prevents creating a separate _id for this sub-document
        job: {
          type: Schema.Types.ObjectId,
          ref: 'Job',
          required: true,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    viewedJobs: [
      {
        _id: false,
        job: {
          type: Schema.Types.ObjectId,
          ref: 'Job', // Now, Mongoose knows what 'Job' is.
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    visitedJobs: [
      {
        _id: false,
        job: {
          type: Schema.Types.ObjectId,
          ref: 'Job', // Reference to the Job model
          required: true,
        },
        visitedAt: {
          type: Date,
          default: Date.now,
        },
        // The isVisited field is removed as it's redundant
      },
    ],

    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    settings: {
      autopilotEnabled: { type: Boolean, default: false },
      autopilotLimit: { type: Number, default: 5 },
    },
    autopilotAgent: [autopilotAgentSchema],
    isActive: { type: Boolean, default: true },
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    htmlCV: [htmlCVSchema],
    coverLetter: [coverLetterSchema],
  },
  { timestamps: true },
);

export const Student = model('Student', studentSchema);
