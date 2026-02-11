import { Schema, model } from 'mongoose';

const MessageSchema = new Schema({
  senderId: { type: String, required: true }, // Changed to String for flexibility
  text: { type: String, required: true },
  fileUrl: { type: String, default: null },
  fileType: { type: String, default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema(
  {
    jobId: { type: String, required: true },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'AppliedJob',
      required: true,
    },
    participants: [{ type: String }], // Allows mixed types (ObjectIds and Org Strings)
    messages: [MessageSchema],
    lastMessage: { type: String },
  },
  { timestamps: true },
);

ConversationSchema.index({ jobId: 1, applicationId: 1 }, { unique: true });

export const Conversation = model('Conversation', ConversationSchema);
