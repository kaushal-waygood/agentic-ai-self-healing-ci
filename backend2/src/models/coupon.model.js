// models/coupon.model.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const priceValueSchema = new Schema(
  {
    usd: { type: Number, required: true },
    inr: { type: Number, required: true },
  },
  { _id: false },
);

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },
    name: { type: String }, // e.g. "Diwali 20%"
    description: { type: String },

    // discountType:
    // - 'percentage' => uses discountValue (0-100)
    // - 'flat' => uses discountAmount (currency object)
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'flat'],
    },

    // for percentage discounts
    discountValue: { type: Number, min: 0 },

    // for flat discounts (currency-aware)
    discountAmount: {
      type: priceValueSchema,
      required: false,
    },

    // apply to specific plans (Plan _id). If empty => applies to all plans
    plansApplicable: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],

    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },

    isActive: { type: Boolean, default: true },

    // usage limits
    maxUses: { type: Number, default: null }, // null => unlimited
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 }, // how many times a single user can use

    isOneTime: { type: Boolean, default: false },

    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

couponSchema.index({ code: 1 });

export const Coupon = model('Coupon', couponSchema);
