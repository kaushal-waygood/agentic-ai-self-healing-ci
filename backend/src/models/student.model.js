import { Schema, model } from 'mongoose';

// Sub-schemas
const jobPreferenceSchema = new Schema({
  preferedCountries: { type: [String], default: [] },
  preferedCities: { type: [String], default: [] },
  isRemote: { type: Boolean, default: false },
  relocationWillingness: { type: String, default: false },
  preferedJobTitles: { type: [String], default: [] },
  preferedJobTypes: { type: [String], default: ['FULL_TIME'] },
  preferedIndustries: { type: [String], default: [] },
  preferedExperienceLevel: { type: String, default: null },
  preferedSalary: {
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
  preferedCertifications: { type: [String], default: [] },
  preferedEducationLevel: { type: String, default: null },
  preferedCompanySizes: { type: [String], default: [] },
  preferedCompanyCultures: { type: [String], default: [] },
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
  skillId: { type: String, index: true, sparse: true },
  skill: String,
  level: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'], // Added 'ADVANCED'
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
        job: { type: Schema.Types.ObjectId, ref: 'Job' },
        savedAt: { type: Date, default: Date.now },
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
