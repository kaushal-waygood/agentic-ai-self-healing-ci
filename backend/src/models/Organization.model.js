import { Schema, model } from 'mongoose';

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    planId: {
      type: String,
      default: 'basic',
    },
    allowStudentUpgrades: {
      type: Boolean,
      default: true,
    },
    seats: {
      type: Number,
      default: 100,
    },
    bookedSeats: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'pending_verification', 'suspended'],
      default: 'pending_verification',
    },
    apiKey: {
      type: String,
      required: true,
    },
    allowStudentUpgrades: {
      type: Boolean,
      default: true,
    },
    betaFeaturesEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Organization = model('Organization', organizationSchema);
