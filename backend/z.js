import mongoose from 'mongoose';
import xlsx from 'xlsx';
import { JobInteraction } from './src/models/jobInteraction.model.js';
import { config } from './src/config/config.js';

/* =========================
   HELPERS
========================= */

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
  await mongoose.connect(
    'mongodb+srv://arsalan:n3nq9IZZJsOOC5Cl@careerpilot.zysihya.mongodb.net/careerpilot?retryWrites=true&w=majority&appName=careerpilot',
  );
  console.log('MongoDB connected\n');
}

/* =========================
   ANALYTICS
========================= */

async function runAnalytics() {
  const { start } = last7DaysRange();
  const excelSheets = {};

  /* =========================
     LIFETIME INTERACTIONS
  ========================= */

  const totalInteractions = await JobInteraction.countDocuments();

  console.log('📌 JOB INTERACTIONS (LIFETIME)');
  console.table([{ Metric: 'Total Interactions', Value: totalInteractions }]);

  excelSheets['Lifetime Overview'] = [
    { Metric: 'Total Interactions', Value: totalInteractions },
  ];

  /* =========================
     INTERACTION TYPE BREAKDOWN
  ========================= */

  const byType = await JobInteraction.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  console.log('\n📊 INTERACTIONS BY TYPE (LIFETIME)');
  console.table(
    byType.map((i) => ({
      Interaction: i._id,
      Count: i.count,
    })),
  );

  excelSheets['Interaction Types'] = byType.map((i) => ({
    Interaction: i._id,
    Count: i.count,
  }));

  /* =========================
     APPLICATION STATUS FUNNEL
  ========================= */

  const applicationStatus = await JobInteraction.aggregate([
    { $match: { type: 'APPLIED' } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  console.log('\n🧾 APPLICATION STATUS (LIFETIME)');
  console.table(
    applicationStatus.map((s) => ({
      Status: s._id,
      Applications: s.count,
    })),
  );

  excelSheets['Application Status (All Time)'] = applicationStatus.map((s) => ({
    Status: s._id,
    Applications: s.count,
  }));

  /* =========================
     TOP JOBS BY ENGAGEMENT
  ========================= */

  const topJobs = await JobInteraction.aggregate([
    {
      $group: {
        _id: '$job',
        impressions: {
          $sum: { $cond: [{ $eq: ['$type', 'IMPRESSION'] }, 1, 0] },
        },
        views: {
          $sum: { $cond: [{ $eq: ['$type', 'VIEW'] }, 1, 0] },
        },
        saves: {
          $sum: { $cond: [{ $eq: ['$type', 'SAVED'] }, 1, 0] },
        },
        applies: {
          $sum: { $cond: [{ $eq: ['$type', 'APPLIED'] }, 1, 0] },
        },
      },
    },
    { $sort: { applies: -1, views: -1 } },
    { $limit: 10 },
  ]);

  console.log('\n🔥 TOP JOBS BY ENGAGEMENT (LIFETIME)');
  console.table(
    topJobs.map((j) => ({
      JobId: j._id.toString(),
      Impressions: j.impressions,
      Views: j.views,
      Saves: j.saves,
      Applies: j.applies,
    })),
  );

  excelSheets['Top Jobs (Lifetime)'] = topJobs.map((j) => ({
    JobId: j._id.toString(),
    Impressions: j.impressions,
    Views: j.views,
    Saves: j.saves,
    Applies: j.applies,
  }));

  /* =========================
     LAST 7 DAYS – DAILY ACTIVITY
  ========================= */

  const daily7Days = await JobInteraction.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          type: '$type',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  console.log('\n📅 LAST 7 DAYS – DAILY INTERACTIONS');
  console.table(
    daily7Days.map((d) => ({
      Date: `${d._id.year}-${d._id.month}-${d._id.day}`,
      Interaction: d._id.type,
      Count: d.count,
    })),
  );

  excelSheets['Daily Activity (7 Days)'] = daily7Days.map((d) => ({
    Date: `${d._id.year}-${d._id.month}-${d._id.day}`,
    Interaction: d._id.type,
    Count: d.count,
  }));

  /* =========================
     LAST 7 DAYS – FUNNEL
  ========================= */

  const funnel7Days = await JobInteraction.aggregate([
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  console.log('\n🧮 LAST 7 DAYS – JOB FUNNEL');
  console.table(
    funnel7Days.map((f) => ({
      Stage: f._id,
      Count: f.count,
    })),
  );

  excelSheets['Job Funnel (7 Days)'] = funnel7Days.map((f) => ({
    Stage: f._id,
    Count: f.count,
  }));

  /* =========================
     LAST 7 DAYS – APPLICATION STATUS
  ========================= */

  const appStatus7Days = await JobInteraction.aggregate([
    {
      $match: {
        createdAt: { $gte: start },
        type: 'APPLIED',
      },
    },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  console.log('\n✅ LAST 7 DAYS – APPLICATION STATUS');
  console.table(
    appStatus7Days.map((s) => ({
      Status: s._id,
      Count: s.count,
    })),
  );

  excelSheets['Application Status (7 Days)'] = appStatus7Days.map((s) => ({
    Status: s._id,
    Count: s.count,
  }));

  /* =========================
     LAST 7 DAYS – SOURCE PERFORMANCE
  ========================= */

  const source7Days = await JobInteraction.aggregate([
    {
      $match: {
        createdAt: { $gte: start },
        'meta.source': { $exists: true },
      },
    },
    {
      $group: {
        _id: '$meta.source',
        interactions: { $sum: 1 },
      },
    },
    { $sort: { interactions: -1 } },
  ]);

  console.log('\n🌐 LAST 7 DAYS – TRAFFIC SOURCES');
  console.table(
    source7Days.map((s) => ({
      Source: s._id,
      Interactions: s.interactions,
    })),
  );

  excelSheets['Traffic Sources (7 Days)'] = source7Days.map((s) => ({
    Source: s._id,
    Interactions: s.interactions,
  }));

  /* =========================
     EXPORT EXCEL
  ========================= */

  const workbook = xlsx.utils.book_new();

  for (const [sheetName, data] of Object.entries(excelSheets)) {
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  const fileName = `job-interaction-analytics-${Date.now()}.xlsx`;
  xlsx.writeFile(workbook, fileName);

  console.log(`\n📊 Excel exported: ${fileName}`);
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
    console.error('❌ JobInteraction analytics failed:', err);
    process.exit(1);
  }
})();
