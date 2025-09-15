/** @format */
import { Purchase } from '../models/Purchase.js';
import { Plan } from '../models/Plans.model.js';
import { User } from '../models/User.model.js';

export const createPurchase = async (req, res) => {
  try {
    const { planId, period, paymentGateway, paymentId } = req.body;
    const userId = req.user._id;

    // Get the plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    // Get the billing variant
    const billingVariant = plan.billingVariants.find(
      (v) => v.period === period,
    );
    if (!billingVariant) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing period',
      });
    }

    // Calculate end date based on period
    const startDate = new Date();
    const endDate = new Date();

    switch (period) {
      case 'Weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'Monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'Quarterly':
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case 'HalfYearly':
        endDate.setMonth(startDate.getMonth() + 6);
        break;
      case 'Annual':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }

    // Create purchase record
    const purchase = new Purchase({
      user: userId,
      plan: planId,
      billingVariant: {
        period: billingVariant.period,
        price: billingVariant.price,
      },
      amountPaid: billingVariant.price.usd, // or inr based on user preference
      currency: 'usd', // or get from user preferences
      paymentGateway,
      paymentId,
      paymentStatus: 'completed',
      startDate,
      endDate,
    });

    await purchase.save();

    // Update user's current plan and purchase
    await User.findByIdAndUpdate(userId, {
      currentPlan: planId,
      currentPurchase: purchase._id,
    });

    // Set usage limits based on plan features
    await setUserUsageLimits(userId, plan);

    res.status(201).json({
      success: true,
      message: 'Purchase completed successfully',
      data: purchase,
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Helper function to set user usage limits
const setUserUsageLimits = async (userId, plan) => {
  const weeklyVariant = plan.billingVariants.find((v) => v.period === 'Weekly');
  if (!weeklyVariant) return;

  const limits = {
    cvCreation: 0,
    coverLetter: 0,
    aiApplication: 0,
    autoApply: 0,
  };

  weeklyVariant.features.forEach((feature) => {
    const value = feature.value === 'Unlimited' ? -1 : parseInt(feature.value);

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
        limits.autoApply = value;
        break;
    }
  });

  await User.findByIdAndUpdate(userId, {
    usageLimits: limits,
    usageCounters: {
      cvCreation: 0,
      coverLetter: 0,
      aiApplication: 0,
      autoApply: 0,
      lastReset: new Date(),
    },
  });
};

export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user._id;

    const purchases = await Purchase.find({ user: userId })
      .populate('plan')
      .sort({ createdAt: -1 });

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
