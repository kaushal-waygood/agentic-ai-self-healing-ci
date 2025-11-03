import { Router } from 'express';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.js';
import {
  extractStudentDataFromCV,
  convertDataIntoHTML,
  generateCVByJD,
  generateCVByJobId,
  generateCVByTitle,
  generateCoverLetterByJD,
  generateCoverLetterByJobId,
  generateCoverLetterByTitle,
  saveStudentHTMLCV,
  getStudentHTMLCV,
  getSingleStudentHTMLCV,
  savedStudentHTMLLetter,
  getStudentHTMLLetter,
  getSingleStudentHTMLLetter,
  createTailoredApply,
  calculateJobMatchScore,
  regenerateCV,
  saveTailoredApplication,
  getSavedApplications,
  regenerateCL,
  getAllCVs,
  getAllCLs,
  getAllTailoredApplications,
  getSingleCV,
  getSingleCL,
  getSingleTailoredApplication,
  deleteSingleCV,
  deleteSingleCL,
  deleteSingleTailoredApplication,
  refreshStatus,
} from '../controllers/ai.controller.js';
import multer from 'multer';
import {
  cvGenerationSSE,
  getCVGenerationStatus,
} from '../controllers/sse.controller.js';

const router = Router();

router.post(
  '/resume/extract',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  extractStudentDataFromCV,
);

router.get('/resume/convert', authMiddleware, isStudent, convertDataIntoHTML);

router.get('/cvs', authMiddleware, isStudent, getAllCVs);
router.get('/cls', authMiddleware, isStudent, getAllCLs);
router.get(
  '/tailored-applications',
  authMiddleware,
  isStudent,
  getAllTailoredApplications,
);

router.get('/cv/:cvId', authMiddleware, isStudent, getSingleCV);
router.get('/cl/:clId', authMiddleware, isStudent, getSingleCL);
router.get(
  '/tailored-application/:applicationId',
  authMiddleware,
  isStudent,
  getSingleTailoredApplication,
);

router.delete('/cv/:cvId', authMiddleware, isStudent, deleteSingleCV);
router.delete('/cl/:clId', authMiddleware, isStudent, deleteSingleCL);
router.delete(
  '/tailored-applications/:appId',
  authMiddleware,
  isStudent,
  deleteSingleTailoredApplication,
);

router.post(
  '/resume/generate/jd',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  generateCVByJD,
);

router.post(
  '/resume/generate/jobid',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  generateCVByJobId,
);

router.post(
  '/resume/generate/jobtitle',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  generateCVByTitle,
);

router.post('/resume/regenerate', authMiddleware, isStudent, regenerateCV);

router.post(
  '/coverletter/generate/jd',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  generateCoverLetterByJD,
);

router.get('/status/:type/:id', authMiddleware, isStudent, refreshStatus);

// SSE route for real-time updates
router.get('/sse/:jobId', authMiddleware, isStudent, cvGenerationSSE);

// Fallback polling route
router.get('/status/:jobId', getCVGenerationStatus);

router.post(
  '/coverletter/generate/jobid',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  generateCoverLetterByJobId,
);

router.post(
  '/coverletter/generate/jobtitle',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  generateCoverLetterByTitle,
);

router.post('/coverletter/regenerate', authMiddleware, isStudent, regenerateCL);

router.post('/resume/save/html', authMiddleware, isStudent, saveStudentHTMLCV);
router.get('/resume/saved', authMiddleware, isStudent, getStudentHTMLCV);
router.get(
  '/resume/saved/:cvId',
  authMiddleware,
  isStudent,
  getSingleStudentHTMLCV,
);

router.post(
  '/letter/save/html',
  authMiddleware,
  isStudent,
  savedStudentHTMLLetter,
);
router.get('/letter/saved', authMiddleware, isStudent, getStudentHTMLLetter);

router.get(
  '/letter/saved/:letterId',
  authMiddleware,
  isStudent,
  getSingleStudentHTMLLetter,
);

const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
router.post(
  '/applications/tailor',
  authMiddleware,
  isStudent,
  uploadToMemory.single('cv'),
  createTailoredApply,
);

router.post(
  '/applications/save',
  authMiddleware,
  isStudent,
  saveTailoredApplication, // Use the new controller
);

router.get(
  '/applications',
  authMiddleware,
  isStudent,
  getSavedApplications, // Use the new controller
);

router.post(
  '/calculate-match',
  authMiddleware,
  isStudent,
  calculateJobMatchScore,
);

export default router;
