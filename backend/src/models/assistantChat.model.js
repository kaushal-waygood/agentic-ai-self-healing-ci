import { Schema, model } from 'mongoose';

const assistantChatMessageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    responseType: {
      type: String,
      enum: ['text', 'preview', 'pdf', 'error', 'jobs', 'email', 'task'],
      default: 'text',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const assistantChatSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
      index: true,
    },
    messages: {
      type: [assistantChatMessageSchema],
      default: [],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

assistantChatSchema.index({ student: 1 }, { unique: true });

export const AssistantChat = model('AssistantChat', assistantChatSchema);
