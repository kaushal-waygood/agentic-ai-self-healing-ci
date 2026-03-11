// src/models/RecruiterEmailSent.model.js
import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', index: true },

    recruiterEmail: { type: String, required: true, index: true },
    subject: { type: String, required: true },

    /** What was sent */
    sentCv: { type: Boolean, default: false },
    sentCoverLetter: { type: Boolean, default: false },
    sentEmailDraft: { type: Boolean, default: false },

    /** Optional job context */
    jobTitle: String,
    companyName: String,
    applicationId: { type: Schema.Types.ObjectId, ref: 'StudentTailoredApplication', index: true },

    /** Document IDs for linking to sent CV/CL */
    cvId: { type: Schema.Types.ObjectId, ref: 'StudentCV', index: true },
    clId: { type: Schema.Types.ObjectId, ref: 'StudentCL', index: true },
  },
  { timestamps: true },
);

schema.index({ user: 1, createdAt: -1 });
schema.index({ recruiterEmail: 1, createdAt: -1 });

export const RecruiterEmailSent = model('RecruiterEmailSent', schema);
