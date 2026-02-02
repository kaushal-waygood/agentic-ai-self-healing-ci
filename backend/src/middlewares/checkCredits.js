// middlewares/credits.middleware.js
import { User } from '../models/User.model.js';

const ACTION_TO_DB_FIELD = {
  CV_GENERATION: 'cvCreation',
  CV_REGENERATION: 'cvCreation',
  COVER_LETTER: 'coverLetter',
  COVER_LETTER_GENERATION: 'coverLetter',
  TAILORED_APPLY: 'aiApplication',
  AI_AUTO_APPLY: 'aiAutoApply',
  AI_MANUAL_APPLY: 'aiMannualApplication',
  ATS_SCORE: 'atsScore',
  JOB_MATCHING: 'jobMatching',
};

export const checkCredits = (actionType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const usageField = ACTION_TO_DB_FIELD[actionType];

      if (!usageField) {
        return res.status(500).json({
          message: 'Server misconfiguration: unknown credit action',
        });
      }

      const user = await User.findById(userId).select(
        'usageCounters usageLimits currentPlan currentPurchase plan',
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const limit = user.usageLimits?.[usageField];
      const currentUsage = user.usageCounters?.[usageField] ?? 0;

      if (
        Number.isFinite(limit) &&
        limit >= 0 &&
        (currentUsage >= limit || currentUsage < 0)
      ) {
        return res.status(429).json({
          success: false,
          error: 'LIMIT_REACHED',
          message: `You have reached your limit for ${usageField}`,
          limit,
          usage: currentUsage,
          upgradeRequired: true,
        });
      }

      next();
    } catch (err) {
      console.error('[Credits Middleware Error]', err);
      return res.status(500).json({ message: 'Failed to verify usage limits' });
    }
  };
};
