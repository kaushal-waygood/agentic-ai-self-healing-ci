import dayjs from 'dayjs';
import { User } from '../models/User.model.js';
import {
  earnCreditsForAction,
  CREDIT_COSTS,
  spendCredits,
} from '../utils/credits.js';

const USAGE_LIMIT_INCREMENTS = {
  CV_GENERATION: { field: 'cvCreation', perUnit: 1 },
  COVER_LETTER: { field: 'coverLetter', perUnit: 1 },
  AUTOPILOT_AGENT_CREATE: { field: 'aiAutoApply', perUnit: 1 },
  TAILORED_APPLY: { field: 'aiMannualApplication', perUnit: 1 },
  AI_MOCK_INTERVIEW: { field: 'aiApplication', perUnit: 1 },

  JOB_MATCH_SCORE: { field: 'jobMatching', perUnit: 1 },
  LINKEDIN_OPTIMISER: null,
  CV_ATS_SCORE: { field: 'atsScore', perUnit: 1 },
  CV_ATS_OPTIMISER: null,
};

function computeDailyStreakUpdate(user, { allowRecovery = true } = {}) {
  const today = dayjs().startOf('day');

  const streak = user.dailyStreak || {};
  const lastClaimedAt = streak.lastClaimedAt
    ? dayjs(streak.lastClaimedAt).startOf('day')
    : null;

  // Already claimed today
  if (lastClaimedAt && lastClaimedAt.isSame(today)) {
    return {
      alreadyClaimedToday: true,
      current: streak.current || 0,
      longest: streak.longest || 0,
      usedRecovery: false,
    };
  }

  let newCurrent = 1;
  let usedRecovery = false;

  if (lastClaimedAt) {
    const diffDays = today.diff(lastClaimedAt, 'day');

    if (diffDays === 1) {
      // normal consecutive day
      newCurrent = (streak.current || 0) + 1;
    } else if (
      diffDays === 2 &&
      allowRecovery &&
      (streak.freezeTokens || 0) > 0
    ) {
      // missed EXACTLY 1 day in between → use freeze token to keep streak
      newCurrent = (streak.current || 0) + 1;
      usedRecovery = true;
    } else {
      // bigger gap or no recovery ⇒ reset
      newCurrent = 1;
    }
  } else {
    newCurrent = 1; // first claim
  }

  const newLongest = Math.max(streak.longest || 0, newCurrent);

  return {
    alreadyClaimedToday: false,
    current: newCurrent,
    longest: newLongest,
    usedRecovery,
  };
}

// --------- Controllers ---------

export const claimCredits = async (req, res) => {
  const { _id } = req.user || {};
  const { action, meta } = req.body || {};

  if (!_id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!action) {
    return res
      .status(400)
      .json({ success: false, message: 'Action is required' });
  }

  try {
    const { tx, balance } = await earnCreditsForAction(_id, action, meta || {});

    return res.status(200).json({
      success: true,
      message: 'Credits claimed successfully',
      data: {
        balance,
        transaction: tx,
      },
    });
  } catch (err) {
    console.error('claimCredits error:', err);

    return res.status(err.status || 500).json({
      success: false,
      message:
        err.status === 409
          ? 'Action already claimed or not allowed now'
          : err.message || 'Failed to claim credits',
    });
  }
};

export const claimDailyStreak = async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const streak = user.dailyStreak || {};

    const { alreadyClaimedToday, current, longest, usedRecovery } =
      computeDailyStreakUpdate(user, { allowRecovery: true });

    if (alreadyClaimedToday) {
      return res.status(409).json({
        message: 'Daily check-in already claimed for today',
        streak: {
          current: streak.current || 0,
          longest: streak.longest || 0,
          lastClaimedAt: streak.lastClaimedAt || null,
          freezeTokens: streak.freezeTokens || 0,
        },
      });
    }

    // If we used a freeze token, consume it
    if (usedRecovery && (streak.freezeTokens || 0) > 0) {
      streak.freezeTokens = (streak.freezeTokens || 0) - 1;
      streak.lastRecoveryAt = new Date();
    }

    // update streak info
    streak.current = current;
    streak.longest = longest;
    streak.lastClaimedAt = new Date();
    user.dailyStreak = streak;

    // award DAILY_CHECKIN credits via earnCreditsForAction
    let tx, balance;
    try {
      const result = await earnCreditsForAction(_id, 'DAILY_CHECKIN', {
        source: 'streak',
      });
      tx = result.tx;
      balance = result.balance;
    } catch (err) {
      console.error('Error awarding DAILY_CHECKIN credits:', err);
      await user.save(); // streak is still updated
      return res.status(err.status || 500).json({
        message:
          err.status === 409
            ? 'Streak updated but credits already claimed via rule'
            : 'Failed to award credits for daily check-in',
        streak,
      });
    }

    await user.save();

    return res.status(200).json({
      message: usedRecovery
        ? 'Daily check-in claimed. Streak recovered using a freeze token.'
        : 'Daily check-in claimed successfully.',
      streak: {
        current: streak.current,
        longest: streak.longest,
        lastClaimedAt: streak.lastClaimedAt,
        freezeTokens: streak.freezeTokens || 0,
      },
      credits: {
        earned: tx.amount,
        balance,
        tx,
      },
    });
  } catch (error) {
    console.error('Error in claimDailyStreak:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDailyStreak = async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id).select('dailyStreak').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const streak = user.dailyStreak || {
      current: 0,
      longest: 0,
      lastClaimedAt: null,
    };

    const today = dayjs().startOf('day');
    const last = streak.lastClaimedAt
      ? dayjs(streak.lastClaimedAt).startOf('day')
      : null;

    const canClaimToday = !last || !last.isSame(today);

    return res.status(200).json({
      streak: {
        current: streak.current || 0,
        longest: streak.longest || 0,
        lastClaimedAt: streak.lastClaimedAt || null,
      },
      canClaimToday,
    });
  } catch (error) {
    console.error('Error in getDailyStreak:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkoutCredits = async (req, res) => {
  const { _id } = req.user || {};
  const { items } = req.body || {};

  console.log(req.body);

  if (!_id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Items array is required',
    });
  }

  // Normalize and validate items
  const normalizedItems = items.map((it) => ({
    id: String(it.id || '').trim(),
    quantity: Number(it.quantity || 0),
  }));

  for (const item of normalizedItems) {
    if (!item.id || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Each item must have a valid id and quantity > 0',
      });
    }
    if (!CREDIT_COSTS[item.id]) {
      return res.status(400).json({
        success: false,
        message: `Unknown item id: ${item.id}`,
      });
    }
  }

  // Compute total cost on the server (never trust client)
  let totalCost = 0;
  for (const item of normalizedItems) {
    const unitCost = CREDIT_COSTS[item.id];
    totalCost += unitCost * item.quantity;
  }

  if (totalCost <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Total cost must be positive',
    });
  }

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const currentBalance = Number(user.credits || 0);
    if (currentBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits',
        data: {
          balance: currentBalance,
          required: totalCost,
        },
      });
    }

    // Spend credits and log transaction
    await spendCredits(user, totalCost, 'CREDITS_CHECKOUT', {
      items: normalizedItems,
    });

    // Ensure usageLimits exists
    if (!user.usageLimits) {
      user.usageLimits = {};
    }

    // Update usage limits according to what was purchased
    for (const item of normalizedItems) {
      const rule = USAGE_LIMIT_INCREMENTS[item.id];
      if (!rule || !rule.field) continue;

      const key = rule.field;
      const inc = (rule.perUnit || 1) * item.quantity;

      user.usageLimits[key] = Number(user.usageLimits[key] || 0) + inc;
    }

    // Let Mongoose know nested object changed (to be safe)
    user.markModified && user.markModified('usageLimits');

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Checkout successful',
      data: {
        balance: user.credits,
        usageLimits: user.usageLimits,
        creditTransactions: (user.creditTransactions || []).slice(-30),
      },
    });
  } catch (err) {
    console.error('checkoutCredits error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to checkout using credits',
    });
  }
};
