// controllers/coupon.controller.js
import mongoose from 'mongoose';
import { Coupon } from '../models/coupon.model.js';
import { CouponRedemption } from '../models/couponRedemption.model.js';
import { Plan } from '../models/Plans.model.js'; // adjust path if needed

// Helper: compute discounted price for a price object { usd, inr } and coupon doc
export function computeDiscountedPriceForPriceObj(priceObj, coupon) {
  if (!priceObj) return { final: null, discount: null };

  const baseUSD = Number(priceObj.usd ?? 0);
  const baseINR = Number(priceObj.inr ?? 0);

  let discountUSD = 0;
  let discountINR = 0;

  if (coupon.discountType === 'percentage') {
    const pct = Number(coupon.discountValue ?? 0) / 100;
    discountUSD = +(baseUSD * pct).toFixed(2);
    discountINR = +(baseINR * pct).toFixed(2);
  } else if (coupon.discountType === 'flat') {
    if (coupon.discountAmount) {
      discountUSD = +Math.min(
        Number(coupon.discountAmount.usd || 0),
        baseUSD,
      ).toFixed(2);
      discountINR = +Math.min(
        Number(coupon.discountAmount.inr || 0),
        baseINR,
      ).toFixed(2);
    } else {
      // fallback: if no currency-specific flat provided, treat discountValue as same for both
      const flat = Number(coupon.discountValue || 0);
      discountUSD = +Math.min(flat, baseUSD).toFixed(2);
      discountINR = +Math.min(flat, baseINR).toFixed(2);
    }
  }

  const finalUSD = +Math.max(baseUSD - discountUSD, 0).toFixed(2);
  const finalINR = +Math.max(baseINR - discountINR, 0).toFixed(2);

  return {
    original: { usd: baseUSD, inr: baseINR },
    discount: { usd: discountUSD, inr: discountINR },
    final: { usd: finalUSD, inr: finalINR },
  };
}

// --------- Controllers ---------

export const createCoupon = async (req, res) => {
  try {
    const payload = req.body;
    if (
      !payload.code ||
      !payload.discountType ||
      (payload.discountType === 'percentage' &&
        payload.discountValue == null &&
        payload.discountValue !== 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Required: code and discountType. For percentage, discountValue required.',
      });
    }

    payload.code = payload.code.toUpperCase().trim();

    if (payload.plansApplicable && payload.plansApplicable.length) {
      const invalid = payload.plansApplicable.some(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalid)
        return res.status(400).json({
          success: false,
          message: 'Invalid plan id in plansApplicable.',
        });
    }

    const existing = await Coupon.findOne({ code: payload.code }).lean();
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: 'Coupon code already exists.' });

    const coupon = await Coupon.create(payload);
    return res
      .status(201)
      .json({ success: true, message: 'Coupon created.', data: coupon });
  } catch (error) {
    console.error('createCoupon error', error);
    if (error.name === 'ValidationError')
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid coupon ID.' });

    if (update.code) update.code = update.code.toUpperCase().trim();

    const updated = await Coupon.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found.' });
    return res
      .status(200)
      .json({ success: true, message: 'Coupon updated.', data: updated });
  } catch (error) {
    console.error('updateCoupon error', error);
    if (error.code === 11000)
      return res
        .status(409)
        .json({ success: false, message: 'Coupon code must be unique.' });
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const listCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .lean();
    const total = await Coupon.countDocuments(filter);
    return res.status(200).json({ success: true, data: coupons, total });
  } catch (error) {
    console.error('listCoupons error', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid coupon ID.' });
    const coupon = await Coupon.findById(id).lean();
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found.' });
    return res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.error('getCoupon error', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid coupon ID.' });
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).lean();
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found.' });
    return res
      .status(200)
      .json({ success: true, message: 'Coupon deactivated.', data: coupon });
  } catch (error) {
    console.error('deleteCoupon error', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const toggleCouponActive = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid coupon ID.' });
    const coupon = await Coupon.findById(id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found.' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return res
      .status(200)
      .json({ success: true, message: 'Coupon toggled.', data: coupon });
  } catch (error) {
    console.error('toggleCouponActive error', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, planId, period } = req.query;
    if (!code || !planId || !period)
      return res
        .status(400)
        .json({ success: false, message: 'Required: code, planId, period' });

    if (!mongoose.Types.ObjectId.isValid(planId))
      return res
        .status(400)
        .json({ success: false, message: 'Invalid planId' });

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    }).lean();
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, isValid: false, message: 'Coupon not found.' });

    if (!coupon.isActive)
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'Coupon is not active.',
      });

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now)
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'Coupon not yet valid.',
      });
    if (coupon.expiresAt && coupon.expiresAt < now)
      return res
        .status(400)
        .json({ success: false, isValid: false, message: 'Coupon expired.' });

    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'Coupon usage limit reached.',
      });

    const plan = await Plan.findById(planId).lean();
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found.' });

    const variant = plan.billingVariants.find((bv) => bv.period === period);
    if (!variant)
      return res.status(404).json({
        success: false,
        message: 'Billing period invalid for this plan.',
      });

    // plan applicability
    if (coupon.plansApplicable && coupon.plansApplicable.length) {
      const allowed = coupon.plansApplicable.some(
        (p) => p.toString() === plan._id.toString(),
      );
      if (!allowed) {
        return res.status(400).json({
          success: false,
          isValid: false,
          message: 'Coupon not applicable for the selected plan.',
        });
      }
    }

    // compute price based on variant.price.effective (don't mutate DB)
    const priceObj = variant.price && variant.price.effective;
    if (!priceObj)
      return res.status(500).json({
        success: false,
        message: 'Plan variant pricing not configured.',
      });

    const computed = computeDiscountedPriceForPriceObj(priceObj, coupon);

    return res.status(200).json({
      success: true,
      isValid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue ?? null,
        discountAmount: coupon.discountAmount ?? null,
      },
      pricing: {
        period,
        original: computed.original,
        discounted: computed.final,
        discountAmount: computed.discount,
      },
      note: 'This is a validation response. Call /redeem at checkout to atomically apply and record usage.',
    });
  } catch (error) {
    console.error('validateCoupon error', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const redeemCoupon = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { code, planId, period } = req.body;
    const userId = req.user && req.user._id;

    if (!code || !planId || !period) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: 'Required: code, planId, period' });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: 'Invalid planId' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    }).session(session);
    if (!coupon) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found.' });
    }

    if (!coupon.isActive) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: 'Coupon not active.' });
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: 'Coupon not yet valid.' });
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: 'Coupon expired.' });
    }

    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: 'Coupon usage limit reached.' });
    }

    // Plan and variant checks
    const plan = await Plan.findById(planId).session(session);
    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found.' });
    }
    const variant = plan.billingVariants.find((bv) => bv.period === period);
    if (!variant) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Billing period invalid for this plan.',
      });
    }

    if (coupon.plansApplicable && coupon.plansApplicable.length) {
      const allowed = coupon.plansApplicable.some(
        (p) => p.toString() === plan._id.toString(),
      );
      if (!allowed) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Coupon not applicable for this plan.',
        });
      }
    }

    // Enforce per-user limit (requires CouponRedemption)
    if (userId) {
      const redemption = await CouponRedemption.findOne({
        couponId: coupon._id,
        userId,
      }).session(session);

      if (redemption) {
        const uses = redemption.uses || 0;
        if (coupon.perUserLimit != null && uses >= coupon.perUserLimit) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: 'User coupon usage limit reached.',
          });
        }
        // increment uses
        redemption.uses = uses + 1;
        redemption.lastUsedAt = new Date();
        await redemption.save({ session });
      } else {
        // create new redemption record
        await CouponRedemption.create(
          [{ couponId: coupon._id, userId, uses: 1, lastUsedAt: new Date() }],
          { session },
        );
      }
    } else {
      // If no userId available, but coupon has perUserLimit, we cannot enforce. We allow redemption but warn.
      if (coupon.perUserLimit != null && coupon.perUserLimit > 0) {
        // Optionally: reject if you require auth for coupon usage
        // For now, just continue but we will not be able to enforce per-user limits.
      }
    }

    // increment global usedCount and possibly deactivate one-time coupon
    coupon.usedCount = (coupon.usedCount || 0) + 1;
    if (coupon.isOneTime) coupon.isActive = false;

    await coupon.save({ session });

    // compute final pricing to return to caller (use variant.price.effective)
    const computed = computeDiscountedPriceForPriceObj(
      variant.price.effective,
      coupon,
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Coupon redeemed successfully.',
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
      },
      pricing: {
        period,
        original: computed.original,
        discounted: computed.final,
        discountAmount: computed.discount,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('redeemCoupon error', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const redeemCouponByCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.error('redeemCouponByCode error', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
