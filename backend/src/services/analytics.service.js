import { JobInteraction } from '../models/jobInteraction.model.js';
import { User } from '../models/User.model.js';
import { GeminiUsage } from '../models/GeminiUsage.js';

const INTERACTION_ORDER = ['IMPRESSION', 'VIEW', 'SAVED', 'APPLIED'];

function percent(part, total) {
  return total === 0 ? 0 : Number(((part / total) * 100).toFixed(2));
}

export function resolveDateRange(query = {}) {
  const now = new Date();

  // Custom range has priority
  if (query.from && query.to) {
    const start = new Date(query.from);
    const end = new Date(query.to);

    if (isNaN(start) || isNaN(end)) {
      throw new Error('Invalid from/to date');
    }

    return { start, end };
  }

  const range = query.range || '7d';
  const start = new Date(now);

  switch (range) {
    case '24h':
      start.setHours(now.getHours() - 24);
      break;
    case '7d':
    default:
      start.setDate(now.getDate() - 7);
      break;
  }

  return { start, end: now };
}

/* ======================================================
   JOB ANALYTICS
====================================================== */

export async function buildDashboardAnalyticsDTO({ start, end }) {
  const [totalInteractions, totalApplications, applicationsRange] =
    await Promise.all([
      JobInteraction.countDocuments(),
      JobInteraction.countDocuments({ type: 'APPLIED' }),
      JobInteraction.countDocuments({
        type: 'APPLIED',
        createdAt: { $gte: start, $lte: end },
      }),
    ]);

  const funnelRaw = await JobInteraction.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const funnelMap = Object.fromEntries(funnelRaw.map((f) => [f._id, f.count]));

  const funnel7d = {
    labels: INTERACTION_ORDER,
    series: INTERACTION_ORDER.map((t) => funnelMap[t] || 0),
  };

  const impressions = funnelMap.IMPRESSION || 0;
  const conversionRate =
    impressions === 0
      ? 0
      : Number(((applicationsRange / impressions) * 100).toFixed(2));

  const byTypeRaw = await JobInteraction.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const byTypeMap = Object.fromEntries(byTypeRaw.map((t) => [t._id, t.count]));

  const interactionsByType = {
    labels: INTERACTION_ORDER,
    series: INTERACTION_ORDER.map((t) => byTypeMap[t] || 0),
  };

  const dailyRaw = await JobInteraction.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$type',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const days = [...new Set(dailyRaw.map((d) => d._id.day))].sort();

  const dailyInteractions7d = {
    labels: days,
    series: INTERACTION_ORDER.map((type) => ({
      name: type,
      data: days.map((day) => {
        const hit = dailyRaw.find(
          (d) => d._id.day === day && d._id.type === type,
        );
        return hit ? hit.count : 0;
      }),
    })),
  };

  const sourcesRaw = await JobInteraction.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        'meta.source': { $exists: true },
      },
    },
    { $group: { _id: '$meta.source', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  const trafficSources7d = {
    labels: sourcesRaw.map((s) => s._id),
    series: sourcesRaw.map((s) => s.count),
  };

  const topJobsRaw = await JobInteraction.aggregate([
    {
      $group: {
        _id: '$job',
        views: { $sum: { $cond: [{ $eq: ['$type', 'VIEW'] }, 1, 0] } },
        applies: { $sum: { $cond: [{ $eq: ['$type', 'APPLIED'] }, 1, 0] } },
      },
    },
    { $sort: { applies: -1, views: -1 } },
    { $limit: 10 },
  ]);

  return {
    kpis: {
      totalInteractions,
      totalApplications,
      applicationsRange,
      conversionRate,
    },
    funnel7d,
    interactionsByType,
    dailyInteractions7d,
    trafficSources7d,
    topJobs: topJobsRaw.map((j) => ({
      jobId: j._id.toString(),
      views: j.views,
      applies: j.applies,
    })),
  };
}

/* ======================================================
   USER ANALYTICS
====================================================== */

export async function buildUserDashboardAnalyticsDTO() {
  const totalUsers = await User.countDocuments();
  const onboardedUsers = await User.countDocuments({ isEmailVerified: true });
  const referralUsers = await User.countDocuments({
    referralCount: { $gt: 0 },
  });

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

  let multiDayActiveUsers = 'N/A';

  if (User.schema.path('loginDates')) {
    const res = await User.aggregate([
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

    multiDayActiveUsers = res[0]?.users || 0;
  }

  return {
    kpis: {
      totalUsers,
      onboardedUsers,
      onboardingRate: percent(onboardedUsers, totalUsers),
      referralUsers,
      referralAdoptionRate: percent(referralUsers, totalUsers),
    },
    distributions: {
      featureUsage: {
        labels: ['CV Creation', 'AI Auto Apply', 'ATS Score', 'Job Matching'],
        series: [
          f.cvCreation || 0,
          f.aiAutoApply || 0,
          f.atsScore || 0,
          f.jobMatching || 0,
        ],
      },
    },
    engagement: { multiDayActiveUsers },
    gaps: {
      dropOffTracking: false,
      timeSpentTracking: false,
    },
  };
}

/* ======================================================
   GEMINI ANALYTICS
====================================================== */

export async function buildGeminiDashboardAnalyticsDTO() {
  const overview = await GeminiUsage.aggregate([
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        promptTokens: { $sum: '$promptTokens' },
        outputTokens: { $sum: '$outputTokens' },
        totalTokens: { $sum: '$totalTokens' },
        avgLatencyMs: { $avg: '$latencyMs' },
        maxLatencyMs: { $max: '$latencyMs' },
      },
    },
  ]);

  const o = overview[0] || {};

  const byModelRaw = await GeminiUsage.aggregate([
    { $group: { _id: { llm: '$llm', model: '$model' }, calls: { $sum: 1 } } },
    { $sort: { calls: -1 } },
  ]);

  const byEndpointRaw = await GeminiUsage.aggregate([
    { $group: { _id: '$endpoint', calls: { $sum: 1 } } },
    { $sort: { calls: -1 } },
  ]);

  const topUsersRaw = await GeminiUsage.aggregate([
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

  return {
    kpis: {
      totalCalls: o.totalCalls || 0,
      totalTokens: o.totalTokens || 0,
      promptTokens: o.promptTokens || 0,
      outputTokens: o.outputTokens || 0,
      avgLatencyMs: Number((o.avgLatencyMs || 0).toFixed(2)),
      maxLatencyMs: o.maxLatencyMs || 0,
    },
    distributions: {
      byModel: {
        labels: byModelRaw.map((m) => `${m._id.llm}:${m._id.model}`),
        series: byModelRaw.map((m) => m.calls),
      },
      byEndpoint: {
        labels: byEndpointRaw.map((e) => e._id || 'unknown'),
        series: byEndpointRaw.map((e) => e.calls),
      },
    },
    tables: {
      topUsers: {
        columns: ['Rank', 'User ID', 'Calls', 'Total Tokens'],
        rows: topUsersRaw.map((u, i) => ({
          rank: i + 1,
          userId: u._id ? u._id.toString() : 'anonymous',
          calls: u.calls,
          totalTokens: u.totalTokens,
        })),
      },
    },
  };
}
