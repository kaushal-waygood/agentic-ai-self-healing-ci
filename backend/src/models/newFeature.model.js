import { Schema, model } from 'mongoose';

const newFeatureSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    pageUrl: {
      type: String,
      trim: true,
    },
    fieldName: {
      type: String,
      trim: true,
    },
    issueType: {
      type: String,
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['feature-request', 'autofill-issue'],
      default: 'feature-request',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

export const NewFeature = model('NewFeature', newFeatureSchema);
