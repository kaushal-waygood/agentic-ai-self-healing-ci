import mongoose from 'mongoose';
import { User } from '../models/User.model.js'; // adjust path
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const CREDIT_COSTS = {
  CV_GENERATION: 10,
  COVER_LETTER: 10,
  AUTO_APPLY: 1,
  AUTOPILOT_AGENT_CREATE: 10,
  TAILORED_APPLY: 20,
  LINKEDIN_OPTIMISER: 30,
  JOB_MATCH_SCORE: 10,
  CV_ATS_SCORE: 10,
  CV_ATS_OPTIMISER: 20,
  AI_MOCK_INTERVIEW: 10,
};

export const CREDIT_EARN = {
  SIGNUP_WITH_REFERRAL_REFERRED: 50,
  SIGNUP_WITH_REFERRAL_REFERRER: 50,
  DAILY_CHECKIN: 10,
  FIRST_JOB_SEARCH: 5,
  FIRST_CV: 10,
  FIRST_CL: 10,
  PROFILE_COMPLETE_PERSONAL: 10,
  PROFILE_COMPLETE_EDUCATION: 10,
  PROFILE_COMPLETE_EXPERIENCE: 10,
  PROFILE_COMPLETE_PROJECT: 10,
  PROFILE_COMPLETE_SKILL: 10,
  PROFILE_COMPLETE_JOB_PREFERENCES: 10,
  JOB_SEARCH_DAILY: 5,
  FOLLOW_SOCIAL: 5,
  READ_BLOG: 5,
  ALLOW_BROWSER_NOTIF: 20,
  FIRST_AUTO_AGENT_SETUP: 10,
  FIRST_AUTO_APPLICATION_SENT: 10,
  APPLY_ON_COMPANY_SITE: 1,
  LIKE_COMMENT_SHARE: 1,
  SHARE_SOCIAL_CONTENT: 1,
  VISITJOB_SITE: 5,
  COMPLETE_JOB_SEARCH_SETTINGS: 10,
};

const CREDIT_TZ = 'Asia/Kolkata';
const MAX_CREDIT_TRANSACTIONS = 500;
const SOCIAL_ENGAGEMENT_DAILY_CAP = 20;

export const AUTOPILOT_AGENT_JOB_LIMITS = Object.freeze({
  FREE: 5,
  WEEKLY: 5,
  MONTHLY: 12,
  DEFAULT: 5,
  MAX: 12,
});

const resolveAutopilotDailyJobLimit = ({
  hasActivePlan,
  planType,
  billingPeriod,
}) => {
  if (!hasActivePlan || planType === 'Free') {
    return AUTOPILOT_AGENT_JOB_LIMITS.FREE;
  }

  if (planType === 'Weekly' || billingPeriod === 'Weekly') {
    return AUTOPILOT_AGENT_JOB_LIMITS.WEEKLY;
  }

  if (planType === 'Monthly') {
    return AUTOPILOT_AGENT_JOB_LIMITS.MONTHLY;
  }

  return AUTOPILOT_AGENT_JOB_LIMITS.DEFAULT;
};

// ---------- helpers ----------
export async function resolveUser(userOrId) {
  if (!userOrId) throw new Error('userOrId required');
  if (
    typeof userOrId === 'string' ||
    userOrId instanceof mongoose.Types.ObjectId
  ) {
    const u = await User.findById(userOrId);
    if (!u) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return u;
  } else if (userOrId._id) {
    return userOrId;
  } else {
    throw new Error('Invalid userOrId');
  }
}

export async function addCredits(userOrId, amount, kind = 'adjust', meta = {}) {
  const user = await resolveUser(userOrId);
  const amountNum = Number(amount);
  const userId = user._id;

  const tx = {
    type: amountNum >= 0 ? 'EARN' : 'SPEND',
    amount: Math.abs(amountNum),
    kind,
    meta,
    createdAt: new Date(),
  };

  // Atomic update: $inc credits and $push transaction in one pipeline
  const updated = await User.findOneAndUpdate(
    { _id: userId },
    [
      {
        $set: {
          credits: { $add: [{ $ifNull: ['$credits', 0] }, amountNum] },
        },
      },
      {
        $set: {
          creditTransactions: {
            $slice: [
              {
                $concatArrays: [
                  [
                    {
                      $mergeObjects: [
                        tx,
                        { balanceAfter: '$credits' },
                      ],
                    },
                  ],
                  { $ifNull: ['$creditTransactions', []] },
                ],
              },
              MAX_CREDIT_TRANSACTIONS,
            ],
          },
        },
      },
    ],
    { new: true },
  );

  if (!updated) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return { ...tx, balanceAfter: updated.credits };
}

export async function spendCredits(userOrId, cost, kind = 'spend', meta = {}) {
  const user = await resolveUser(userOrId);
  const costNum = Math.abs(Number(cost));
  const current = Number(user.credits || 0);

  if (current < costNum) {
    const err = new Error('Insufficient credits');
    err.status = 400;
    err.balance = current;
    err.required = costNum;
    throw err;
  }

  return addCredits(userOrId, -costNum, kind, meta);
}

export async function getAutopilotEntitlements(userOrId) {
  const userId =
    typeof userOrId === 'string' || userOrId instanceof mongoose.Types.ObjectId
      ? userOrId
      : userOrId?._id;

  if (!userId) {
    throw new Error('userOrId required');
  }

  const user = await User.findById(userId)
    .select('usageLimits currentPurchase')
    .populate({
      path: 'currentPurchase',
      select: 'billingVariant isActive endDate plan',
      populate: { path: 'plan', select: 'planType' },
    })
    .lean();

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const purchase = user.currentPurchase;
  const now = new Date();
  const hasActivePlan =
    purchase &&
    purchase.plan &&
    (purchase.isActive === true || purchase.isActive === 'true') &&
    new Date(purchase.endDate) > now;

  const planType = hasActivePlan ? purchase.plan.planType : 'Free';
  const billingPeriod = hasActivePlan
    ? purchase.billingVariant?.period || null
    : null;

  const dailyJobLimit = resolveAutopilotDailyJobLimit({
    hasActivePlan,
    planType,
    billingPeriod,
  });

  const configuredAgentLimit = Number(user.usageLimits?.aiAutoApply);
  const maxAgents =
    !hasActivePlan || planType === 'Free'
      ? 1
      : Number.isFinite(configuredAgentLimit) && configuredAgentLimit > 0
        ? configuredAgentLimit
        : Number.POSITIVE_INFINITY;

  return {
    planType,
    billingPeriod,
    dailyJobLimit,
    maxAgents,
    isFree: !hasActivePlan || planType === 'Free',
  };
}

// ---------- transaction queries ----------
function isSameCalendarDay(date1, date2, tz = CREDIT_TZ) {
  const d1 = dayjs(date1).tz(tz);
  const d2 = dayjs(date2).tz(tz);
  return d1.isSame(d2, 'day');
}

function lastTxOfKind(user, kind, metaFilter = {}) {
  const txs = (user.creditTransactions || [])
    .filter((t) => t.kind === kind)
    .filter((t) => {
      if (!Object.keys(metaFilter).length) return true;
      for (const k of Object.keys(metaFilter)) {
        if (!t.meta || String(t.meta[k]) !== String(metaFilter[k]))
          return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return txs[0] || null;
}

function countTxsInWindow(user, kind, msWindow = 24 * 60 * 60 * 1000) {
  const cutoff = Date.now() - msWindow;
  return (user.creditTransactions || []).filter(
    (t) => t.kind === kind && new Date(t.createdAt).getTime() >= cutoff,
  ).length;
}

export async function earnCreditsForAction(userOrId, action, meta = {}) {
  const user = await resolveUser(userOrId);
  action = String(action);

  let amount = 0;
  let kind = action;
  let allow = true;

  // decide amount and rules
  switch (action) {
    // one-time profile and first-time things
    case 'FIRST_CV':
      amount = CREDIT_EARN.FIRST_CV; // one-time
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'FIRST_CL':
      amount = CREDIT_EARN.FIRST_CL;
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'FIRST_AUTO_AGENT_SETUP':
      amount = CREDIT_EARN.FIRST_AUTO_AGENT_SETUP;
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'FIRST_AUTO_APPLICATION_SENT':
      amount = CREDIT_EARN.FIRST_AUTO_APPLICATION_SENT;
      if (lastTxOfKind(user, kind)) allow = false;
      break;

    // profile completeness -- use one-time claim per kind; callers should verify fields
    case 'PROFILE_COMPLETE_PERSONAL':
      amount = CREDIT_EARN.PROFILE_COMPLETE_PERSONAL;
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'PROFILE_COMPLETE_EDUCATION':
      amount = CREDIT_EARN.PROFILE_COMPLETE_EDUCATION;
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'PROFILE_COMPLETE_EXPERIENCE':
      amount = CREDIT_EARN.PROFILE_COMPLETE_EXPERIENCE;
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'PROFILE_COMPLETE_PROJECT':
      amount = CREDIT_EARN.PROFILE_COMPLETE_PROJECT;
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'PROFILE_COMPLETE_SKILL':
      amount = CREDIT_EARN.PROFILE_COMPLETE_SKILL;
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'PROFILE_COMPLETE_JOB_PREFERENCES':
      amount = CREDIT_EARN.PROFILE_COMPLETE_JOB_PREFERENCES;
      if (lastTxOfKind(user, kind)) allow = false;
      break;
    case 'COMPLETE_JOB_SEARCH_SETTINGS':
      amount = CREDIT_EARN.COMPLETE_JOB_SEARCH_SETTINGS;
      if (lastTxOfKind(user, kind)) allow = false;
      break;

    // social follows - one-time per platform
    case 'FOLLOW_LINKEDIN':
    case 'FOLLOW_INSTAGRAM':
    case 'FOLLOW_FACEBOOK':
    case 'FOLLOW_YOUTUBE':
    case 'FOLLOW_TIKTOK':
      amount = CREDIT_EARN.FOLLOW_SOCIAL;
      // ensure meta.platform matches action or use action itself
      if (lastTxOfKind(user, kind)) allow = false;
      break;

    // read blog - one-time per blog (meta.blogId recommended)
    case 'READ_BLOG':
      amount = CREDIT_EARN.READ_BLOG;
      if (meta.blogId) {
        if (lastTxOfKind(user, kind, { blogId: meta.blogId })) allow = false;
      } else {
        if (lastTxOfKind(user, kind)) allow = false;
      }
      break;

    // allow browser notif - one-time
    case 'ALLOW_BROWSER_NOTIF':
      amount = CREDIT_EARN.ALLOW_BROWSER_NOTIF;
      if (lastTxOfKind(user, kind)) allow = false;
      break;

    // daily checkin - one per calendar day (Asia/Kolkata)
    case 'DAILY_CHECKIN':
      amount = CREDIT_EARN.DAILY_CHECKIN;
      {
        const last = lastTxOfKind(user, kind);
        if (last && isSameCalendarDay(last.createdAt, new Date())) allow = false;
      }
      break;

    // job search daily - one per calendar day (Asia/Kolkata), same logic as DAILY_CHECKIN
    case 'JOB_SEARCH_DAILY':
      amount = CREDIT_EARN.JOB_SEARCH_DAILY;
      {
        const last = lastTxOfKind(user, kind);
        if (last && isSameCalendarDay(last.createdAt, new Date())) allow = false;
      }
      break;

    // visit job site - one per job per user
    case 'VISITJOB_SITE':
      amount = CREDIT_EARN.VISITJOB_SITE;
      if (!meta.jobId) throw new Error('meta.jobId required for VISITJOB_SITE');
      if (lastTxOfKind(user, kind, { jobId: meta.jobId })) allow = false;
      break;

    // apply on company site - one credit per job visit to company site
    case 'APPLY_ON_COMPANY_SITE':
      amount = CREDIT_EARN.APPLY_ON_COMPANY_SITE || 1;
      if (!meta.jobId)
        throw new Error('meta.jobId required for APPLY_ON_COMPANY_SITE');
      if (lastTxOfKind(user, kind, { jobId: meta.jobId })) allow = false;
      break;

    // likes/comments/shares - shared 20/day cap across both actions (calendar day, Asia/Kolkata)
    case 'LIKE_COMMENT_SHARE':
    case 'SHARE_SOCIAL_CONTENT':
      amount =
        action === 'SHARE_SOCIAL_CONTENT'
          ? CREDIT_EARN.SHARE_SOCIAL_CONTENT || 1
          : CREDIT_EARN.LIKE_COMMENT_SHARE || 1;
      {
        const today = dayjs().tz(CREDIT_TZ);
        const countToday = (user.creditTransactions || []).filter(
          (t) =>
            (t.kind === 'LIKE_COMMENT_SHARE' ||
              t.kind === 'SHARE_SOCIAL_CONTENT') &&
            dayjs(t.createdAt).tz(CREDIT_TZ).isSame(today, 'day'),
        ).length;
        if (countToday >= SOCIAL_ENGAGEMENT_DAILY_CAP) allow = false;
      }
      break;

    default:
      throw new Error('Unknown earn action: ' + action);
  }

  if (!allow) {
    const err = new Error('Action cannot be claimed now or already claimed');
    err.status = 409;
    throw err;
  }
  const redirectForAction = (act, m) => {
    if (m && m.redirectUrl) return m.redirectUrl;

    switch (act) {
      case 'FIRST_CV':
      case 'CV_GENERATION':
        return '/dashboard/cv-builder';

      case 'FIRST_CL':
      case 'COVER_LETTER':
        return '/dashboard/cover-letter-generator';

      case 'DAILY_CHECKIN':
        return '/rewards';

      case 'FOLLOW_LINKEDIN':
      case 'FOLLOW_INSTAGRAM':
      case 'FOLLOW_FACEBOOK':
      case 'FOLLOW_YOUTUBE':
      case 'FOLLOW_TIKTOK':
        return '/social-follow';

      case 'READ_BLOG':
        return m.blogUrl || '/blogs';

      case 'VISITJOB_SITE':

      case 'APPLY_ON_COMPANY_SITE':
        if (m && m.jobId) return `/jobs/${m.jobId}`;
        return '/jobs';

      case 'PROFILE_COMPLETE_PERSONAL':
      case 'PROFILE_COMPLETE_EDUCATION':
      case 'PROFILE_COMPLETE_EXPERIENCE':
      case 'PROFILE_COMPLETE_PROJECT':
      case 'PROFILE_COMPLETE_SKILL':
        return '/dashboard/profile';

      case 'ALLOW_BROWSER_NOTIF':
        return '/settings/notifications';

      case 'FIRST_AUTO_AGENT_SETUP':
      case 'FIRST_AUTO_APPLICATION_SENT':
        return '/dashboard/ai-auto-apply';

      default:
        return '/rewards';
    }
  };

  const finalMeta = Object.assign({}, meta || {});
  try {
    const inferred = redirectForAction(action, meta || {});
    if (inferred) finalMeta.redirectUrl = finalMeta.redirectUrl || inferred;
  } catch (e) {}

  const tx = await addCredits(user, amount, kind, finalMeta);

  return { tx, balance: user.credits };
}
