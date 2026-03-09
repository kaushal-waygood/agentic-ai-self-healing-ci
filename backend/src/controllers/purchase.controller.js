/** @format */
import { Purchase } from '../models/Purchase.js';
import { Plan } from '../models/Plans.model.js';
import { User } from '../models/User.model.js';
import { calculateEndDate } from './plan.controller.js';
import redisClient from '../config/redis.js';

const setUserUsageLimits = async (userId, plan, period) => {
  // Find the variant corresponding to the purchased period
  const purchasedVariant = plan.billingVariants.find(
    (v) => v.period === period,
  );
  if (!purchasedVariant) return;

  const limits = {
    cvCreation: 0,
    coverLetter: 0,
    aiApplication: 0,
    aiAutoApply: 0,
    aiMannualApplication: 0,
    aiAutoApplyDailyLimit: 0,
    atsScore: 0,
    jobMatching: 0,
  };

  purchasedVariant.features.forEach((feature) => {
    const value =
      feature.value === 'Unlimited' ? -1 : parseInt(feature.value, 10);

    switch (feature.name) {
      case 'CV Creation':
        limits.cvCreation = value;
        break;
      case 'Cover Letter':
        limits.coverLetter = value;
        break;
      case 'AI Tailored Application':
        limits.aiApplication = value;
        break;
      case 'AI Auto-Apply Agent':
        limits.aiAutoApply = value;
        break;
      case 'AI Auto-Apply Daily limit':
        limits.aiAutoApplyDailyLimit = value;
        break;
      case 'Manual Application':
        limits.aiMannualApplication = value;
        break;
      case 'ATS Score':
        limits.atsScore = value;
        break;
      case 'Job Matching':
        limits.jobMatching = value;
        break;
    }
  });

  await User.findByIdAndUpdate(userId, {
    usageLimits: limits,
    usageCounters: {
      cvCreation: 0,
      coverLetter: 0,
      aiApplication: 0,
      aiAutoApply: 0,
      aiMannualApplication: 0,
      aiAutoApplyDailyLimit: 0,
      atsScore: 0,
      jobMatching: 0,
      lastReset: new Date(),
    },
  });
};

export const createPurchase = async (req, res) => {
  try {
    const { planId, period, paymentGateway, paymentId } = req.body;
    const userId = req.user._id;

    // 1. Fetch user and plan concurrently
    const [user, plan] = await Promise.all([
      User.findById(userId).populate('currentPurchase'),
      Plan.findById(planId).lean(),
    ]);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });

    // 2. Validate Active Plan
    if (
      user.currentPurchase &&
      new Date(user.currentPurchase.endDate) > new Date()
    ) {
      const { usageLimits, usageCounters } = user;

      // Allow upgrade if ANY limit is reached, otherwise block
      const isLimitReached = [
        'cvCreation',
        'coverLetter',
        'aiApplication',
        'aiAutoApply',
        'aiAutoApplyDailyLimit',
        'aiMannualApplication',
        'atsScore',
        'jobMatching',
      ].some((key) => {
        const limit = usageLimits?.[key];
        const current = usageCounters?.[key] || 0;
        return limit !== -1 && current >= limit;
      });

      if (!isLimitReached) {
        return res.status(403).json({
          success: false,
          message: 'Active plan exists. Exhaust limits or wait for expiry.',
          data: { currentPlanEnds: user.currentPurchase.endDate },
        });
      }
    }

    // 3. Get Variant
    const billingVariant = plan.billingVariants.find(
      (v) => v.period === period,
    );
    if (!billingVariant)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid billing period' });

    // 4. Create Purchase
    const startDate = new Date();
    const endDate = calculateEndDate(period);

    const purchase = new Purchase({
      user: userId,
      plan: planId,
      billingVariant: {
        period: billingVariant.period,
        price: billingVariant.price,
      },
      amountPaid: billingVariant.price.usd,
      currency: 'usd',
      paymentGateway,
      paymentId,
      paymentStatus: 'completed',
      startDate,
      endDate,
    });

    await purchase.save();

    // Invalidate dashboard purchases cache
    await redisClient.del(`dashboard:${userId}:purchases`);

    // 5. Update User
    user.currentPlan = planId;
    user.currentPurchase = purchase._id;

    // Use the unified helper for consistency
    user.usageLimits = buildUsageLimitsFromFeatures(billingVariant.features);
    user.usageCounters = {
      cvCreation: 0,
      coverLetter: 0,
      aiApplication: 0,
      aiAutoApply: 0,
      aiAutoApplyDailyLimit: 0,
      aiMannualApplication: 0,
      atsScore: 0,
      jobMatching: 0,
      lastReset: new Date(),
    };

    await user.save();

    res
      .status(201)
      .json({ success: true, message: 'Purchase completed', data: purchase });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const DASHBOARD_PURCHASES_TTL = 300; // 5 min

export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `dashboard:${userId}:purchases`;

    const purchases = await redisClient.withCache(
      cacheKey,
      DASHBOARD_PURCHASES_TTL,
      async () => {
        const docs = await Purchase.find({ user: userId })
          .populate('plan', 'planType')
          .sort({ createdAt: -1 })
          .lean();
        return docs;
      },
    );

    res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
