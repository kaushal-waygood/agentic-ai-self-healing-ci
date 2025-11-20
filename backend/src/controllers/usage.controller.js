// controllers/planFeatures.controller.js
import { Plan } from '../models/Plans.model.js'; // adjust path if needed
import { Usage } from '../models/Usage.model.js'; // adjust path if needed

import { User } from '../models/User.model.js';

// helper to parse string feature values like "-1" (unlimited) or "5"
const parseFeatureValue = (raw) => {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  if (s === '-1') return { raw: s, unlimited: true, value: -1 };
  const n = Number(s);
  if (!Number.isNaN(n)) return { raw: s, unlimited: false, value: n };
  // fallback - return as string
  return { raw: s, unlimited: false, value: s };
};

// Build a consistent response shape for a single feature record
const buildFeatureEntry = (planType, period, featureObj) => {
  const parsed = parseFeatureValue(featureObj.value);
  return {
    planType,
    period,
    name: featureObj.name,
    rawValue: featureObj.value,
    unlimited: parsed && parsed.unlimited === true,
    value: parsed ? parsed.value : null,
  };
};

export const getAllFeatures = async (req, res) => {
  try {
    // fetch MINIMAL fields to avoid large payloads
    const plans = await Plan.find({}, 'planType billingVariants').lean();

    // map: featureName => array of { planType, period, value, unlimited }
    const featuresMap = {};

    plans.forEach((plan) => {
      const planType = plan.planType;
      (plan.billingVariants || []).forEach((bv) => {
        const period = bv.period;
        (bv.features || []).forEach((f) => {
          const entry = buildFeatureEntry(planType, period, f);
          if (!featuresMap[f.name]) featuresMap[f.name] = [];
          featuresMap[f.name].push(entry);
        });
      });
    });

    // Convert to array of { name, availability: [...] }
    const result = Object.entries(featuresMap).map(([name, availability]) => ({
      name,
      availability,
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('getAllFeatures error', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getPlanFeatures = async (req, res) => {
  try {
    const { planType } = req.params;
    const plan = await Plan.findOne({ planType }).lean();
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });

    // normalize features: [{ period, features: [{name, rawValue, value, unlimited}] }]
    const billingVariants = (plan.billingVariants || []).map((bv) => ({
      period: bv.period,
      features: (bv.features || []).map((f) => {
        const parsed = parseFeatureValue(f.value);
        return {
          name: f.name,
          rawValue: f.value,
          unlimited: parsed && parsed.unlimited === true,
          value: parsed ? parsed.value : null,
        };
      }),
    }));

    return res.status(200).json({
      success: true,
      data: {
        planType: plan.planType,
        billingVariants,
      },
    });
  } catch (err) {
    console.error('getPlanFeatures error', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getPlanBillingPeriodFeatures = async (req, res) => {
  try {
    const { planType, period } = req.params;
    const plan = await Plan.findOne({ planType }).lean();
    if (!plan)
      return res
        .status(404)
        .json({ success: false, message: 'Plan not found' });

    const variant = (plan.billingVariants || []).find(
      (bv) => bv.period === period,
    );
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: `Billing variant ${period} not found for plan ${planType}`,
      });
    }

    const features = (variant.features || []).map((f) => {
      const parsed = parseFeatureValue(f.value);
      return {
        name: f.name,
        rawValue: f.value,
        unlimited: parsed && parsed.unlimited === true,
        value: parsed ? parsed.value : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        planType: plan.planType,
        period: variant.period,
        price: variant.price, // leave price object as-is
        discountLabel: variant.discountLabel || null,
        features,
      },
    });
  } catch (err) {
    console.error('getPlanBillingPeriodFeatures error', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const trackUsage = async (req, res) => {
  try {
    const { feature, action, details, creditsUsed = 1 } = req.body;
    const userId = req.user && req.user._id;
    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const canProceed = await checkUsageLimit(userId, feature, creditsUsed);
    if (!canProceed) {
      return res.status(429).json({
        success: false,
        message: 'Usage limit exceeded for this feature',
      });
    }

    const usage = new Usage({
      user: userId,
      feature,
      action,
      details,
      creditsUsed,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    await usage.save();
    await updateUsageCounter(userId, feature, creditsUsed);

    return res.status(201).json({
      success: true,
      message: 'Usage tracked successfully',
      data: usage,
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/usage
 * query: ?feature=&startDate=&endDate=
 */
export const getUserUsage = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { feature, startDate, endDate } = req.query;
    const filter = { user: userId };

    if (feature) filter.feature = feature;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const usage = await Usage.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.status(200).json({ success: true, data: usage });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/usage/limits
 */
export const getUserUsageLimits = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId)
      .select('usageLimits usageCounters')
      .lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    return res.status(200).json({
      success: true,
      data: {
        usageLimits: user.usageLimits || {},
        usageCounters: user.usageCounters || {},
      },
    });
  } catch (error) {
    console.error('Error fetching usage limits:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

const FEATURE_MAP = {
  'cv-creation': 'cvCreation',
  'cover-letter': 'coverLetter',
  'ai-application': 'aiApplication',
  'auto-apply': 'autoApply',
};

const checkUsageLimit = async (userId, feature, creditsUsed) => {
  const user = await User.findById(userId).lean();
  if (!user) return false;

  const schemaFeature = FEATURE_MAP[feature];
  if (!schemaFeature) {
    console.error('Unknown feature:', feature);
    return false;
  }

  const limitRaw = user.usageLimits && user.usageLimits[schemaFeature];
  const counterRaw = user.usageCounters && user.usageCounters[schemaFeature];

  // interpret -1 / "-1" / null
  if (limitRaw === -1 || limitRaw === '-1') return true;
  const limit = typeof limitRaw === 'string' ? Number(limitRaw) : limitRaw;
  const counter =
    typeof counterRaw === 'string' ? Number(counterRaw) : counterRaw;

  if (limit === undefined || limit === null || Number.isNaN(limit)) {
    console.error('Invalid limit for user:', userId, schemaFeature, limitRaw);
    return false;
  }

  return (counter || 0) + (creditsUsed || 0) <= limit;
};

const updateUsageCounter = async (userId, feature, creditsUsed) => {
  const schemaFeature = FEATURE_MAP[feature];
  if (!schemaFeature) {
    console.error('Unknown feature:', feature);
    return;
  }
  await User.findByIdAndUpdate(userId, {
    $inc: { [`usageCounters.${schemaFeature}`]: creditsUsed },
  }).lean();
};

/**
 * Reset counters for all users (call from cron)
 */
export const resetUsageCounters = async () => {
  try {
    await User.updateMany(
      {},
      {
        $set: {
          'usageCounters.cvCreation': 0,
          'usageCounters.coverLetter': 0,
          'usageCounters.aiApplication': 0,
          'usageCounters.autoApply': 0,
          'usageCounters.lastReset': new Date(),
        },
      },
    );
  } catch (error) {
    console.error('Error resetting usage counters:', error);
  }
};
