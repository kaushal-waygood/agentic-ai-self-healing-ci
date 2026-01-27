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
  updateJobDescription,
  applyJob,
  getHostedJobsByAdmin,
  getHostedJobCandidates,
  generateJobDescription,
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

router.post('/mannual', authMiddleware, isAnyAdmin, postManualJob);
router.post('/generate-jd', authMiddleware, isAnyAdmin, generateJobDescription);
router.patch(
  '/mannual/:jobId',
  authMiddleware,
  isAnyAdmin,
  updateJobDescription,
);

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
router.get('/hosted', authMiddleware, isAnyAdmin, getMannualyJobs);
router.get('/external', getRapidJobs);
router.get('/employment-types', getAllEmploymentTypes);
router.get('/experience-levels', getAllExperiences);
router.get('/hosted/jobs/job-admin', authMiddleware, getHostedJobsByAdmin);
router.get(
  '/hosted/jobs/candidates/:jobId',
  authMiddleware,
  isAnyAdmin,
  getHostedJobCandidates,
);

router.get('/:jobId', getSingleJobDetail);
router.patch('/status/:jobId', authMiddleware, isAnyAdmin, toggleJobStatus);

router.post('/:jobId/apply', authMiddleware, isGeneralUser, applyJob);
export default router;
