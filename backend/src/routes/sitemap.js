import express from 'express';
import { countJobs, fetchJobsPage } from '../controllers/job.controller.js';
const router = express.Router();

router.get('/sitemap-count', async (req, res) => {
  try {
    const count = await countJobs({ published: true });
    return res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ count: 0 });
  }
});

router.get('/sitemap-entries', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5000, 5000); // protect limit
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const jobs = await fetchJobsPage(
      { published: true },
      { page, limit, fields: ['slug', 'updatedAt'] },
    );

    const entries = jobs.map((j) => ({
      url: `https://www.zobsai.com/jobs/${j.slug}`,
      lastModified: j.updatedAt
        ? new Date(j.updatedAt).toISOString()
        : undefined,
    }));

    res.json(entries);
  } catch (err) {
    console.error('Error getting sitemap entries', err);
    res.status(500).json([]);
  }
});

export default router;
