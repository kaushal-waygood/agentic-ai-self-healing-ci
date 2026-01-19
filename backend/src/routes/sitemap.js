import express from 'express';
import { countJobs } from '../controllers/job.controller.js';
import { Job } from '../models/jobs.model.js';
const router = express.Router();

export async function fetchJobsPage({ page = 1, limit = 5000 } = {}) {
  const projection = {};

  const skip = (page - 1) * limit;

  return Job.find({ published: true }) // Added filter to match your route logic
    .select(projection)
    .sort({ updatedAt: -1 }) // This is what triggers the memory error
    .skip(skip)
    .limit(limit)
    .allowDiskUse(true) // <--- CRITICAL: Allows MongoDB to use temp files for sorting
    .lean() // Good: keeps memory usage low by returning POJOs
    .exec();
}

router.get('/sitemap-count', async (req, res) => {
  try {
    const count = await countJobs({ published: true });
    return res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ count: 0 });
  }
});

router.get('/sitemap-enteries', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5000, 5000);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    // Ensure fetchJobsPage is using .select('slug updatedAt')
    // and .lean() for maximum performance.
    const jobs = await fetchJobsPage(
      { published: true },
      {
        page,
        limit,
      },
    );

    console.log(jobs);

    const entries = jobs.map((j) => ({
      url: `https://www.zobsai.com/jobs/${j.slug}`,
      lastModified: j.updatedAt
        ? new Date(j.updatedAt).toISOString()
        : undefined,
    }));

    console.log(entries);

    res.json(entries);
  } catch (err) {
    console.error('Error getting sitemap entries', err);
    res.status(500).json([]);
  }
});

export default router;
