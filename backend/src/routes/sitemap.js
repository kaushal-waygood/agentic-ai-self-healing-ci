import express from 'express';
import { countJobs } from '../controllers/job.controller.js';
import { Job } from '../models/jobs.model.js';

const router = express.Router();

const SITEMAP_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://zobsai.com'
    : process.env.NODE_ENV === 'development'
      ? 'https://dev.zobsai.com'
      : 'http://localhost:3000';

export async function fetchJobsPage({ page = 1, limit = 5000 } = {}) {
  const skip = (page - 1) * limit;

  return Job.find({ isActive: { $ne: false } })
    .select('slug updatedAt')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .allowDiskUse(true)
    .lean()
    .exec();
}

router.get('/sitemap-count', async (req, res) => {
  try {
    const count = await countJobs({ isActive: { $ne: false } });
    return res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ count: 0 });
  }
});

router.get('/sitemap', async (req, res) => {
  const staticPaths = [
    '',
    '/search-jobs',
    '/privacy-policy',
    '/terms-of-service',
    '/cancellation-refundpolicy',
    '/cookie-policy',
    '/bug-report',
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/my-docs',
  ];

  const staticEntries = staticPaths.map((path) => ({
    url: `${SITEMAP_BASE_URL}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.8,
  }));

  try {
    const jobs = await Job.find({ isActive: { $ne: false } })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 })
      .allowDiskUse(true)
      .lean()
      .exec();

    const jobEntries = jobs
      .filter((j) => j.slug)
      .map((j) => ({
        url: `${SITEMAP_BASE_URL}/jobs/${j.slug}`,
        lastModified: j.updatedAt
          ? new Date(j.updatedAt).toISOString()
          : undefined,
        changeFrequency: 'weekly',
        priority: 0.6,
      }));

    res.json([...staticEntries, ...jobEntries]);
  } catch (err) {
    console.error('Error getting sitemap', err);
    res.json(staticEntries);
  }
});

export default router;
