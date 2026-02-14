import { Schema, model } from 'mongoose';

const organizationSchema = new Schema(
  {
    // ---------------- Core ----------------
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['UNIVERSITY', 'COMPANY'],
      required: true,
      index: true,
    },

    // ---------------- Profile ----------------
    profile: {
      industry: { type: String, trim: true },

      // kept as String to avoid breaking existing data
      size: { type: String },

      website: {
        type: String,
        trim: true,
        match: [/^https?:\/\//, 'Website must start with http or https'],
      },

      description: {
        type: String,
        maxlength: 1000,
      },
      // address: { type: String },
      address: {
        type: {
          country: { type: String, default: '' },
          state: { type: String, default: '' },
          city: { type: String, default: '' }
        },
        default: () => ({ country: '', state: '', city: '' })
      },

      logo: { type: String },
    },

    // ---------------- Contact ----------------
    contactInfo: {
      name: { type: String, trim: true },

      email: {
        type: String,
        lowercase: true,
        trim: true,
      },

      phone: { type: String },
    },

    onboardingRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'BringZobs',
      index: true,
    },

    // ---------------- Job Stats ----------------
    jobCounts: {
      active: { type: Number, default: 0, min: 0 },
      closed: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
    },

    // ---------------- Seats ----------------
    seats: {
      type: Number,
      default: 100,
      min: 0,
    },

    bookedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ---------------- Status ----------------
    status: {
      type: String,
      enum: ['active', 'pending_verification', 'suspended'],
      default: 'active',
      index: true,
    },

    // ---------------- API / Flags ----------------
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    betaFeaturesEnabled: {
      type: Boolean,
      default: false,
    },

    // ---------------- Future-safe (non-breaking) ----------------
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['OWNER', 'ADMIN', 'RECRUITER'],
          default: 'RECRUITER',
        },
      },
    ],

    verifiedAt: { type: Date },
    suspendedAt: { type: Date },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ---------------- Virtual Populate ----------------
organizationSchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'organization',
});

// ---------------- Indexes ----------------
// Safe to add; does not affect existing docs
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ type: 1, status: 1 });

export const Organization = model('Organization', organizationSchema);
