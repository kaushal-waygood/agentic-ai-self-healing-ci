// middlewares/ensurePlanValidity.middleware.js
import { Purchase } from '../models/Purchase.js';
import { User } from '../models/User.model.js';

export const ensurePlanValidity = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user?.currentPurchase) return next();

    const purchase = await Purchase.findById(user.currentPurchase);
    if (!purchase || !purchase.isActive) return next();

    if (purchase.endDate <= new Date()) {
      purchase.isActive = false;
      await purchase.save();

      user.currentPlan = null;
      user.currentPurchase = null;
      user.credits = 0;
      user.usageLimits = {};
      user.usageCounters = {
        cvCreation: 0,
        coverLetter: 0,
        aiApplication: 0,
        autoApply: 0,
        aiAutoApply: 0,
        aiAutoApplyDailyLimit: 0,
        aiMannualApplication: 0,
        lastReset: new Date(),
      };

      user.creditTransactions.push({
        type: 'ADJUST',
        amount: 0,
        balanceAfter: 0,
        kind: 'plan_expired',
        createdAt: new Date(),
      });

      await user.save();
    }

    next();
  } catch (err) {
    console.error('ensurePlanValidity failed:', err);
    next(err);
  }
};
