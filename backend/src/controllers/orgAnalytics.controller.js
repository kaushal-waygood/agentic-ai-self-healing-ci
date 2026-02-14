// controllers/orgAnalytics.controller.js
import mongoose from 'mongoose';
import { Job } from '../models/jobs.model.js';
import { JobInteraction } from '../models/jobInteraction.model.js';
import { AppliedJob } from '../models/AppliedJob.js';
// import { getDateRange } from '../utils/dateRange.js';

// utils/dateRange.js
export const getDateRange = ({ range, from, to }) => {
  const now = new Date();

  if (from && to) {
    return {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  if (!range) return null;

  const start = new Date(now);

  switch (range) {
    case '24h':
      start.setHours(now.getHours() - 24);
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    default:
      return null;
  }

  return { $gte: start, $lte: now };
};

export const getOrganizationSummaryAnalytics = async (req, res) => {
  const { organization: organizationId } = req.user;
  const { range, from, to } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: 'Invalid organizationId' });
    }

    const orgId = new mongoose.Types.ObjectId(organizationId);
    const dateFilter = getDateRange({ range, from, to });

    const jobs = await Job.find({ organizationId: orgId }).select('_id');
    const jobIds = jobs.map((j) => j._id);

    if (!jobIds.length) {
      return res.json({
        jobs: 0,
        funnel: {},
        applications: {},
      });
    }

    const interactionMatch = {
      job: { $in: jobIds },
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const applicationMatch = {
      job: { $in: jobIds },
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const interactions = await JobInteraction.aggregate([
      { $match: interactionMatch },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const applications = await AppliedJob.aggregate([
      { $match: applicationMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const interactionMap = interactions.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const impressions = interactionMap.IMPRESSION || 0;
    const views = interactionMap.VIEW || 0;
    const applied = interactionMap.APPLIED || 0;

    res.json({
      range: from && to ? { from, to } : range || 'all',
      jobs: jobIds.length,
      funnel: {
        impressions,
        views,
        saved: interactionMap.SAVED || 0,
        applied,
        visit: interactionMap.VISIT || 0,
        conversion: {
          impressionToView: impressions
            ? +((views / impressions) * 100).toFixed(2)
            : 0,
          viewToApply: views ? +((applied / views) * 100).toFixed(2) : 0,
        },
      },
      applications: applications.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
