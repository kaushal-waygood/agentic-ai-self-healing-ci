import mongoose from 'mongoose';
import { User } from '../src/models/User.model.js';
import { config } from '../src/config/config.js';

/* =========================
   HELPERS
========================= */

function percent(part, total) {
  return total === 0 ? '0%' : ((part / total) * 100).toFixed(2) + '%';
}

function last7DaysRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  return { start, end };
}

/* =========================
   DB CONNECT
========================= */

async function connectDB() {
  await mongoose.connect(config.mongoUrl);
  console.log('MongoDB connected\n');
}

/* =========================
   ANALYTICS
========================= */

async function runAnalytics() {
  const { start } = last7DaysRange();

  /* =========================
     USER OVERVIEW (LIFETIME)
  ========================= */

  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

  console.log('👥 USER OVERVIEW (LIFETIME)');
  console.table([
    { Metric: 'Total Users', Value: totalUsers },
    { Metric: 'Verified Users', Value: verifiedUsers },
    { Metric: 'Unverified Users', Value: totalUsers - verifiedUsers },
    { Metric: 'Verification Rate', Value: percent(verifiedUsers, totalUsers) },
  ]);

  /* =========================
     AUTH METHODS (LIFETIME)
  ========================= */

  const authMethods = await User.aggregate([
    { $group: { _id: '$authMethod', users: { $sum: 1 } } },
  ]);

  console.log('\n🔐 AUTH METHODS (LIFETIME)');
  console.table(
    authMethods.map((a) => ({
      AuthMethod: a._id || 'unknown',
      Users: a.users,
      Percentage: percent(a.users, totalUsers),
    })),
  );

  /* =========================
     ROLES (LIFETIME)
  ========================= */

  const roles = await User.aggregate([
    { $group: { _id: '$role', users: { $sum: 1 } } },
    { $sort: { users: -1 } },
  ]);

  console.log('\n🧑‍💼 ROLES (LIFETIME)');
  console.table(
    roles.map((r) => ({
      Role: r._id,
      Users: r.users,
    })),
  );

  /* =========================
     ACCOUNT TYPES (LIFETIME)
  ========================= */

  const accountTypes = await User.aggregate([
    { $group: { _id: '$accountType', users: { $sum: 1 } } },
    { $sort: { users: -1 } },
  ]);

  console.log('\n🏷️ ACCOUNT TYPES (LIFETIME)');
  console.table(
    accountTypes.map((a) => ({
      AccountType: a._id,
      Users: a.users,
    })),
  );

  /* =========================
     REFERRALS (LIFETIME)
  ========================= */

  const referral = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        referrers: {
          $sum: { $cond: [{ $gt: ['$referralCount', 0] }, 1, 0] },
        },
        totalReferrals: { $sum: '$referralCount' },
      },
    },
  ]);

  const r = referral[0] || {};

  console.log('\n🔗 REFERRALS (LIFETIME)');
  console.table([
    { Metric: 'Users Who Referred', Value: r.referrers || 0 },
    { Metric: 'Total Referrals', Value: r.totalReferrals || 0 },
    {
      Metric: 'Avg Referrals / User',
      Value: ((r.totalReferrals || 0) / (r.totalUsers || 1)).toFixed(2),
    },
  ]);

  /* =========================
     CREDITS (LIFETIME)
  ========================= */

  const credits = await User.aggregate([
    {
      $group: {
        _id: null,
        totalCredits: { $sum: '$credits' },
        avgCredits: { $avg: '$credits' },
        maxCredits: { $max: '$credits' },
        zeroCreditUsers: {
          $sum: { $cond: [{ $eq: ['$credits', 0] }, 1, 0] },
        },
      },
    },
  ]);

  const c = credits[0] || {};

  console.log('\n💰 CREDITS (LIFETIME)');
  console.table([
    { Metric: 'Total Credits', Value: c.totalCredits || 0 },
    { Metric: 'Avg Credits/User', Value: (c.avgCredits || 0).toFixed(2) },
    { Metric: 'Max Credits (Whale)', Value: c.maxCredits || 0 },
    { Metric: 'Users with 0 Credits', Value: c.zeroCreditUsers || 0 },
  ]);

  /* =========================
     PLANS & PURCHASES
  ========================= */

  const plans = await User.aggregate([
    {
      $group: {
        _id: null,
        usersWithPlan: {
          $sum: { $cond: [{ $ifNull: ['$currentPlan', false] }, 1, 0] },
        },
        usersWithPurchase: {
          $sum: { $cond: [{ $ifNull: ['$currentPurchase', false] }, 1, 0] },
        },
      },
    },
  ]);

  const p = plans[0] || {};

  console.log('\n💳 PLANS & PURCHASES');
  console.table([
    { Metric: 'Users with Active Plan', Value: p.usersWithPlan || 0 },
    { Metric: 'Users with Purchase History', Value: p.usersWithPurchase || 0 },
    {
      Metric: 'Paid Conversion Rate',
      Value: percent(p.usersWithPurchase || 0, totalUsers),
    },
  ]);

  /* =========================
     FEATURE USAGE (LIFETIME)
  ========================= */

  const usage = await User.aggregate([
    {
      $group: {
        _id: null,
        cvCreation: { $avg: '$usageCounters.cvCreation' },
        aiAutoApply: { $avg: '$usageCounters.aiAutoApply' },
        atsScore: { $avg: '$usageCounters.atsScore' },
        jobMatching: { $avg: '$usageCounters.jobMatching' },
      },
    },
  ]);

  const u = usage[0] || {};

  console.log('\n⚙️ FEATURE USAGE (LIFETIME)');
  console.table([
    { Feature: 'CV Creation', AvgUsage: (u.cvCreation || 0).toFixed(2) },
    { Feature: 'AI Auto Apply', AvgUsage: (u.aiAutoApply || 0).toFixed(2) },
    { Feature: 'ATS Score', AvgUsage: (u.atsScore || 0).toFixed(2) },
    { Feature: 'Job Matching', AvgUsage: (u.jobMatching || 0).toFixed(2) },
  ]);

  /* =========================
     LAST 7 DAYS – SIGNUPS
  ========================= */

  const signups7Days = await User.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        users: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  console.log('\n📅 LAST 7 DAYS – NEW USERS');
  console.table(
    signups7Days.map((d) => ({
      Date: `${d._id.year}-${d._id.month}-${d._id.day}`,
      NewUsers: d.users,
    })),
  );

  /* =========================
     LAST 7 DAYS – VERIFIED
  ========================= */

  const verified7Days = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start },
        isEmailVerified: true,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        verifiedUsers: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  console.log('\n✅ LAST 7 DAYS – VERIFIED USERS');
  console.table(
    verified7Days.map((d) => ({
      Date: `${d._id.year}-${d._id.month}-${d._id.day}`,
      VerifiedUsers: d.verifiedUsers,
    })),
  );

  /* =========================
     LAST 7 DAYS – AUTH METHODS
  ========================= */

  const auth7Days = await User.aggregate([
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: '$authMethod', users: { $sum: 1 } } },
  ]);

  console.log('\n🔐 LAST 7 DAYS – AUTH METHODS');
  console.table(
    auth7Days.map((a) => ({
      AuthMethod: a._id || 'unknown',
      Users: a.users,
    })),
  );

  /* =========================
     LAST 7 DAYS – REFERRALS
  ========================= */

  const referral7Days = await User.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: null,
        referrers: {
          $sum: { $cond: [{ $gt: ['$referralCount', 0] }, 1, 0] },
        },
        totalReferrals: { $sum: '$referralCount' },
      },
    },
  ]);

  const r7 = referral7Days[0] || {};

  console.log('\n🔗 LAST 7 DAYS – REFERRALS');
  console.table([
    { Metric: 'Users Who Referred', Value: r7.referrers || 0 },
    { Metric: 'Total Referrals', Value: r7.totalReferrals || 0 },
  ]);
}

/* =========================
   RUN
========================= */

(async () => {
  try {
    await connectDB();
    await runAnalytics();
    process.exit(0);
  } catch (err) {
    console.error('❌ Analytics failed:', err);
    process.exit(1);
  }
})();
