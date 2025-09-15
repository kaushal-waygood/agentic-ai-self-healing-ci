/** @format */
import { Schema, model } from 'mongoose';

// A reusable sub-schema for currency-specific pricing
const priceSchema = new Schema(
  {
    usd: { type: Number, required: true },
    inr: { type: Number, required: true },
  },
  { _id: false },
);

// A reusable sub-schema for individual features and their limits
const featureSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true }, // e.g., "10/mo", "Unlimited", "✓"
  },
  { _id: false },
);

// A sub-schema to define each billing option (e.g., weekly, monthly)
// This is the core of the flexible design
const billingVariantSchema = new Schema(
  {
    period: {
      type: String,
      required: true,
      enum: ['Weekly', 'Monthly', 'Quarterly', 'HalfYearly', 'Annual'],
      description: 'The billing cycle for this variant.',
    },
    price: {
      type: priceSchema,
      required: true,
    },
    features: {
      type: [featureSchema],
      required: true,
      description: 'The specific limits and features for this billing period.',
    },
    discountLabel: {
      type: String, // e.g., "Save 20%"
      optional: true,
    },
  },
  { _id: false },
);

const planSchema = new Schema(
  {
    planType: {
      type: String,
      required: [true, 'PlanType is required.'],
      unique: true,
      enum: ['Free', 'Basic', 'Pro', 'Enterprise'], // Corresponds to plans like "Basic", "Pro"
    },
    popular: {
      type: Boolean,
      default: false,
      description: 'Highlight this plan on the UI.',
    },
    // The array of billing options for this plan
    billingVariants: {
      type: [billingVariantSchema],
      required: true,
    },
    displayOrder: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Plan = model('Plan', planSchema);
