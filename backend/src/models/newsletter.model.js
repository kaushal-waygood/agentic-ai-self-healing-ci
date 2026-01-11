import { model, Schema } from 'mongoose';

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Newsletter = model('Newsletter', newsletterSchema);
