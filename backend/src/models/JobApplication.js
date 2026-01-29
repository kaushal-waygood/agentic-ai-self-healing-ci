import { Schema, model } from 'mongoose';

const jobApplicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },

    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },

    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'INTERVIEW',
        'REJECTED',
        'HIRED',
        'WITHDRAWN',
      ],
      default: 'SUBMITTED',
      index: true,
    },

    source: {
      type: String,
      enum: ['web', 'app', 'extension'],
      default: 'web',
    },

    resume: {
      type: {
        type: String,
        enum: ['SAVED', 'UPLOADED'],
        required: true,
      },
      refId: String, // htmlCV._id OR file id
      url: String,
    },

    coverLetter: {
      type: {
        type: String,
        enum: ['SAVED', 'UPLOADED', 'NONE'],
        default: 'NONE',
      },
      refId: String,
      url: String,
    },

    screeningAnswers: [
      {
        question: String,
        answer: Schema.Types.Mixed,
      },
    ],

    assignmentSubmission: {
      type: {
        type: String,
        enum: ['TEXT', 'FILE'],
      },
      text: String,
      fileUrl: String,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

// One application per job per user
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const JobApplication = model('JobApplication', jobApplicationSchema);
