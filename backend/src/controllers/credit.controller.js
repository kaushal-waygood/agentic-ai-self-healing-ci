import dayjs from 'dayjs';
import { User } from '../models/User.model.js';
import { earnCreditsForAction } from '../utils/credits.js';

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
