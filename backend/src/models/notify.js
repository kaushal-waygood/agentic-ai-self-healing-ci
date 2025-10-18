import { Schema, model, mongo } from 'mongoose';

const notifySchema = new Schema(
  {
    name: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    isNotifyMailSend: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);
export const Notify = model('Notify', notifySchema);
