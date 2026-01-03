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
  getJobDescByJobId,
  getAllJobsQueries,
  trackJobClick,
  trackJobImpressions,
  getJobStats,
} from '../controllers/job.controller.js';
import {
  authMiddleware,
  isAnyAdmin,
  isGeneralUser,
  isHr,
  isStudent,
} from '../middlewares/auth.middleware.js';
import { getDashboardTopJobs } from '../controllers/student.controller.js';

const router = Router();

router.get('/job-stats', getJobStats);
router.get('/job-queries', getAllJobsQueries);
router.get('/job-desc/:jobId', getJobDescByJobId);
router.get(
  '/dashboard/top-jobs',
  authMiddleware,
  isGeneralUser,
  getDashboardTopJobs,
);
router.get('/job/:jobId', getJobFromJobId);
router.get('/job/views/:jobId', authMiddleware, isStudent, jobViewsCount);

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
router.post('/impression', authMiddleware, isGeneralUser, trackJobImpressions);

router.get('/', getAllJobs);
router.get('/hosted', getMannualyJobs);
router.get('/external', getRapidJobs);
router.get('/employment-types', getAllEmploymentTypes);
router.get('/experience-levels', getAllExperiences);

router.get('/:jobId', getSingleJobDetail);
router.patch('/status/:jobId', authMiddleware, isAnyAdmin, toggleJobStatus);

export default router;
