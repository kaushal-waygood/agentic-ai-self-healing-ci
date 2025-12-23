import { Schema, model } from 'mongoose';
import slugify from 'slugify';

const jobSchema = new Schema(
  {
    // Identification fields
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    origin: {
      type: String,
      enum: ['HOSTED', 'EXTERNAL'],
      required: true,
    },
    publisher: { type: String }, // For external jobs (e.g., "Northwestern Medicine")

    // Core job information
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: { type: String },
    isRemote: { type: Boolean, default: false },
    remoteAllowedLocations: [{ type: String }], // For jobs that allow remote but with location restrictions

    // Company information
    company: {
      type: String,
      required: true,
    },
    companyType: { type: String },
    logo: { type: String },
    companyWebsite: { type: String },
    companyLinkedIn: { type: String },

    // Organization reference (for hosted jobs)
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: function () {
        return this.origin === 'HOSTED';
      },
    },

    // Job requirements
    qualification: { type: String },
    qualifications: {
      type: [String],
      default: [],
    },
    jobRequiredExperience: {
      noExperienceRequired: { type: Boolean, default: false },
      requiredExperienceInMonths: { type: Number },
      experienceMentioned: { type: Boolean, default: false },
      experiencePreferred: { type: Boolean, default: false },
      yearsOfExperience: { type: Number }, // Derived field for easier querying
    },
    // skills: [{ type: String }],

    // Job responsibilities
    jobResponsibilities: { type: String },
    responsibilities: {
      type: [String],
      default: [],
    },

    // Employment details
    employmentType: {
      type: String,
      // enum: [
      //   'FULLTIME',
      //   'PARTTIME',
      //   'CONTRACTOR',
      //   'TEMPORARY',
      //   'INTERN',
      //   'VOLUNTEER',
      //   'OTHER',
      // ],
      required: true,
    },
    employmentTypeText: { type: String }, // Human-readable version (e.g., "Full-time")
    contractLength: {
      value: { type: Number },
      unit: { type: String, enum: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'] },
    },

    // Salary information
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
      period: {
        type: String,
        enum: ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR', 'TOTAL'],
        default: 'YEAR',
      },
      isEstimated: { type: Boolean, default: false },
    },
    salaryDisclosed: { type: Boolean, default: false },

    // Benefits
    benefits: { type: String },
    benefitsList: {
      type: [String],
      default: [],
    },

    // Application details
    applyMethod: {
      method: {
        type: String,
        enum: ['EMAIL', 'URL', 'INTERNAL'],
        required: true,
      },
      emails: [{ type: String }],
      url: { type: String },
      isDirect: { type: Boolean },
      internalApplicationId: { type: String }, // For internal application systems
    },
    applyOptions: [
      {
        publisher: { type: String },
        applyLink: { type: String },
        isDirect: { type: Boolean },
      },
    ],
    applicationDeadline: { type: Date },
    applicationQualityScore: { type: Number },

    // Application requirements
    resumeRequired: { type: Boolean, default: true },
    coverLetterRequired: { type: Boolean, default: false },
    phoneRequired: { type: Boolean, default: false },
    portfolioRequired: { type: Boolean, default: false },

    // Location information
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'US' },
      postalCode: { type: String },
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
      isHybrid: { type: Boolean, default: false },
    },
    locationText: { type: String }, // Human-readable version (e.g., "Chicago, IL")

    // Work schedule
    workingHours: {
      min: { type: Number },
      max: { type: Number },
      isFlexible: { type: Boolean, default: false },
    },
    shift: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'ROTATING', 'OTHER'],
    },

    // Dates
    postedAt: { type: Date, default: Date.now },
    postedAtTimestamp: { type: Number },
    postedHumanReadable: { type: String }, // e.g., "19 days ago"
    expiresAt: { type: Date },
    expiresAtTimestamp: { type: Number },

    // Status flags
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: function () {
        return this.origin === 'HOSTED'; // Assume hosted jobs are verified
      },
    },
    isFeatured: { type: Boolean, default: false },

    // Classification
    industry: { type: String },
    occupationalCategory: { type: String },
    onetSoc: { type: String }, // Standard Occupational Classification code
    onetJobZone: { type: String }, // Job zone level
    naicsCode: { type: String }, // Industry classification code
    naicsName: { type: String },

    // Metadata
    tags: {
      type: [String],
      default: [],
    },
    queries: {
      type: [String],
      default: [],
    }, // Search queries that found this job
    taxonomyAttributes: [
      {
        id: { type: String },
        label: { type: String },
      },
    ],
    customAttributes: {
      type: Map,
      of: String,
    },

    // Work periods (for contracts)
    workPeriods: {
      standard: {
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

    // Slug for URLs
    slug: {
      type: String,
      // required: true,
      unique: true,
    },

    // Audit fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Pre-save hook to generate slug
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

  // Derive years of experience if not set
  if (
    this.jobRequiredExperience?.requiredExperienceInMonths &&
    !this.jobRequiredExperience.yearsOfExperience
  ) {
    this.jobRequiredExperience.yearsOfExperience = Math.round(
      this.jobRequiredExperience.requiredExperienceInMonths / 12,
    );
  }

  // Set location text if not provided
  if (!this.locationText && this.location?.city && this.location?.state) {
    this.locationText = `${this.location.city}, ${this.location.state}`;
  }

  next();
});

// Indexes
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ slug: 1 }, { unique: true });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ 'location.state': 1 });
jobSchema.index({ 'location.country': 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ 'salary.min': 1 });
jobSchema.index({ 'salary.max': 1 });
jobSchema.index({ isRemote: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ postedAt: -1 });
jobSchema.index({ queries: 1 });

// Virtual for formatted salary
jobSchema.virtual('salary.formatted').get(function () {
  if (!this.salary) return null;

  const { min, max, currency, period } = this.salary;
  const periodMap = {
    HOUR: 'per hour',
    DAY: 'per day',
    WEEK: 'per week',
    MONTH: 'per month',
    YEAR: 'per year',
    TOTAL: 'total',
  };

  if (min && max) {
    return `${currency}${min} - ${currency}${max} ${
      periodMap[period] || ''
    }`.trim();
  } else if (min) {
    return `${currency}${min}+ ${periodMap[period] || ''}`.trim();
  } else if (max) {
    return `Up to ${currency}${max} ${periodMap[period] || ''}`.trim();
  }

  return null;
});

export const Job = model('Job', jobSchema);
