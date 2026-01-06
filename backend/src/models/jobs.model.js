import { Schema, model } from 'mongoose';
import slugify from 'slugify';

const jobSchema = new Schema(
  {
    // --- Core Identifiers ---
    jobId: { type: String, required: true, unique: true },
    origin: { type: String, enum: ['HOSTED', 'EXTERNAL'], required: true },
    slug: { type: String, unique: true },

    // --- Job Details ---
    title: { type: String, required: true },
    description: { type: String, required: true },
    responsibilities: [String],
    qualifications: [String],
    experience: { type: [String], default: [] },
    jobTypes: [String],

    // human-readable string from API ("11 days ago")
    jobPosted: { type: String },
    // REAL date for sorting
    jobPostedAt: { type: Date },

    // --- Company & Application ---
    company: { type: String },
    logo: { type: String },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: function () {
        return this.origin === 'HOSTED';
      },
    },
    applyMethod: {
      method: { type: String, enum: ['EMAIL', 'URL'] },
      email: { type: String },
      url: { type: String },
    },

    // --- Compensation ---
    salary: {
      min: { type: Number },
      max: { type: Number },
      period: { type: String, enum: ['HOUR', 'DAY', 'MONTH', 'YEAR'] },
    },

    // --- Location ---
    country: { type: String },
    location: {
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },

    contractLength: {
      value: { type: Number },
      type: { type: String, enum: ['MONTHS', 'YEARS'] },
    },
    resumeRequired: { type: Boolean, default: true },
    remote: { type: Boolean, default: false },
    jobAddress: { type: String },

    // --- NEW: Screening Questions ---
    screeningQuestions: [
      {
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ['text', 'boolean', 'number', 'date'],
          default: 'text',
        },
        required: { type: Boolean, default: true },
      },
    ],

    // --- NEW: Candidate Assignment ---
    assignment: {
      isEnabled: { type: Boolean, default: false },
      type: { type: String, enum: ['MANUAL', 'FILE'] }, // Manual text or File upload required from candidate
      instruction: { type: String }, // The text question or instructions
      fileUrl: { type: String }, // Optional: Link to a brief/PDF uploaded by the recruiter
    },

    // --- Metadata ---
    tags: [String],
    queries: [{ type: String, index: true }],
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    job_embedding: {
      type: [Number],
      index: true,
    },
    embeddingHash: {
      type: String,
      index: true,
    },
  },
  { timestamps: true, strict: true },
);

// --- Indexes ---
jobSchema.index({
  origin: 1,
  isActive: 1,
  country: 1,
  'location.state': 1,
  'location.city': 1,
});
jobSchema.index({ origin: 1, isActive: 1, jobTypes: 1 });
jobSchema.index({ origin: 1, isActive: 1, tags: 1 });
jobSchema.index({ origin: 1, isActive: 1, jobPostedAt: -1 });

// --- Slug Middleware ---
jobSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = slugify(this.title || 'job', {
      lower: true,
      strict: true,
      trim: true,
    });
    const randomPart = Math.random().toString(36).slice(2, 8);
    this.slug = `${baseSlug}-${randomPart}`;
  }
  next();
});

export const Job = model('Job', jobSchema);
