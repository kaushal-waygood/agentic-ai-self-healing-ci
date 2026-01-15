import mongoose from 'mongoose';
import { Purchase } from '../../models/Purchase.js';
import { User } from '../../models/User.model.js';
import { Plan } from '../../models/Plans.model.js';
import { calculateEndDate } from '../../controllers/plan.controller.js';

export async function autoRenewCron() {
  console.log('[AUTO_RENEW] running at', new Date().toISOString());
  const now = new Date();
  const renewBeforeMs = 24 * 60 * 60 * 1000; // 24h window
  const renewBefore = new Date(now.getTime() + renewBeforeMs);

  console.log('[AUTO_RENEW] running at', now.toISOString());

  const expiringPurchases = await Purchase.find({
    isActive: true,
    autoRenew: true,
    endDate: { $lte: renewBefore },
    purchaseType: { $ne: 'renewal' },
  }).lean();

  for (const purchase of expiringPurchases) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(purchase.user).session(session);
      if (!user) throw new Error('User not found');

      const plan = await Plan.findById(purchase.plan).lean();
      if (!plan) throw new Error('Plan not found');

      const variant = plan.billingVariants.find(
        (v) => v.period === purchase.billingVariant.period,
      );
      if (!variant) throw new Error('Billing variant missing');

      // Prevent duplicate renewals
      const existingRenewal = await Purchase.findOne({
        user: purchase.user,
        purchaseType: 'renewal',
        startDate: purchase.endDate,
      }).session(session);

      if (existingRenewal) {
        await session.commitTransaction();
        session.endSession();
        continue;
      }

      const startDate = purchase.endDate;
      const endDate = calculateEndDate(
        purchase.billingVariant.period,
        startDate,
      );

      const renewal = new Purchase({
        user: purchase.user,
        plan: purchase.plan,
        purchaseType: 'renewal',
        billingVariant: purchase.billingVariant,
        amountPaid: purchase.amountPaid,
        currency: purchase.currency,
        paymentStatus: 'completed', // assumes stored payment
        paymentGateway: 'razorpay',
        paymentId: `auto_${Date.now()}_${purchase._id}`,
        startDate,
        endDate,
        isActive: false,
        autoRenew: true,
      });

      await renewal.save({ session });

      await session.commitTransaction();
      session.endSession();

      console.log(`[AUTO_RENEW] renewal created for user ${purchase.user}`);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.error(
        `[AUTO_RENEW] failed for purchase ${purchase._id}:`,
        err.message,
      );

      await Purchase.updateOne(
        { _id: purchase._id },
        {
          $set: {
            renewalAttemptedAt: new Date(),
            renewalFailedReason: err.message,
          },
        },
      );
    }
  }
}
