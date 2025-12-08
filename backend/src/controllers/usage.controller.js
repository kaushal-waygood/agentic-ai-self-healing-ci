// controllers/planFeatures.controller.js
import { Plan } from '../models/Plans.model.js'; // adjust path if needed
import { Usage } from '../models/Usage.model.js'; // adjust path if needed
import { User } from '../models/User.model.js';

const parseFeatureValue = (raw) => {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  if (s === '-1') return { raw: s, unlimited: true, value: -1 };
  const n = Number(s);
  if (!Number.isNaN(n)) return { raw: s, unlimited: false, value: n };
  return { raw: s, unlimited: false, value: s };
};

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

const FEATURE_MAP = {
  'cv-creation': 'cvCreation',
  'cover-letter': 'coverLetter',
  'ai-application': 'aiApplication',
  'auto-apply': 'autoApply',
};

const updateUsageCounter = async (userId, feature, creditsUsed) => {
  const schemaFeature = FEATURE_MAP[feature];
  if (!schemaFeature) return;

  await User.findByIdAndUpdate(userId, {
    $inc: { [`usageCounters.${schemaFeature}`]: creditsUsed },
  });
};

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

export const getUserUsage = async (req, res) => {
  try {
    const userId = req.user?._id;
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
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getUserUsageLimits = async (req, res) => {
  try {
    const userId = req.user?._id;
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
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const trackUsage = async (req, res) => {
  try {
    const { feature, action, details, creditsUsed = 1 } = req.body;
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const canProceed = await checkUsageLimit(userId, feature, creditsUsed);
    if (!canProceed) {
      return res
        .status(429)
        .json({ success: false, message: 'Usage limit exceeded' });
    }

    // Run in parallel
    const [usage] = await Promise.all([
      Usage.create({
        user: userId,
        feature,
        action,
        details,
        creditsUsed,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }),
      updateUsageCounter(userId, feature, creditsUsed),
    ]);

    return res
      .status(201)
      .json({ success: true, message: 'Usage tracked', data: usage });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getAllFeatures = async (req, res) => {
  try {
    const plans = await Plan.find({}, 'planType billingVariants').lean();
    const featuresMap = {};

    plans.forEach((plan) => {
      plan.billingVariants?.forEach((bv) => {
        bv.features?.forEach((f) => {
          const val = parseFeatureLimitValue(f.value);
          const entry = {
            planType: plan.planType,
            period: bv.period,
            name: f.name,
            rawValue: f.value,
            unlimited: val === -1,
            value: val === -1 ? null : val,
          };
          if (!featuresMap[f.name]) featuresMap[f.name] = [];
          featuresMap[f.name].push(entry);
        });
      });
    });

    const result = Object.entries(featuresMap).map(([name, availability]) => ({
      name,
      availability,
    }));
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

const checkUsageLimit = async (userId, feature, creditsUsed) => {
  const schemaFeature = FEATURE_MAP[feature];
  if (!schemaFeature) return false;

  const user = await User.findById(userId)
    .select('usageLimits usageCounters')
    .lean();
  if (!user) return false;

  const limit = user.usageLimits?.[schemaFeature];
  const counter = user.usageCounters?.[schemaFeature] || 0;

  // -1 means unlimited
  if (limit === -1 || limit === '-1') return true;
  if (typeof limit !== 'number') return false;

  return counter + (creditsUsed || 0) <= limit;
};
