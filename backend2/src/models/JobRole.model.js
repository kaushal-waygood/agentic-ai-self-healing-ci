import { Schema, model } from 'mongoose';

const jobRoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const JobRole = model('JobRole', jobRoleSchema);
