import { Schema, model } from 'mongoose';
import slugify from 'slugify';

const jobSchema = new Schema(
  {
    jobId: { type: String, required: true, unique: true },
    origin: { type: String, enum: ['HOSTED', 'EXTERNAL'] },

    title: { type: String },
    description: { type: String },
    responsibilities: [String],
    qualifications: [String],
    jobTypes: [String],
    logo: { type: String },
    company: { type: String },
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

    jobTypes: {
      type: [String],
    },

    contractLength: {
      value: { type: Number },
      type: { type: String, enum: ['DAYS', 'WEEKS', 'MONTHS'] },
    },

    salary: {
      min: { type: Number },
      max: { type: Number },
      period: { type: String, enum: ['HOUR', 'DAY', 'MONTH', 'YEAR'] },
    },

    expectedHours: { type: Number },
    workingHoursMin: { type: Number },
    workingHoursMax: { type: Number },

    resumeRequired: { type: Boolean },
    coverLetterRequired: { type: Boolean },
    phoneRequired: { type: Boolean },

    language: { type: String },
    applicationDeadline: { type: String },

    jobAddress: { type: String },
    country: { type: String },

    location: {
      city: { type: String },
      postalCode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },

    tags: [String],

    taxonomyAttributes: [
      {
        uuid: { type: String },
        label: { type: String },
      },
    ],

    attributes: { type: Map, of: String },

    workPeriods: {
      standard: {
        overtimeSalary: {
          min: { type: Number },
          max: { type: Number },
          isExact: { type: Boolean },
          isFixedAmount: { type: Boolean },
          period: { type: String },
        },
      },
      probation: {
        baseSalary: {
          min: { type: Number },
          max: { type: Number },
          isExact: { type: Boolean },
          period: { type: String },
        },
        overtimeSalary: {
          min: { type: Number },
          max: { type: Number },
          isExact: { type: Boolean },
          isFixedAmount: { type: Boolean },
          period: { type: String },
        },
      },
    },

    appliedStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }],

    queries: [{ type: String }],
    experience: { type: Number },
    qualification: [String],

    slug: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
  },
  { timestamps: true },
);

jobSchema.index({ queries: 1 });

jobSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Add random string for uniqueness
    this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  next();
});

export const Job = model('Job', jobSchema);
