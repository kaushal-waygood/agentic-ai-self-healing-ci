import { Schema, model } from 'mongoose';

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['UNIVERSITY', 'COMPANY'],
      required: true,
    },
    profile: {
      industry: { type: String },
      size: { type: String },
      website: { type: String },
      description: { type: String },
      address: { type: String },
      logo: { type: String },
    },
    contactInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    onboardingRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'BringZobs',
    },

    // --- Stats Counters (Optional but Recommended) ---
    // Instead of storing all jobs, store a count. It's faster for dashboards.
    jobCounts: {
      active: { type: Number, default: 0 },
      closed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    seats: { type: Number, default: 100 },
    bookedSeats: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'pending_verification', 'suspended'],
      default: 'active',
    },
    apiKey: { type: String, required: true, unique: true },
    betaFeaturesEnabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // IMPORTANT: Enable virtuals in JSON
    toObject: { virtuals: true },
  },
);

// --- VIRTUAL POPULATE ---
// This tells Mongoose: "Look at the Job model. Find entries where 'organization' matches my '_id'"
organizationSchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'organization',
});

export const Organization = model('Organization', organizationSchema);
