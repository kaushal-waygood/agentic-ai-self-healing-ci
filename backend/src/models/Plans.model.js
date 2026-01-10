import { Schema, model } from 'mongoose';

const priceValueSchema = new Schema(
  {
    usd: { type: Number, required: true },
    inr: { type: Number, required: true },
  },
  { _id: false },
);

const priceSchema = new Schema(
  {
    effective: {
      type: priceValueSchema,
      required: true,
      description: 'The final price the customer pays (the discounted price).',
    },
    actual: {
      type: priceValueSchema,
      required: false, // This is optional; only include it if there is a discount.
      description:
        'The original price, to be shown as struck-through on the UI.',
    },
  },
  { _id: false },
);

const featureSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const billingVariantSchema = new Schema(
  {
    period: {
      type: String,
      required: true,
      enum: ['Weekly', 'Monthly', 'Quarterly', 'HalfYearly', 'Annual'],
    },
    price: {
      type: priceSchema,
      required: true,
    },
    features: {
      type: [featureSchema],
      required: true,
    },
    discountLabel: {
      type: String,
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
      enum: ['Free', 'Weekly', 'Monthly', 'Enterprise'],
    },
    popular: {
      type: Boolean,
      default: false,
    },
    billingVariants: {
      type: [billingVariantSchema],
      required: true,
    },
    displayOrder: {
      type: Number,
      unique: true, // Enforcing uniqueness at the database level is best practice.
      required: [true, 'Display order is required.'], // Added required based on your controller logic.
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Plan = model('Plan', planSchema);
