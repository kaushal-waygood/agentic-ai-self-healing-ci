import dayjs from 'dayjs';
import { User } from '../models/User.model.js';
import {
  earnCreditsForAction,
  // CREDIT_COSTS,
  spendCredits,
} from '../utils/credits.js';

import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const IST = 'Asia/Kolkata';

const ITEM_IDS = {
  CV_GENERATION: 'CV_GENERATION',
  COVER_LETTER: 'COVER_LETTER',
  JOB_MATCH_SCORE: 'JOB_MATCH_SCORE',
  AUTO_APPLY: 'AUTO_APPLY',
  CV_ATS_SCORE: 'CV_ATS_SCORE',
  AUTO_APPLY_DAILY_LIMIT: 'AUTO_APPLY_DAILY_LIMIT',
  AI_TAILORED_APPLICATION: 'AI_TAILORED_APPLICATION',
};

// --- 2. Define Costs (Must match Frontend UI) ---
const CREDIT_COSTS = {
  [ITEM_IDS.CV_GENERATION]: 10,
  [ITEM_IDS.COVER_LETTER]: 10, // Gives +3 letters based on logic below
  [ITEM_IDS.JOB_MATCH_SCORE]: 10,
  [ITEM_IDS.AUTO_APPLY]: 10,
  [ITEM_IDS.CV_ATS_SCORE]: 10,
  [ITEM_IDS.AUTO_APPLY_DAILY_LIMIT]: 10,
  [ITEM_IDS.AI_TAILORED_APPLICATION]: 10,
};

// --- 3. Define Database Fields ---
const USAGE_LIMIT_MAP = {
  'AI CV Creation': 'cvCreation',
  'AI Cover Letter': 'coverLetter',
  'AI Auto Application': 'aiAutoApply',
  'Auto-Apply Daily limit': 'aiAutoApplyDailyLimit',
  'AI Job Match Score': 'jobMatching',
  'AI ATS Score': 'atsScore',
  'AI Tailored Application': 'aiApplication',
};

// --- 4. Define Logic: What happens when an item is bought? ---
const USAGE_LIMIT_INCREMENTS = {
  [ITEM_IDS.CV_GENERATION]: {
    field: USAGE_LIMIT_MAP['AI CV Creation'], // 'cvCreation'
    perUnit: 1,
  },
  [ITEM_IDS.COVER_LETTER]: {
    field: USAGE_LIMIT_MAP['AI Cover Letter'], // 'coverLetter'
    perUnit: 3, // Logic Update: Frontend says "+3 Cover Letters", so we increment by 3 here
  },
  [ITEM_IDS.JOB_MATCH_SCORE]: {
    field: USAGE_LIMIT_MAP['AI Job Match Score'], // 'jobMatching'
    perUnit: 1,
  },
  [ITEM_IDS.AUTO_APPLY]: {
    field: USAGE_LIMIT_MAP['AI Auto Application'], // 'aiAutoApply'
    perUnit: 1,
  },
  [ITEM_IDS.CV_ATS_SCORE]: {
    field: USAGE_LIMIT_MAP['AI ATS Score'], // 'atsScore'
    perUnit: 1,
  },
  [ITEM_IDS.AUTO_APPLY_DAILY_LIMIT]: {
    field: USAGE_LIMIT_MAP['Auto-Apply Daily limit'], // 'aiAutoApplyDailyLimit'
    perUnit: 1, // Increases daily limit by 1 per purchase (or adjust to 5 if that's the business rule)
  },
  [ITEM_IDS.AI_TAILORED_APPLICATION]: {
    field: USAGE_LIMIT_MAP['AI Tailored Application'], // 'aiApplication'
    perUnit: 1,
  },
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

    const streak = user.dailyStreak || {};

    const today = dayjs().tz(IST);
    const last = streak.lastClaimedAt
      ? dayjs(streak.lastClaimedAt).tz(IST)
      : null;

    const canClaimToday = !last || !last.isSame(today, 'day');

    console.log('canClaimToday', canClaimToday);

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
    // Check against the updated CREDIT_COSTS map
    if (CREDIT_COSTS[item.id] === undefined) {
      return res.status(400).json({
        success: false,
        message: `Unknown item id: ${item.id}`,
      });
    }
  }

  // Compute total cost on the server
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
    // Ensure spendCredits function exists and works as expected
    if (typeof spendCredits === 'function') {
      await spendCredits(user, totalCost, 'CREDITS_CHECKOUT', {
        items: normalizedItems,
      });
    } else {
      // Fallback if helper not imported (Logic from original snippet implies it exists)
      user.credits = currentBalance - totalCost;
      if (!user.creditTransactions) user.creditTransactions = [];
      user.creditTransactions.push({
        amount: -totalCost,
        type: 'CREDITS_CHECKOUT',
        meta: { items: normalizedItems },
        date: new Date(),
      });
    }

    // Ensure usageLimits exists
    if (!user.usageLimits) {
      user.usageLimits = {};
    }

    // Update usage limits according to what was purchased
    for (const item of normalizedItems) {
      const rule = USAGE_LIMIT_INCREMENTS[item.id];

      // If no rule exists, we simply charge credits but don't increase limits (optional behavior)
      if (!rule || !rule.field) continue;

      const key = rule.field;
      // Calculate increment: (Rule Per Unit * Qty Bought)
      // Example: Buy 1 "Cover Letter" pack -> 3 * 1 = +3 limit
      const inc = (rule.perUnit || 1) * item.quantity;

      user.usageLimits[key] = Number(user.usageLimits[key] || 0) + inc;
    }

    // Let Mongoose know nested object changed
    user.markModified('usageLimits');
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
