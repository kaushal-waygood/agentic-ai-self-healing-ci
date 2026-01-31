import 'dotenv/config';
import mongoose from 'mongoose';
import xlsx from 'xlsx';
import { GeminiUsage } from './src/models/GeminiUsage.js';

console.log('Running Gemini Usage analytics (Excel export)...\n');

/* =========================
   DB CONNECT
========================= */

async function connectDB() {
  if (!process.env.MONGO_URL) {
    throw new Error('Missing MONGO_URL');
  }
  await mongoose.connect(process.env.MONGO_URL);
  console.log('MongoDB connected\n');
}

/* =========================
   ANALYTICS
========================= */

async function runAnalytics() {
  /* =========================
     OVERVIEW
  ========================= */

  const overview = await GeminiUsage.aggregate([
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalPromptTokens: { $sum: '$promptTokens' },
        totalOutputTokens: { $sum: '$outputTokens' },
        totalTokens: { $sum: '$totalTokens' },
        avgLatencyMs: { $avg: '$latencyMs' },
        maxLatencyMs: { $max: '$latencyMs' },
      },
    },
  ]);

  const overviewSheet = [
    {
      Metric: 'Total Calls',
      Value: overview[0]?.totalCalls || 0,
    },
    {
      Metric: 'Total Tokens',
      Value: overview[0]?.totalTokens || 0,
    },
    {
      Metric: 'Prompt Tokens',
      Value: overview[0]?.totalPromptTokens || 0,
    },
    {
      Metric: 'Output Tokens',
      Value: overview[0]?.totalOutputTokens || 0,
    },
    {
      Metric: 'Avg Latency (ms)',
      Value: Number((overview[0]?.avgLatencyMs || 0).toFixed(2)),
    },
    {
      Metric: 'Max Latency (ms)',
      Value: overview[0]?.maxLatencyMs || 0,
    },
  ];

  /* =========================
     BY MODEL
  ========================= */

  const byModel = await GeminiUsage.aggregate([
    {
      $group: {
        _id: { llm: '$llm', model: '$model' },
        calls: { $sum: 1 },
        totalTokens: { $sum: '$totalTokens' },
        avgLatencyMs: { $avg: '$latencyMs' },
      },
    },
    { $sort: { calls: -1 } },
  ]);

  const modelSheet = byModel.map((m) => ({
    LLM: m._id.llm,
    Model: m._id.model,
    Calls: m.calls,
    TotalTokens: m.totalTokens,
    AvgLatencyMs: Number(m.avgLatencyMs.toFixed(2)),
  }));

  /* =========================
     BY ENDPOINT
  ========================= */

  const byEndpoint = await GeminiUsage.aggregate([
    {
      $group: {
        _id: '$endpoint',
        calls: { $sum: 1 },
        totalTokens: { $sum: '$totalTokens' },
        avgLatencyMs: { $avg: '$latencyMs' },
      },
    },
    { $sort: { calls: -1 } },
  ]);

  const endpointSheet = byEndpoint.map((e) => ({
    Endpoint: e._id || 'unknown',
    Calls: e.calls,
    TotalTokens: e.totalTokens,
    AvgLatencyMs: Number(e.avgLatencyMs.toFixed(2)),
  }));

  /* =========================
     TOP USERS
  ========================= */

  const topUsers = await GeminiUsage.aggregate([
    {
      $group: {
        _id: '$userId',
        calls: { $sum: 1 },
        totalTokens: { $sum: '$totalTokens' },
      },
    },
    { $sort: { totalTokens: -1 } },
    { $limit: 20 },
  ]);

  const usersSheet = topUsers.map((u, i) => ({
    Rank: i + 1,
    UserId: u._id ? u._id.toString() : 'anonymous',
    Calls: u.calls,
    TotalTokens: u.totalTokens,
  }));

  /* =========================
     EXCEL EXPORT
  ========================= */

  const workbook = xlsx.utils.book_new();

  xlsx.utils.book_append_sheet(
    workbook,
    xlsx.utils.json_to_sheet(overviewSheet),
    'Overview',
  );

  xlsx.utils.book_append_sheet(
    workbook,
    xlsx.utils.json_to_sheet(modelSheet),
    'By Model',
  );

  xlsx.utils.book_append_sheet(
    workbook,
    xlsx.utils.json_to_sheet(endpointSheet),
    'By Endpoint',
  );

  xlsx.utils.book_append_sheet(
    workbook,
    xlsx.utils.json_to_sheet(usersSheet),
    'Top Users',
  );

  const fileName = `gemini-usage-analytics-${Date.now()}.xlsx`;
  xlsx.writeFile(workbook, fileName);

  console.log(`✅ Excel exported: ${fileName}`);
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
    console.error('❌ Excel analytics failed:', err.message);
    process.exit(1);
  }
})();
