// models/OrganizationMembers.js
import { Schema, model } from 'mongoose';

const OrganizationMembersSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId, // Linked only after they register/accept
      ref: 'User',
      default: null,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['hr', 'member', 'admin'],
      default: 'member',
    },
    fullName: { type: String, required: true },

    // --- NEW FIELDS FOR INVITATION FLOW ---
    status: {
      type: String,
      enum: ['pending', 'active', 'declined'],
      default: 'pending', // <--- Default is now PENDING
    },
    invitationToken: { type: String }, // The secret code sent in email
    invitationExpires: { type: Date }, // Security expiry (e.g. 7 days)
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound index to prevent duplicate invites
OrganizationMembersSchema.index(
  { organizationId: 1, email: 1 },
  { unique: true },
);

export const OrganizationMember = model(
  'OrganizationMember',
  OrganizationMembersSchema,
);
