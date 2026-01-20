import { Schema, model } from 'mongoose';

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    email: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,
    },

    message: {
      type: String,
      trim: true,
    },

    // Contextual metadata
    path: {
      type: String,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    subCategory: {
      type: String,
    },

    attachment: {
      url: String,
      fileName: String,
      mimeType: String,
      size: Number,
    },

    meta: {
      userAgent: String,
      ip: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Feedback = model('Feedback', feedbackSchema);
