import { Schema, model } from 'mongoose';

const paymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ['stripe', 'razorpay'],
      required: true,
    },

    gatewayPaymentId: String,
    gatewayOrderId: String,

    amount: Number,
    currency: String,

    status: {
      type: String,
      enum: ['created', 'pending', 'completed', 'failed', 'refunded'],
      default: 'created',
    },

    failureReason: String,

    metadata: Object,
  },
  { timestamps: true },
);

export const Payment = model('Payment', paymentSchema);
