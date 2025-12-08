/** @format */
import { Purchase } from '../models/Purchase.js';
import { Plan } from '../models/Plans.model.js';
import { User } from '../models/User.model.js';

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
    autoApply: 0,
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

// export const createPurchase = async (req, res) => {
//   try {
//     const { planId, period, paymentGateway, paymentId } = req.body;
//     const userId = req.user._id;

//     // --- START: ADDED VALIDATION LOGIC ---

//     // 1. Fetch the user and their currently populated purchase details
//     const user = await User.findById(userId).populate('currentPurchase');
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'User not found' });
//     }

//     // 2. Check if there is an active purchase that has not expired
//     if (user.currentPurchase && user.currentPurchase.endDate > new Date()) {
//       const { usageLimits, usageCounters } = user;
//       let hasReachedLimit = false;

//       // 3. If plan is active, check if usage limits have been reached
//       if (usageLimits && usageCounters) {
//         const limitsToCheck = [
//           'cvCreation',
//           'coverLetter',
//           'aiApplication',
//           'autoApply',
//         ];
//         for (const limit of limitsToCheck) {
//           // Check if a feature limit exists (is not unlimited) and has been met or exceeded
//           if (
//             usageLimits[limit] !== -1 &&
//             usageCounters[limit] >= usageLimits[limit]
//           ) {
//             hasReachedLimit = true;
//             break; // A limit has been reached, so they are allowed to buy a new plan
//           }
//         }
//       }

//       // 4. Block purchase only if the plan is active AND no usage limits have been reached
//       if (!hasReachedLimit) {
//         return res.status(403).json({
//           success: false,
//           message:
//             'You already have an active plan. You can purchase a new one once it expires or you exhaust your usage limits.',
//           data: {
//             currentPlanEnds: user.currentPurchase.endDate,
//           },
//         });
//       }
//     }
//     // --- END: ADDED VALIDATION LOGIC ---

//     // Get the plan
//     const plan = await Plan.findById(planId);
//     if (!plan) {
//       return res.status(404).json({
//         success: false,
//         message: 'Plan not found',
//       });
//     }

//     // Get the billing variant
//     const billingVariant = plan.billingVariants.find(
//       (v) => v.period === period,
//     );
//     if (!billingVariant) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid billing period',
//       });
//     }

//     // Calculate end date based on period
//     const startDate = new Date();
//     const endDate = new Date();

//     switch (period) {
//       case 'Weekly':
//         endDate.setDate(startDate.getDate() + 7);
//         break;
//       case 'Monthly':
//         endDate.setMonth(startDate.getMonth() + 1);
//         break;
//       case 'Quarterly':
//         endDate.setMonth(startDate.getMonth() + 3);
//         break;
//       case 'HalfYearly':
//         endDate.setMonth(startDate.getMonth() + 6);
//         break;
//       case 'Annual':
//         endDate.setFullYear(startDate.getFullYear() + 1);
//         break;
//     }

//     // Create purchase record
//     const purchase = new Purchase({
//       user: userId,
//       plan: planId,
//       billingVariant: {
//         period: billingVariant.period,
//         price: billingVariant.price,
//       },
//       amountPaid: billingVariant.price.usd, // or inr based on user preference
//       currency: 'usd', // or get from user preferences
//       paymentGateway,
//       paymentId,
//       paymentStatus: 'completed',
//       startDate,
//       endDate,
//     });

//     await purchase.save();

//     // Update user's current plan and purchase using the already fetched user object
//     user.currentPlan = planId;
//     user.currentPurchase = purchase._id;
//     await user.save();

//     // Set usage limits based on plan features
//     await setUserUsageLimits(userId, plan, period); // Pass period to set correct limits

//     res.status(201).json({
//       success: true,
//       message: 'Purchase completed successfully',
//       data: purchase,
//     });
//   } catch (error) {
//     console.error('Error creating purchase:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };

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
        'autoApply',
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

    // 5. Update User
    user.currentPlan = planId;
    user.currentPurchase = purchase._id;

    // Use the unified helper for consistency
    user.usageLimits = buildUsageLimitsFromFeatures(billingVariant.features);
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

    await user.save();

    res
      .status(201)
      .json({ success: true, message: 'Purchase completed', data: purchase });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('------');

    const purchases = await Purchase.find({ user: userId })
      .populate('plan', 'planType')
      .sort({ createdAt: -1 });

    console.log('purchases', purchases);
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
