// console.log('Running analytics...\n');

// import dotenv from 'dotenv';
// dotenv.config();

// import xlsx from 'xlsx';
// import connectDB from './src/config/db.js';
// import { User } from './src/models/User.model.js';

// /* =========================
//    HELPERS
// ========================= */

// function percent(part, total) {
//   return total === 0 ? '0%' : ((part / total) * 100).toFixed(2) + '%';
// }

// function last7DaysRange() {
//   const end = new Date();
//   const start = new Date();
//   start.setDate(end.getDate() - 7);
//   return { start, end };
// }

// /* =========================
//    ANALYTICS
// ========================= */

// async function runAnalytics() {
//   const { start } = last7DaysRange();

//   const excelSheets = {};

//   /* =========================
//      USER OVERVIEW (LIFETIME)
//   ========================= */

//   const totalUsers = await User.countDocuments();
//   const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

//   console.log('👥 USER OVERVIEW (LIFETIME)');
//   console.table([
//     { Metric: 'Total Users', Value: totalUsers },
//     { Metric: 'Verified Users', Value: verifiedUsers },
//     { Metric: 'Unverified Users', Value: totalUsers - verifiedUsers },
//     { Metric: 'Verification Rate', Value: percent(verifiedUsers, totalUsers) },
//   ]);

//   excelSheets['User Overview'] = [
//     { Metric: 'Total Users', Value: totalUsers },
//     { Metric: 'Verified Users', Value: verifiedUsers },
//     { Metric: 'Unverified Users', Value: totalUsers - verifiedUsers },
//     { Metric: 'Verification Rate', Value: percent(verifiedUsers, totalUsers) },
//   ];

//   /* =========================
//      AUTH METHODS (LIFETIME)
//   ========================= */

//   const authMethods = await User.aggregate([
//     { $group: { _id: '$authMethod', users: { $sum: 1 } } },
//   ]);

//   console.log('\n🔐 AUTH METHODS (LIFETIME)');
//   console.table(
//     authMethods.map((a) => ({
//       AuthMethod: a._id || 'unknown',
//       Users: a.users,
//       Percentage: percent(a.users, totalUsers),
//     })),
//   );

//   excelSheets['Auth Methods'] = authMethods.map((a) => ({
//     AuthMethod: a._id || 'unknown',
//     Users: a.users,
//     Percentage: percent(a.users, totalUsers),
//   }));

//   /* =========================
//      ROLES (LIFETIME)
//   ========================= */

//   const roles = await User.aggregate([
//     { $group: { _id: '$role', users: { $sum: 1 } } },
//     { $sort: { users: -1 } },
//   ]);

//   console.log('\n🧑‍💼 ROLES (LIFETIME)');
//   console.table(
//     roles.map((r) => ({
//       Role: r._id,
//       Users: r.users,
//     })),
//   );

//   excelSheets['Roles'] = roles.map((r) => ({
//     Role: r._id,
//     Users: r.users,
//   }));

//   /* =========================
//      ACCOUNT TYPES (LIFETIME)
//   ========================= */

//   const accountTypes = await User.aggregate([
//     { $group: { _id: '$accountType', users: { $sum: 1 } } },
//     { $sort: { users: -1 } },
//   ]);

//   console.log('\n🏷️ ACCOUNT TYPES (LIFETIME)');
//   console.table(
//     accountTypes.map((a) => ({
//       AccountType: a._id,
//       Users: a.users,
//     })),
//   );

//   excelSheets['Account Types'] = accountTypes.map((a) => ({
//     AccountType: a._id,
//     Users: a.users,
//   }));

//   /* =========================
//      REFERRALS (LIFETIME)
//   ========================= */

//   const referral = await User.aggregate([
//     {
//       $group: {
//         _id: null,
//         totalUsers: { $sum: 1 },
//         referrers: {
//           $sum: { $cond: [{ $gt: ['$referralCount', 0] }, 1, 0] },
//         },
//         totalReferrals: { $sum: '$referralCount' },
//       },
//     },
//   ]);

//   const r = referral[0] || {};

//   console.log('\n🔗 REFERRALS (LIFETIME)');
//   console.table([
//     { Metric: 'Users Who Referred', Value: r.referrers || 0 },
//     { Metric: 'Total Referrals', Value: r.totalReferrals || 0 },
//     {
//       Metric: 'Avg Referrals / User',
//       Value: ((r.totalReferrals || 0) / (r.totalUsers || 1)).toFixed(2),
//     },
//   ]);

//   excelSheets['Referrals'] = [
//     { Metric: 'Users Who Referred', Value: r.referrers || 0 },
//     { Metric: 'Total Referrals', Value: r.totalReferrals || 0 },
//     {
//       Metric: 'Avg Referrals / User',
//       Value: ((r.totalReferrals || 0) / (r.totalUsers || 1)).toFixed(2),
//     },
//   ];

//   /* =========================
//      CREDITS (LIFETIME)
//   ========================= */

//   const credits = await User.aggregate([
//     {
//       $group: {
//         _id: null,
//         totalCredits: { $sum: '$credits' },
//         avgCredits: { $avg: '$credits' },
//         maxCredits: { $max: '$credits' },
//         zeroCreditUsers: {
//           $sum: { $cond: [{ $eq: ['$credits', 0] }, 1, 0] },
//         },
//       },
//     },
//   ]);

//   const c = credits[0] || {};

//   console.log('\n💰 CREDITS (LIFETIME)');
//   console.table([
//     { Metric: 'Total Credits', Value: c.totalCredits || 0 },
//     { Metric: 'Avg Credits/User', Value: (c.avgCredits || 0).toFixed(2) },
//     { Metric: 'Max Credits (Whale)', Value: c.maxCredits || 0 },
//     { Metric: 'Users with 0 Credits', Value: c.zeroCreditUsers || 0 },
//   ]);

//   excelSheets['Credits'] = [
//     { Metric: 'Total Credits', Value: c.totalCredits || 0 },
//     { Metric: 'Avg Credits/User', Value: (c.avgCredits || 0).toFixed(2) },
//     { Metric: 'Max Credits', Value: c.maxCredits || 0 },
//     { Metric: 'Users with 0 Credits', Value: c.zeroCreditUsers || 0 },
//   ];

//   /* =========================
//      PLANS & PURCHASES
//   ========================= */

//   const plans = await User.aggregate([
//     {
//       $group: {
//         _id: null,
//         usersWithPlan: {
//           $sum: { $cond: [{ $ifNull: ['$currentPlan', false] }, 1, 0] },
//         },
//         usersWithPurchase: {
//           $sum: { $cond: [{ $ifNull: ['$currentPurchase', false] }, 1, 0] },
//         },
//       },
//     },
//   ]);

//   const p = plans[0] || {};

//   console.log('\n💳 PLANS & PURCHASES');
//   console.table([
//     { Metric: 'Users with Active Plan', Value: p.usersWithPlan || 0 },
//     { Metric: 'Users with Purchase History', Value: p.usersWithPurchase || 0 },
//     {
//       Metric: 'Paid Conversion Rate',
//       Value: percent(p.usersWithPurchase || 0, totalUsers),
//     },
//   ]);

//   excelSheets['Plans & Purchases'] = [
//     { Metric: 'Users with Active Plan', Value: p.usersWithPlan || 0 },
//     { Metric: 'Users with Purchase History', Value: p.usersWithPurchase || 0 },
//     {
//       Metric: 'Paid Conversion Rate',
//       Value: percent(p.usersWithPurchase || 0, totalUsers),
//     },
//   ];

//   /* =========================
//      EXPORT EXCEL
//   ========================= */

//   const workbook = xlsx.utils.book_new();

//   for (const [name, data] of Object.entries(excelSheets)) {
//     const sheet = xlsx.utils.json_to_sheet(data);
//     xlsx.utils.book_append_sheet(workbook, sheet, name);
//   }

//   const fileName = `user-analytics-${Date.now()}.xlsx`;
//   xlsx.writeFile(workbook, fileName);

//   console.log(`\n📊 Excel exported: ${fileName}`);
// }

// /* =========================
//    RUN
// ========================= */

// (async () => {
//   try {
//     await connectDB();
//     await runAnalytics();
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Analytics failed:', err);
//     process.exit(1);
//   }
// })();

import 'dotenv/config';
import mongoose from 'mongoose';
import xlsx from 'xlsx';
import connectDB from './src/config/db.js';
import { User } from './src/models/User.model.js';

console.log('Running platform analytics...\n');

/* =========================
   HELPERS
========================= */

function percent(part, total) {
  return total === 0 ? '0%' : ((part / total) * 100).toFixed(2) + '%';
}

/* =========================
   ANALYTICS
========================= */

async function runAnalytics() {
  const sheets = {};

  /* =========================
     1. TOTAL USERS
  ========================= */

  const totalUsers = await User.countDocuments();

  sheets['1. Total Users'] = [{ Metric: 'Total Users', Value: totalUsers }];

  /* =========================
     2. COMPLETED ONBOARDING
     (assumed via email verification)
  ========================= */

  const onboardedUsers = await User.countDocuments({
    isEmailVerified: true,
  });

  sheets['2. Onboarding'] = [
    { Metric: 'Onboarded Users', Value: onboardedUsers },
    {
      Metric: 'Onboarding Completion Rate',
      Value: percent(onboardedUsers, totalUsers),
    },
  ];

  /* =========================
     3. REFERRAL USERS
  ========================= */

  const referralUsers = await User.countDocuments({
    referralCount: { $gt: 0 },
  });

  sheets['3. Referrals'] = [
    { Metric: 'Users Who Used Referrals', Value: referralUsers },
    {
      Metric: 'Referral Adoption Rate',
      Value: percent(referralUsers, totalUsers),
    },
  ];

  /* =========================
     4. MOST USED FEATURES
  ========================= */

  const featureAgg = await User.aggregate([
    {
      $group: {
        _id: null,
        cvCreation: { $sum: '$usageCounters.cvCreation' },
        aiAutoApply: { $sum: '$usageCounters.aiAutoApply' },
        atsScore: { $sum: '$usageCounters.atsScore' },
        jobMatching: { $sum: '$usageCounters.jobMatching' },
      },
    },
  ]);

  const f = featureAgg[0] || {};

  const features = [
    { Feature: 'CV Creation', Uses: f.cvCreation || 0 },
    { Feature: 'AI Auto Apply', Uses: f.aiAutoApply || 0 },
    { Feature: 'ATS Score', Uses: f.atsScore || 0 },
    { Feature: 'Job Matching', Uses: f.jobMatching || 0 },
  ].sort((a, b) => b.Uses - a.Uses);

  sheets['4. Feature Usage'] = features;

  /* =========================
     5. DROP-OFF POINTS
     (NOT TRACKED)
  ========================= */

  sheets['5. Drop-off Analysis'] = [
    {
      Status: 'Unavailable',
      Reason: 'No funnel, event, or page-level tracking exists in backend',
    },
  ];

  /* =========================
     6. TIME SPENT
     (NOT TRACKED)
  ========================= */

  sheets['6. Time Spent'] = [
    {
      Status: 'Unavailable',
      Reason: 'No session duration or page timing data stored',
    },
  ];

  /* =========================
     7. MULTI-DAY ACTIVE USERS
     (requires loginDates[])
  ========================= */

  let multiDayUsers = 'N/A';

  if (User.schema.path('loginDates')) {
    const result = await User.aggregate([
      {
        $project: {
          days: {
            $size: {
              $setUnion: [
                {
                  $map: {
                    input: '$loginDates',
                    as: 'd',
                    in: {
                      $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$$d',
                      },
                    },
                  },
                },
                [],
              ],
            },
          },
        },
      },
      { $match: { days: { $gte: 2 } } },
      { $count: 'users' },
    ]);

    multiDayUsers = result[0]?.users || 0;
  }

  sheets['7. Multi-day Active Users'] = [
    {
      Metric: 'Users Logged In 2+ Days',
      Value: multiDayUsers,
    },
  ];

  /* =========================
     EXPORT XLSX
  ========================= */

  const workbook = xlsx.utils.book_new();

  for (const [name, data] of Object.entries(sheets)) {
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, name);
  }

  const fileName = `platform-analytics-${Date.now()}.xlsx`;
  xlsx.writeFile(workbook, fileName);
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
    console.error('❌ Analytics failed:', err.message);
    process.exit(1);
  }
})();
