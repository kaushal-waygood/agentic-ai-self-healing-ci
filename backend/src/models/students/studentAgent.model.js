import { Schema, model } from 'mongoose';

const educationSchema = new Schema({
  educationId: String,
  institute: String,
  degree: String,
  fieldOfStudy: String,
  startDate: String,
  endDate: String,
  grade: String,
  isCurrentlyStudying: Boolean,
});

const experienceSchema = new Schema({
  experienceId: String,
  company: String,
  title: String,
  employmentType: String,
  location: String,
  startDate: String,
  endDate: String,
  description: String,
  currentlyWorking: Boolean,
});

const skillSchema = new Schema({
  skillId: String,
  skill: String,
  level: String,
});

const projectSchema = new Schema({
  projectName: String,
  description: String,
  technologies: [String],
  link: String,
  startDate: String,
  endDate: String,
});

const autopilotAgentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    agentId: { type: String, unique: true, index: true },

    agentName: String,
    jobTitle: String,
    country: String,
    city: String,
    jobDescription: String,
    isAgentActive: { type: Boolean, default: true },
    lastDiscoveryRunAt: Date,
    lastDiscoveryActiveCount: Number,
    lastDiscoveryTargetLimit: Number,

    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },

    agentDailyLimit: { type: Number, default: 5 },
    keywords: [String],
    isRemote: Boolean,
    isOnsite: Boolean,
    employmentType: String,

    cvOption: {
      type: String,
      enum: ['current_profile', 'uploaded_pdf', 'saved_cv'],
    },
    selectedCVId: String,
    selectedCVSource: { type: String, enum: ['saved', 'generated'] },
    selectedCVTitle: String,
    coverLetterStrategy: { type: String, enum: ['generate', 'template'] },
    selectedCoverLetterId: String,
    selectedCoverLetterSource: { type: String, enum: ['saved', 'generated'] },
    selectedCoverLetterTitle: String,
    coverLetterInstructions: String,

    uploadedCVData: {
      education: [educationSchema],
      experience: [experienceSchema],
      skills: [skillSchema],
      projects: [projectSchema],
      jobRole: String,
    },
  },
  { timestamps: true },
);

export const StudentAgent = model('StudentAgent', autopilotAgentSchema);
