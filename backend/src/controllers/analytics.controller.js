import {
  buildDashboardAnalyticsDTO,
  buildUserDashboardAnalyticsDTO,
  buildGeminiDashboardAnalyticsDTO,
  resolveDateRange,
} from '../services/analytics.service.js';
import { LoginHistory } from '../models/analyics/loginHistory.model.js';

export async function dashboardAnalytics(req, res) {
  try {
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

export const createLoginHistory = async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      ipAddress,
      userAgent,
      device,
      browser,
      os,
      location,
      loginMethod,
      status,
    } = req.body;

    const record = await LoginHistory.create({
      userId,
      sessionId,
      ipAddress,
      userAgent,
      device,
      browser,
      os,
      location,
      loginMethod,
      status,
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await LoginHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutUpdate = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const updated = await LoginHistory.findOneAndUpdate(
      { sessionId },
      {
        status: 'LOGOUT',
        logoutAt: new Date(),
      },
      { new: true },
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllLoginHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const history = await LoginHistory.find()
      .populate('userId', 'email fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
