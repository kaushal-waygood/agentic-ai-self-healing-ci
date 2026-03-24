const { Schema, model } = require('mongoose');

const jobSchema = new Schema(
  {
    jobId: { type: String, required: true, unique: true }, // Unique ID (RapidAPI or UUID)
    origin: { type: String, enum: ['HOSTED', 'EXTERNAL'] },

    title: { type: String },
    description: { type: String },
    company: { type: String },

    applyMethod: {
      method: { type: String, enum: ['EMAIL', 'URL'] },
      emails: [String],
      url: { type: String },
    },

    jobTypes: {
      type: [String],
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY'],
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

    // ✅ New field to track search queries
    queries: [{ type: String }],

    // --- Scraped Recruiter Emails ---
    scrapedEmails: [
      {
        email: { type: String },
        domain: { type: String },
        department: { type: String }, // e.g. "Tech", "HR", "General"
      },
    ],
  },
  { timestamps: true },
);

// Optional index if you want fast keyword-based job analysis later
jobSchema.index({ queries: 1 });

module.exports = model('Job', jobSchema);
