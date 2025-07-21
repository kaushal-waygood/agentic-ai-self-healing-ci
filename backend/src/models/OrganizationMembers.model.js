// models/OrganizationMembers.js
import { Schema, model } from 'mongoose';

const OrganizationMembersSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    department: {
      type: String,
    },
    course: {
      type: String,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const OrganizationMember = model(
  'OrganizationMember',
  OrganizationMembersSchema,
);
