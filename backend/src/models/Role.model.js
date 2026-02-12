import { Schema, model } from 'mongoose';

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    description: { type: String },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    isSystemRole: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

roleSchema.index({ name: 1, organization: 1 }, { unique: true });

export const Role = model('Role', roleSchema);
