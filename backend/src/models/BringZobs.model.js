import { Schema, model } from 'mongoose';

const bringZobsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: ['STUDENT', 'STAFF', 'COMPANY'],
      required: true,
    },

    university: { type: String },

    name: { type: String },
    email: { type: String },
    phone: { type: String },

    company: { type: String },
    role: { type: String },
    document: { type: String },

    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

export const BringZobs = model('BringZobs', bringZobsSchema);
