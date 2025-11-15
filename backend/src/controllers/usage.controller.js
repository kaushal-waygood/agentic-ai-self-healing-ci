import { Usage } from '../models/Usage.js';
import { User } from '../models/User.model.js';

export const trackUsage = async (req, res) => {
  try {
    const { feature, action, details, creditsUsed = 1 } = req.body;
    const userId = req.user._id;

    const canProceed = await checkUsageLimit(userId, feature, creditsUsed);

    if (!canProceed) {
      return res.status(429).json({
        success: false,
        message: 'Usage limit exceeded for this feature',
      });
    }

    // Create usage record
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

    // Update user's usage counter
    await updateUsageCounter(userId, feature, creditsUsed);

    res.status(201).json({
      success: true,
      message: 'Usage tracked successfully',
      data: usage,
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUserUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { feature, startDate, endDate } = req.query;

    const filter = { user: userId };

    if (feature) filter.feature = feature;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const usage = await Usage.find(filter).sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUserUsageLimits = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      data: user.usageLimits,
    });
  } catch (error) {
    console.error('Error fetching usage limits:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const checkUsageLimit = async (userId, feature, creditsUsed) => {
  const user = await User.findById(userId);
  if (!user) return false;

  // Map feature names from request to schema property names
  const featureMap = {
    'cv-creation': 'cvCreation',
    'cover-letter': 'coverLetter',
    'ai-application': 'aiApplication',
    'auto-apply': 'autoApply',
  };

  const schemaFeature = featureMap[feature];

  if (!schemaFeature) {
    console.error('Unknown feature:', feature);
    return false;
  }

  const limit = user.usageLimits[schemaFeature];
  const counter = user.usageCounters[schemaFeature];

  // Unlimited usage
  if (limit === -1) return true;

  // Check if limit is exceeded
  return counter + creditsUsed <= limit;
};

const updateUsageCounter = async (userId, feature, creditsUsed) => {
  const featureMap = {
    'cv-creation': 'cvCreation',
    'cover-letter': 'coverLetter',
    'ai-application': 'aiApplication',
    'auto-apply': 'autoApply',
  };

  const schemaFeature = featureMap[feature];

  if (!schemaFeature) {
    console.error('Unknown feature:', feature);
    return;
  }

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
