import {
  buildDashboardAnalyticsDTO,
  buildUserDashboardAnalyticsDTO,
  buildGeminiDashboardAnalyticsDTO,
  resolveDateRange,
} from '../services/analytics.service.js';

export async function dashboardAnalytics(req, res) {
  try {
    console.log(req.query);
    const { start, end } = resolveDateRange(req.query);
    const data = await buildDashboardAnalyticsDTO({ start, end });

    res.json({
      success: true,
      data,
      meta: {
        from: start.toISOString(),
        to: end.toISOString(),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function userDashboardAnalytics(req, res) {
  try {
    const data = await buildUserDashboardAnalyticsDTO();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
}

export async function geminiDashboardAnalytics(req, res) {
  try {
    const data = await buildGeminiDashboardAnalyticsDTO();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
}
