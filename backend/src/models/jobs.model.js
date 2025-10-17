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
    qualifications: [String], // KEPT: This is the correct field for qualifications
    experience: { type: [String], default: [] },
    jobTypes: [String], // REMOVED: Duplicate of this field was taken out

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
      postalCode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },

    // --- Metadata ---
    tags: [String],
    queries: [{ type: String, index: true }], // Indexed for faster searching
    isActive: { type: Boolean, default: true },

    // REMOVED: The singular 'qualification' field was removed to avoid confusion.

    // ...You can add any other fields you need here.
  },
  { timestamps: true, strict: true }, // Automatically adds createdAt and updatedAt
);

// --- Middleware for Slug Generation ---
// IMPORTANT: This hook only runs for individual document creation/updates
// using .save() or .create(). It WILL NOT run for batch operations like
// .bulkWrite(), .insertMany(), or .updateMany().
jobSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
    // Appends a short random string to ensure the slug is unique
    this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
  }
  next();
});

export const Job = model('Job', jobSchema);
