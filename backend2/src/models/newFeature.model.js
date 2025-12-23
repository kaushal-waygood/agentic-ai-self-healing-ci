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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

export const NewFeature = model('NewFeature', newFeatureSchema);
