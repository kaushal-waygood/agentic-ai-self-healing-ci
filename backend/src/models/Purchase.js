import { Schema, model } from 'mongoose';

const purchaseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    billingVariant: {
      period: {
        type: String,
        required: true,
        enum: ['Weekly', 'Monthly', 'Quarterly', 'HalfYearly', 'Annual'],
      },
      price: {
        usd: { type: Number, required: true },
        inr: { type: Number, required: true },
      },
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['usd', 'inr'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'razorpay', 'paypal', 'manual', 'none'],
    },
    paymentId: {
      type: String,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Purchase = model('Purchase', purchaseSchema);
