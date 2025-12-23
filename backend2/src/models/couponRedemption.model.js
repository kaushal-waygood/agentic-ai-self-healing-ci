// models/couponRedemption.model.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const couponRedemptionSchema = new Schema(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    uses: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
);

couponRedemptionSchema.index({ couponId: 1, userId: 1 }, { unique: true });

export const CouponRedemption = model(
  'CouponRedemption',
  couponRedemptionSchema,
);
