/** @format */

import { Router } from 'express';
import {
  postManualJob,
  fetchAndSaveRapidJobs,
  getAllJobs,
  getMannualyJobs,
  getRapidJobs,
  getSingleJobDetail,
  getAllEmploymentTypes,
  getAllExperiences,
  getJobDetailBySlug,
  toggleJobStatus,
} from '../controllers/job.controller.js';
import {
  authMiddleware,
  isOrgAdmin,
  isStudent,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/mannual', authMiddleware, isOrgAdmin, postManualJob);
router.post('/rapid', fetchAndSaveRapidJobs);
router.get('/find', getJobDetailBySlug);
router.get('/find/:jobId', getSingleJobDetail);

router.get('/', getAllJobs);
router.get('/hosted', getMannualyJobs);
router.get('/external', getRapidJobs);
router.get('/employment-types', getAllEmploymentTypes);
router.get('/experience-levels', getAllExperiences);

router.get('/:jobId', getSingleJobDetail);
router.patch('/status/:jobId', authMiddleware, isOrgAdmin, toggleJobStatus);

export default router;
