import { Router } from 'express';
import {
  postManualJob,
  getAllJobs,
  getMannualyJobs,
  getRapidJobs,
  getSingleJobDetail,
  getAllEmploymentTypes,
  getAllExperiences,
  getJobDetailBySlug,
  toggleJobStatus,
  getJobFromJobId,
  searchJobs,
  jobViewsCount,
  getAllJobsForStudent,
  getAllJobsQueries,
  trackJobClick,
} from '../controllers/job.controller.js';
import {
  authMiddleware,
  isAnyAdmin,
  isGeneralUser,
  isHr,
  isStudent,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/job-queries', getAllJobsQueries);

router.get('/job/:jobId', getJobFromJobId);
router.get('/job/views/:jobId', authMiddleware, isStudent, jobViewsCount);
router.get('/job-desc/:jobId', getJobDescByJobId);

router.post('/mannual', authMiddleware, isAnyAdmin, postManualJob);
router.get('/find', getJobDetailBySlug);
router.get('/find/:jobId', getSingleJobDetail);

router.get(
  '/job/view/student',
  authMiddleware,
  isStudent,
  getAllJobsForStudent,
);

router.get('/search', searchJobs);

router.post('/:id/click', authMiddleware, isGeneralUser, trackJobClick);

router.get('/', getAllJobs);
router.get('/hosted', getMannualyJobs);
router.get('/external', getRapidJobs);
router.get('/employment-types', getAllEmploymentTypes);
router.get('/experience-levels', getAllExperiences);

router.get('/:jobId', getSingleJobDetail);
router.patch('/status/:jobId', authMiddleware, isAnyAdmin, toggleJobStatus);

export default router;
