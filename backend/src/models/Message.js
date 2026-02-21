import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    // Note: ref is omitted here to allow for both 'Student' and 'User/Org' IDs
  },
  text: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
