/** @format */
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Plan } from '../models/Plans.model.js'; // keep the path you used
import { Purchase } from '../models/Purchase.js';
import { User } from '../models/User.model.js';
import { config } from '../config/config.js';
import { Coupon } from '../models/coupon.model.js';

const stripe = new Stripe(config.stripeSecretKey);
const stripeWebhookSecret = config.stripeWebhookSecret;

// Centralized map to translate human feature names to user schema keys
const USAGE_LIMIT_MAP = {
  'CV Creation': 'cvCreation',
  'Cover Letter': 'coverLetter',
  'AI Tailored Application': 'aiApplication',
  'AI Auto-Apply Agent': 'aiAutoApply', // schema key
  'Auto-Apply Daily limit': 'aiAutoApplyDailyLimit', // schema key
  'Manual Application': 'aiMannualApplication', // schema key (typo kept)
};

const BACKEND_API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.zobsai.com'
    : process.env.NODE_ENV === 'development'
    ? 'https://api.dev.zobsai.com'
    : 'http://127.0.0.1:8080';

const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://zobsai.com'
    : process.env.NODE_ENV === 'development'
    ? 'https://dev.zobsai.com'
    : 'http://127.0.0.1:3000';

// ---------- Helpers ----------
const parseFeatureLimitValue = (raw) => {
  // Accept: "-1", "-1" string, "unlimited", "Unlimited", numeric strings, numbers
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const s = String(raw).trim().toLowerCase();
  if (s === '-1' || s === 'unlimited') return -1;
  // parse integer, fallback to NaN if bad
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n)) return null;
  return n;
};

const buildUsageLimitsFromFeatures = (features = []) => {
  console.log('buildUsageLimitsFromFeatures', features);
  const limits = {};
  features.forEach((feature) => {
    const key = USAGE_LIMIT_MAP[feature.name];
    if (!key) return; // ignore unknown features
    const parsed = parseFeatureLimitValue(feature.value);
    if (parsed === null) return; // don't set invalid values
    limits[key] = parsed;
  });

  console.log('buildUsageLimitsFromFeatures', limits);
  return limits;
};

const calculateEndDate = (period) => {
  const date = new Date();
  switch (period) {
    case 'Weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'Monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'Quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'HalfYearly':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'Annual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      // default to 1 month if a weird period slips through
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date;
};

const safeGetVariant = (plan, period) =>
  (plan &&
    Array.isArray(plan.billingVariants) &&
    plan.billingVariants.find((v) => v.period === period)) ||
  null;

export const getSinglePlan = getPlan;

// ---------- Controllers ----------

export const createPlan = async (req, res) => {
  try {
    const { planType, billingVariants, displayOrder } = req.body;

    if (!planType || !billingVariants || displayOrder === undefined) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: planType, displayOrder, and billingVariants are required.',
      });
    }

    const existingPlanType = await Plan.findOne({ planType }).lean();
    if (existingPlanType) {
      return res.status(409).json({
        success: false,
        message: `A plan with planType '${planType}' already exists.`,
      });
    }

    const existingDisplayOrder = await Plan.findOne({ displayOrder }).lean();
    if (existingDisplayOrder) {
      return res.status(409).json({
        success: false,
        message: `A plan with displayOrder '${displayOrder}' already exists.`,
      });
    }

    const newPlan = await Plan.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Plan created successfully.',
      data: newPlan,
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please check your input data.',
        errors: error.errors,
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A plan with that planType or displayOrder already exists.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const cleanupIndexes = async (req, res) => {
  try {
    // collection.indexes() returns array of index specs; keeps it robust across driver versions
    const indexes = await Plan.collection.indexes();

    // find any index named 'name_1' (older index naming)
    const nameIndex = indexes.find((i) => i.name === 'name_1');
    if (nameIndex) {
      await Plan.collection.dropIndex('name_1');
      const newIndexes = await Plan.collection.indexes();
      return res.status(200).json({
        success: true,
        message: 'Removed old name_1 index successfully',
        indexes: newIndexes,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'No name_1 index found',
      indexes,
    });
  } catch (error) {
    console.error('Error cleaning up indexes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cleaning up indexes',
      error: error.message,
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Plan ID.' });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'No update data provided.' });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully.',
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `A plan with that 'planType' or 'displayOrder' already exists.`,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please check your input data.',
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ displayOrder: 1 }).lean();
    return res.status(200).json({
      success: true,
      message: 'Plans fetched successfully.',
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Plan ID.' });
    }
    const plan = await Plan.findById(id).lean();
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Plan ID.' });
    }
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    return res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

// ---------- Payments & Purchases ----------

export const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const { planId, period, currency = 'usd', couponCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated. Please log in.',
      });
    }

    if (!planId || !period) {
      return res
        .status(400)
        .json({ success: false, error: 'Plan ID and period are required.' });
    }

    const currencyLower = String(currency || 'usd').toLowerCase();
    if (!['usd', 'inr'].includes(currencyLower)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid currency specified.' });
    }

    // Check if user already has active plan (same behavior as before)
    const userWithPurchase = await User.findById(userId)
      .populate('currentPurchase')
      .lean();
    if (
      userWithPurchase &&
      userWithPurchase.currentPurchase &&
      userWithPurchase.currentPurchase.endDate &&
      new Date(userWithPurchase.currentPurchase.endDate) > new Date()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You already have an active plan. You can purchase a new one once it expires.',
        data: {
          currentPlanEnds: userWithPurchase.currentPurchase.endDate,
        },
      });
    }

    // Load plan and billing variant
    const plan = await Plan.findById(planId).lean();
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found.' });
    }

    const variant = safeGetVariant(plan, period);
    if (!variant) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing period for this plan.',
      });
    }

    const basePrice =
      variant.price &&
      variant.price.effective &&
      variant.price.effective[currencyLower];

    if (typeof basePrice !== 'number') {
      return res.status(400).json({
        success: false,
        error: `Price for currency '${currencyLower}' not found.`,
      });
    }

    // Prepare pricing response
    const pricingResponse = {
      period,
      original: { [currencyLower]: +basePrice.toFixed(2) },
      discounted: null,
      discountAmount: null,
      appliedCoupon: null,
    };

    let finalPrice = basePrice;

    // If coupon provided, do validation (but DO NOT mutate coupon here)
    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code }).lean();

      if (!coupon) {
        return res
          .status(404)
          .json({ success: false, message: 'Coupon not found.' });
      }

      if (!coupon.isActive) {
        return res
          .status(400)
          .json({ success: false, message: 'Coupon is not active.' });
      }

      const now = new Date();
      if (coupon.startsAt && coupon.startsAt > now) {
        return res
          .status(400)
          .json({ success: false, message: 'Coupon not yet valid.' });
      }
      if (coupon.expiresAt && coupon.expiresAt < now) {
        return res
          .status(400)
          .json({ success: false, message: 'Coupon expired.' });
      }

      if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
        return res
          .status(400)
          .json({ success: false, message: 'Coupon usage limit reached.' });
      }

      console.log('coupon', coupon);

      // plan applicability check (coupon.plansApplicable expects Plan _id list)
      if (coupon.plansApplicable && coupon.plansApplicable.length) {
        const allowed = coupon.plansApplicable.some(
          (p) => p.toString() === plan._id.toString(),
        );

        console.log('allowed', allowed);
        if (!allowed) {
          return res.status(400).json({
            success: false,
            message: 'Coupon not applicable for the selected plan.',
          });
        }
      }

      // Compute discounted price from your helper (uses variant.price.effective object)
      const priceObj =
        variant.price && variant.price.effective
          ? variant.price.effective
          : null;
      if (!priceObj) {
        return res
          .status(500)
          .json({ success: false, message: 'Plan pricing misconfigured.' });
      }

      const computed = computeDiscountedPriceForPriceObj(priceObj, coupon);

      finalPrice = computed.final[currencyLower];
      const discountAmt = computed.discount[currencyLower];

      pricingResponse.discounted = { [currencyLower]: +finalPrice.toFixed(2) };
      pricingResponse.discountAmount = {
        [currencyLower]: +discountAmt.toFixed(2),
      };
      pricingResponse.appliedCoupon = {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue ?? null,
        discountAmount: coupon.discountAmount ?? null,
      };
    } else {
      pricingResponse.discounted = { [currencyLower]: +finalPrice.toFixed(2) };
      pricingResponse.discountAmount = { [currencyLower]: 0 };
    }

    // If the final amount becomes 0 or negative, handle separately (do not create PaymentIntent)
    const amountInSmallestUnit = Math.round(finalPrice * 100);
    if (amountInSmallestUnit <= 0) {
      // preserve existing behavior: do not create a stripe PaymentIntent for amount 0
      // caller should use server-side free activation (createSimplePurchaseDev or a dedicated free flow)
      return res.status(400).json({
        success: false,
        message:
          'Final amount is zero or invalid. For free activations use the dev endpoint or server-side purchase flow.',
        pricing: pricingResponse,
      });
    }

    // Create Stripe PaymentIntent with metadata for later webhook reconciliation
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currencyLower,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId.toString(),
        planId: plan._id.toString(),
        planType: plan.planType,
        billingPeriod: period,
        ...(pricingResponse.appliedCoupon
          ? { couponCode: pricingResponse.appliedCoupon.code }
          : {}),
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      pricing: pricingResponse,
    });
  } catch (error) {
    console.error('createPaymentIntent error:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Internal Server Error' });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, planId, billingPeriod } = paymentIntent.metadata || {};
    const currency = paymentIntent.currency;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!userId || !planId || !billingPeriod) {
        throw new Error(
          'Webhook metadata missing required fields (userId, planId, billingPeriod).',
        );
      }

      const plan = await Plan.findById(planId).session(session).lean();
      if (!plan) throw new Error(`Plan not found for planId: ${planId}`);

      const variant = safeGetVariant(plan, billingPeriod);
      if (!variant)
        throw new Error(`Billing variant '${billingPeriod}' not found.`);

      // Deactivate previous purchases
      await Purchase.updateMany(
        { user: userId, isActive: true },
        { $set: { isActive: false } },
        { session },
      );

      // Create new purchase
      const newPurchase = new Purchase({
        user: userId,
        plan: planId,
        billingVariant: {
          period: billingPeriod,
          price: {
            usd: variant.price.effective.usd,
            inr: variant.price.effective.inr,
          },
        },
        amountPaid: (paymentIntent.amount || 0) / 100,
        currency,
        paymentStatus: 'completed',
        paymentGateway: 'stripe',
        paymentId: paymentIntent.id,
        startDate: new Date(),
        endDate: calculateEndDate(billingPeriod),
        isActive: true,
      });
      await newPurchase.save({ session });

      // Update user
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error(`User not found for userId: ${userId}`);

      const newUsageLimits = buildUsageLimitsFromFeatures(
        variant.features || [],
      );

      console.log('newUsageLimits', newUsageLimits);

      user.currentPlan = planId;
      user.currentPurchase = newPurchase._id;
      user.usageLimits = newUsageLimits;
      user.usageCounters = {
        cvCreation: 0,
        coverLetter: 0,
        aiApplication: 0,
        autoApply: 0,
        autoApplyDailyLimit: 0,
        manualApplication: 0,
        lastReset: new Date(),
      };

      await user.save({ session });
      await session.commitTransaction();

      // Send notification email if template manager and transporter are available.
      // We avoid throwing if mailing fails: subscription should succeed regardless of email.
      try {
        const planName = plan.planType || 'Your Plan';
        if (typeof tm !== 'undefined' && typeof transporter !== 'undefined') {
          const { html, text } = await tm.compileWithTextFallback(
            'plan_upgrade',
            {
              subject: `Congrats! You've Upgraded to ${planName}`,
              name: user.fullName,
              planName,
              billingUrl: `${FRONTEND_URL}/account/billing`,
              managePlanUrl: `${FRONTEND_URL}/account/manage-plan`,
              companyUrl: FRONTEND_URL,
              companyAddress: COMPANY_ADDRESS || '',
              unsubscribeUrl: `${FRONTEND_URL}/unsubscribe`,
              supportEmail: process.env.SUPPORT_EMAIL || 'support@zobsai.com',
            },
          );
          await transporter.sendMail({
            from: config.emailUser,
            to: user.email,
            subject: `Congrats! You've Upgraded to ${planName} on ZobsAI`,
            html,
            text,
          });
        } else {
          // If no mailing configured, just log it.
          console.log(
            `Mailing skipped: tm or transporter not configured. Would have sent upgrade mail to ${user.email}`,
          );
        }
      } catch (mailErr) {
        console.error(
          'Failed to send plan upgrade email (non-fatal):',
          mailErr,
        );
      }
    } catch (error) {
      await session.abortTransaction();
      console.error(
        `Transaction aborted. Failed to process payment intent ${paymentIntent.id}:`,
        error,
      );
      // Return 200 to Stripe to avoid retries if we handled (but we failed). However here, it's safer to return 500
      // so you can inspect the webhook. Many systems reattempt on 5xx.
      session.endSession();
      return res
        .status(500)
        .json({ error: 'Failed to update user entitlements.' });
    } finally {
      session.endSession();
    }
  }

  return res.status(200).json({ received: true });
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    if (!paymentIntentId) {
      return res
        .status(400)
        .json({ success: false, error: 'paymentIntentId required' });
    }
    const purchase = await Purchase.findOne({
      paymentId: paymentIntentId,
    }).lean();

    if (!purchase) {
      return res.status(202).json({ success: true, status: 'processing' });
    }

    return res
      .status(200)
      .json({ success: true, status: purchase.paymentStatus });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Internal Server Error' });
  }
};

export const getActivePlan = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required.' });
    }

    const user = await User.findById(userId)
      .populate({
        path: 'currentPurchase',
        populate: {
          path: 'plan',
          model: 'Plan',
        },
      })
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    const hasActivePlan =
      user.currentPurchase &&
      user.currentPurchase.plan &&
      user.currentPurchase.isActive &&
      new Date(user.currentPurchase.endDate) > new Date();

    if (hasActivePlan) {
      const activePlan = user.currentPurchase.plan;
      const purchaseDetails = user.currentPurchase;
      return res.status(200).json({
        success: true,
        message: 'Active plan details fetched successfully.',
        data: {
          isActive: true,
          planId: activePlan._id,
          planType: activePlan.planType,
          startDate: purchaseDetails.startDate,
          endDate: purchaseDetails.endDate,
          usageLimits: user.usageLimits || {},
          usageCounters: user.usageCounters || {},
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'No active plan found.',
      data: {
        isActive: false,
        planType: 'Free',
      },
    });
  } catch (error) {
    console.error('Error fetching active plan:', error);
    return res
      .status(500)
      .json({ success: false, message: 'An internal server error occurred.' });
  }
};

export const createSimplePurchaseDev = async (req, res) => {
  const { planId, period } = req.body;
  const userId = req.user && req.user._id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: 'User not authenticated.' });
  }

  if (!planId || !period) {
    return res
      .status(400)
      .json({ success: false, message: 'Plan ID and period are required.' });
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId)
        .populate('currentPurchase')
        .session(session);
      if (!user) {
        throw new Error('User not found.');
      }

      if (
        user.currentPurchase &&
        user.currentPurchase.endDate &&
        new Date(user.currentPurchase.endDate) > new Date()
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({
          success: false,
          message: 'You already have an active plan.',
          data: { currentPlanEnds: user.currentPurchase.endDate },
        });
      }

      const plan = await Plan.findById(planId).session(session).lean();
      if (!plan) {
        throw new Error('Plan not found.');
      }

      console.log('plan', plan);

      const variant = safeGetVariant(plan, period);
      if (!variant) {
        throw new Error('Invalid billing period for this plan.');
      }

      await Purchase.updateMany(
        { user: userId, isActive: true },
        { $set: { isActive: false } },
        { session },
      );

      const newPurchase = new Purchase({
        user: userId,
        plan: planId,
        billingVariant: {
          period,
          price: {
            usd:
              (variant.price &&
                variant.price.effective &&
                variant.price.effective.usd) ||
              0,
            inr:
              (variant.price &&
                variant.price.effective &&
                variant.price.effective.inr) ||
              0,
          },
        },
        amountPaid: 0,
        currency: 'usd',
        paymentStatus: 'completed',
        paymentGateway: 'none',
        paymentId: `free-${userId}-${Date.now()}`,
        startDate: new Date(),
        endDate: calculateEndDate(period),
        isActive: true,
      });
      await newPurchase.save({ session });

      const newUsageLimits = buildUsageLimitsFromFeatures(
        variant.features || [],
      );

      console.log('newUsageLimits', newUsageLimits);

      user.currentPlan = planId;
      user.currentPurchase = newPurchase._id;
      user.usageLimits = newUsageLimits;
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

      console.log(user.usageCounters);
      console.log(user.usageLimits);

      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        message: 'Plan activated successfully.',
        data: {
          purchaseId: newPurchase._id,
          planId: plan._id,
          endDate: newPurchase.endDate,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // Retry only for transient transaction errors
      if (
        error &&
        error.errorLabels &&
        error.errorLabels.includes('TransientTransactionError') &&
        attempt < maxRetries
      ) {
        console.log(
          `Transient transaction error encountered. Retrying... (${attempt}/${maxRetries})`,
        );
        // loop will retry
      } else {
        console.error('Error creating simple purchase:', error);
        return res.status(500).json({
          success: false,
          message: 'An internal server error occurred.',
        });
      }
    }
  }
};
