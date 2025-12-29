import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required.'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

export const Contact = model('Contact', contactSchema);
