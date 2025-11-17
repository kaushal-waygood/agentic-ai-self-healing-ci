/** @format */
import { Plan } from '../models/Plans.model.js'; // Adjust path
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import { User } from '../models/User.model.js'; // Adjust path
import { config } from '../config/config.js';

//OK
export const createPlan = async (req, res) => {
  try {
    const { planType, billingVariants, displayOrder } = req.body;

    if (!planType || !billingVariants || !displayOrder) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: planType, displayOrder, and billingVariants are required.',
      });
    }

    // These manual checks are great for providing clearer error messages than the default DB error.
    const existingPlanType = await Plan.findOne({ planType });
    if (existingPlanType) {
      return res.status(409).json({
        success: false,
        message: `A plan with planType '${planType}' already exists.`,
      });
    }

    const existingDisplayOrder = await Plan.findOne({ displayOrder });
    if (existingDisplayOrder) {
      return res.status(409).json({
        success: false,
        message: `A plan with displayOrder '${displayOrder}' already exists.`,
      });
    }

    // This line automatically handles the new schema structure.
    const newPlan = await Plan.create(req.body);

    res.status(201).json({
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
    // A more generic catch-all for other potential unique constraint violations
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A plan with that planType or displayOrder already exists.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const cleanupIndexes = async (req, res) => {
  try {
    const indexes = await Plan.collection.getIndexes();

    // Check if name_1 index exists
    if (indexes.name_1) {
      await Plan.collection.dropIndex('name_1');
      return res.status(200).json({
        success: true,
        message: 'Removed old name_1 index successfully',
        indexes: await Plan.collection.getIndexes(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'No name_1 index found',
      indexes: indexes,
    });
  } catch (error) {
    console.error('Error cleaning up indexes:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up indexes',
      error: error.message,
    });
  }
};

//OK
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Plan ID.' });
    }

    if (Object.keys(updateData).length === 0) {
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

    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      message: 'Plans fetched successfully.',
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

//OK
export const getSinglePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

const stripe = new Stripe(config.stripeSecretKey);
const stripeWebhookSecret = config.stripeWebhookSecret;

export const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planId, period, currency = 'usd' } = req.body;

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

    const userWithPurchase = await User.findById(userId).populate(
      'currentPurchase',
    );

    if (
      userWithPurchase.currentPurchase &&
      userWithPurchase.currentPurchase.endDate > new Date()
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

    // Validate the currency
    if (!['usd', 'inr'].includes(currency)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid currency specified.' });
    }

    // 1. Fetch plan details securely from MongoDB
    const plan = await Plan.findById(planId).lean();
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found.' });
    }

    // 2. Find the correct billing variant
    const variant = plan.billingVariants.find((v) => v.period === period);
    if (!variant) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing period for this plan.',
      });
    }

    // 3. Dynamically get the price based on the requested currency
    const priceForCurrency = variant.price.effective[currency];
    if (typeof priceForCurrency !== 'number') {
      return res.status(400).json({
        success: false,
        error: `Price for currency '${currency}' not found.`,
      });
    }

    // 4. Calculate the amount in the smallest currency unit (cents for USD, paise for INR)
    const amountInSmallestUnit = Math.round(priceForCurrency * 100);

    if (amountInSmallestUnit <= 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid amount for payment.' });
    }

    // 5. Create the Payment Intent with the dynamic currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      // 2. Ensure userId is correctly passed in the metadata
      metadata: {
        userId: userId.toString(), // Pass the authenticated user's ID
        planId: plan._id.toString(),
        planType: plan.planType,
        billingPeriod: period,
      },
    });

    // 6. Send the client secret back to the frontend
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const calculateEndDate = (period) => {
  const date = new Date();
  if (period === 'Weekly') date.setDate(date.getDate() + 7);
  if (period === 'Monthly') date.setMonth(date.getMonth() + 1);
  if (period === 'Quarterly') date.setMonth(date.getMonth() + 3);
  if (period === 'HalfYearly') date.setMonth(date.getMonth() + 6);
  if (period === 'Annual') date.setFullYear(date.getFullYear() + 1);
  return date;
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the 'payment_intent.succeeded' event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, planId, billingPeriod } = paymentIntent.metadata;
    const currency = paymentIntent.currency;

    // Use a database transaction to ensure all updates succeed or none do.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the plan details from the database
      const plan = await Plan.findById(planId).session(session).lean();
      if (!plan) throw new Error(`Plan not found for planId: ${planId}`);

      const variant = plan.billingVariants.find(
        (v) => v.period === billingPeriod,
      );
      if (!variant)
        throw new Error(`Billing variant '${billingPeriod}' not found.`);

      // Deactivate any previous purchases for this user
      await Purchase.updateMany(
        { user: userId, isActive: true },
        { $set: { isActive: false } },
        { session: session },
      );

      // 3. Create a new Purchase record
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
        amountPaid: paymentIntent.amount / 100,
        currency: currency,
        paymentStatus: 'completed',
        paymentGateway: 'stripe',
        paymentId: paymentIntent.id,
        startDate: new Date(),
        endDate: calculateEndDate(billingPeriod),
        isActive: true,
      });
      await newPurchase.save({ session });

      // 4. Update the user's plan, purchase, and usage limits
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error(`User not found for userId: ${userId}`);

      // Map plan features to the user schema's usageLimits keys
      const usageLimitMap = {
        'CV Creation': 'cvCreation',
        'Cover Letter': 'coverLetter',
        'AI Tailored Application': 'aiApplication',
        'Auto-Apply Daily limit': 'autoApply',
      };

      const newUsageLimits = {};
      variant.features.forEach((feature) => {
        const limitKey = usageLimitMap[feature.name];
        if (limitKey) {
          // Use -1 for "Unlimited", otherwise parse the number
          newUsageLimits[limitKey] =
            feature.value.toLowerCase() === 'unlimited'
              ? -1
              : parseInt(feature.value, 10);
        }
      });

      // Update the user document
      user.currentPlan = planId;
      user.currentPurchase = newPurchase._id;
      user.usageLimits = newUsageLimits;

      // Reset usage counters upon new purchase
      user.usageCounters = {
        cvCreation: 0,
        coverLetter: 0,
        aiApplication: 0,
        autoApply: 0,
        lastReset: new Date(),
      };

      await user.save({ session });

      // If all operations succeed, commit the transaction
      await session.commitTransaction();

      const { html, text } = await tm.compileWithTextFallback('plan_upgrade', {
        subject: `Congrats! You've Upgraded to ${planName} on ZobsAI`,
        name: user.fullName,
        planName,
        billingUrl: `${process.env.FRONTEND_URL}/account/billing`,
        managePlanUrl: `${process.env.FRONTEND_URL}/account/manage-plan`,
        companyUrl: process.env.FRONTEND_URL,
        companyAddress: process.env.COMPANY_ADDRESS || '',
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@zobsai.com',
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Congrats! You've Upgraded to ${planName} on ZobsAI`,
        html,
        text,
      });
    } catch (error) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      console.error(
        `Transaction aborted. Failed to process payment intent ${paymentIntent.id}:`,
        error,
      );
      return res
        .status(500)
        .json({ error: 'Failed to update user entitlements.' });
    } finally {
      session.endSession();
    }
  }

  res.status(200).json({ received: true });
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const purchase = await Purchase.findOne({ paymentId: paymentIntentId });

    if (!purchase) {
      return res.status(202).json({ success: true, status: 'processing' });
    }

    return res
      .status(200)
      .json({ success: true, status: purchase.paymentStatus });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getActivePlan = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required.' });
    }

    const user = await User.findById(userId).populate({
      path: 'currentPurchase',
      populate: {
        path: 'plan',
        model: 'Plan',
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    // 3. Check if an active, non-expired purchase exists.
    const hasActivePlan =
      user.currentPurchase &&
      user.currentPurchase.plan &&
      user.currentPurchase.isActive &&
      user.currentPurchase.endDate > new Date();

    if (hasActivePlan) {
      // User has an active plan. Return its details.
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
          usageLimits: user.usageLimits, // Also return their current limits
          usageCounters: user.usageCounters, // And their current usage
        },
      });
    } else {
      // User does not have an active plan or it has expired.
      return res.status(200).json({
        success: true,
        message: 'No active plan found.',
        data: {
          isActive: false,
          planType: 'Free', // Default to 'Free' plan if no active subscription
        },
      });
    }
  } catch (error) {
    console.error('Error fetching active plan:', error);
    res
      .status(500)
      .json({ success: false, message: 'An internal server error occurred.' });
  }
};

export const createSimplePurchaseDev = async (req, res) => {
  const { planId, period } = req.body;
  const userId = req.user._id;

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

  // Retry logic for TransientTransactionError (WriteConflict)
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

      if (user.currentPurchase && user.currentPurchase.endDate > new Date()) {
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

      const variant = plan.billingVariants.find((v) => v.period === period);
      if (!variant) {
        throw new Error('Invalid billing period for this plan.');
      }

      // Deactivate any previous active purchases for this user
      await Purchase.updateMany(
        { user: userId, isActive: true },
        { $set: { isActive: false } },
        { session },
      );

      // Create a new Purchase record
      const newPurchase = new Purchase({
        user: userId,
        plan: planId,
        billingVariant: {
          period: period,
          price: {
            usd: variant.price.effective.usd,
            inr: variant.price.effective.inr,
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

      const usageLimitMap = {
        'CV Creation': 'cvCreation',
        'Cover Letter': 'coverLetter',
        'AI Tailored Application': 'aiApplication',
        'Auto-Apply Daily limit': 'autoApply',
      };

      const newUsageLimits = {};
      variant.features.forEach((feature) => {
        const limitKey = usageLimitMap[feature.name];
        if (limitKey) {
          newUsageLimits[limitKey] =
            feature.value.toLowerCase() === 'unlimited'
              ? -1
              : parseInt(feature.value, 10);
        }
      });

      user.currentPlan = planId;
      user.currentPurchase = newPurchase._id;
      user.usageLimits = newUsageLimits;
      user.usageCounters = {
        cvCreation: 0,
        coverLetter: 0,
        aiApplication: 0,
        autoApply: 0,
        lastReset: new Date(),
      };

      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      // If successful, send response and exit the loop
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

      // Check if the error is a transient transaction error (like WriteConflict)
      if (
        error.errorLabels &&
        error.errorLabels.includes('TransientTransactionError') &&
        attempt < maxRetries
      ) {
        console.log(
          `Write conflict encountered. Retrying transaction... Attempt ${
            attempt + 1
          }`,
        );
        // The loop will automatically continue to the next attempt
      } else {
        // If it's not a retryable error or we've exhausted retries, send a final error response
        console.error('Error creating simple purchase:', error);
        return res.status(500).json({
          success: false,
          message: 'An internal server error occurred.',
        });
      }
    }
  }
};
