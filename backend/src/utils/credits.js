import mongoose from 'mongoose';
import { User } from '../models/User.model.js'; // adjust path
import dayjs from 'dayjs';

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

  const current = Number(user.credits || 0);
  const newBalance = current + Number(amount);

  user.credits = newBalance;
  const tx = {
    type: amount >= 0 ? 'EARN' : 'SPEND',
    amount: Math.abs(Number(amount)),
    balanceAfter: newBalance,
    kind,
    meta,
    createdAt: new Date(),
  };
  user.creditTransactions = user.creditTransactions || [];
  user.creditTransactions.push(tx);
  await user.save();
  return tx;
}

export async function spendCredits(userOrId, cost, kind = 'spend', meta = {}) {
  return addCredits(userOrId, -Math.abs(Number(cost)), kind, meta);
}

// ---------- transaction queries ----------
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
    case 'COMPLETE_JOB_SEARCH_SETTINGS':
      amount = 10;
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

    // daily checkin - one per 24 hours
    case 'DAILY_CHECKIN':
      amount = CREDIT_EARN.DAILY_CHECKIN;
      {
        const last = lastTxOfKind(user, kind);
        if (
          last &&
          Date.now() - new Date(last.createdAt).getTime() < 24 * 60 * 60 * 1000
        )
          allow = false;
      }
      break;

    // job search daily - limit once per day
    case 'JOB_SEARCH_DAILY':
      amount = CREDIT_EARN.JOB_SEARCH_DAILY;
      {
        const last = lastTxOfKind(user, kind);
        if (
          last &&
          Date.now() - new Date(last.createdAt).getTime() < 24 * 60 * 60 * 1000
        )
          allow = false;
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

    // likes/comments/shares - small value but limit per day (default max 20/day)
    case 'LIKE_COMMENT_SHARE':
    case 'SHARE_SOCIAL_CONTENT':
      amount = CREDIT_EARN.LIKE_COMMENT_SHARE || 1;
      // count last 24h and cap to 20
      {
        const count24 = (user.creditTransactions || []).filter(
          (t) =>
            t.kind === kind &&
            Date.now() - new Date(t.createdAt).getTime() < 24 * 60 * 60 * 1000,
        ).length;
        const cap = 20;
        if (count24 >= cap) allow = false;
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
  } catch (e) {
    // never block earning credits because redirect inference failed
    // leave meta as-is
  }

  const tx = await addCredits(user, amount, kind, finalMeta);

  return { tx, balance: user.credits };
}
