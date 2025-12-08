import { Router } from 'express';
import {
  authMiddleware,
  isUserOrUniStudent,
} from '../middlewares/auth.middleware.js';
import { memoryUpload, upload } from '../middlewares/multer.js';
import {
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
  renameHtmlCV,
  renameCoverLetter,
} from '../controllers/ai.controller.js';
import multer from 'multer';
import {
  cvGenerationSSE,
  getCVGenerationStatus,
} from '../controllers/sse.controller.js';
import { extractStudentDataFromCV } from '../controllers/rough.js';

const router = Router();

router.post(
  '/resume/extract',
  authMiddleware,
  isUserOrUniStudent,
  memoryUpload.single('cv'),
  extractStudentDataFromCV,
);

router.get(
  '/resume/convert',
  authMiddleware,
  isUserOrUniStudent,
  convertDataIntoHTML,
);

router.get('/cvs', authMiddleware, isUserOrUniStudent, getAllCVs);
router.get('/cls', authMiddleware, isUserOrUniStudent, getAllCLs);
router.get(
  '/tailored-applications',
  authMiddleware,
  isUserOrUniStudent,
  getAllTailoredApplications,
);

router.get('/cv/:cvId', authMiddleware, isUserOrUniStudent, getSingleCV);
router.get('/cl/:clId', authMiddleware, isUserOrUniStudent, getSingleCL);
router.get(
  '/tailored-application/:applicationId',
  authMiddleware,
  isUserOrUniStudent,
  getSingleTailoredApplication,
);

router.delete('/cv/:cvId', authMiddleware, isUserOrUniStudent, deleteSingleCV);
router.delete('/cl/:clId', authMiddleware, isUserOrUniStudent, deleteSingleCL);
router.delete(
  '/tailored-applications/:appId',
  authMiddleware,
  isUserOrUniStudent,
  deleteSingleTailoredApplication,
);

router.post(
  '/resume/generate/jd',
  authMiddleware,
  isUserOrUniStudent,
  upload.single('cv'),
  generateCVByJD,
);

router.post(
  '/resume/generate/jobid',
  authMiddleware,
  isUserOrUniStudent,
  upload.single('cv'),
  generateCVByJobId,
);

router.post(
  '/resume/generate/jobtitle',
  authMiddleware,
  isUserOrUniStudent,
  upload.single('cv'),
  generateCVByTitle,
);

router.post(
  '/resume/regenerate',
  authMiddleware,
  isUserOrUniStudent,
  regenerateCV,
);

router.post(
  '/coverletter/generate/jd',
  authMiddleware,
  isUserOrUniStudent,
  upload.single('cv'),
  generateCoverLetterByJD,
);

router.patch(
  '/cv/:id/rename',
  authMiddleware,
  isUserOrUniStudent,
  renameHtmlCV,
);
router.patch(
  '/cl/:id/rename',
  authMiddleware,
  isUserOrUniStudent,
  renameCoverLetter,
);

router.get(
  '/status/:type/:id',
  authMiddleware,
  isUserOrUniStudent,
  refreshStatus,
);
router.get('/sse/:jobId', authMiddleware, isUserOrUniStudent, cvGenerationSSE);
router.get('/status/:jobId', getCVGenerationStatus);
router.post(
  '/coverletter/generate/jobid',
  authMiddleware,
  isUserOrUniStudent,
  upload.single('cv'),
  generateCoverLetterByJobId,
);

router.post(
  '/coverletter/generate/jobtitle',
  authMiddleware,
  isUserOrUniStudent,
  upload.single('cv'),
  generateCoverLetterByTitle,
);

router.post(
  '/coverletter/regenerate',
  authMiddleware,
  isUserOrUniStudent,
  regenerateCL,
);

router.post(
  '/resume/save/html',
  authMiddleware,
  isUserOrUniStudent,
  saveStudentHTMLCV,
);
router.get(
  '/resume/saved',
  authMiddleware,
  isUserOrUniStudent,
  getStudentHTMLCV,
);
router.get(
  '/resume/saved/:cvId',
  authMiddleware,
  isUserOrUniStudent,
  getSingleStudentHTMLCV,
);

router.post(
  '/letter/save/html',
  authMiddleware,
  isUserOrUniStudent,
  savedStudentHTMLLetter,
);
router.get(
  '/letter/saved',
  authMiddleware,
  isUserOrUniStudent,
  getStudentHTMLLetter,
);

router.get(
  '/letter/saved/:letterId',
  authMiddleware,
  isUserOrUniStudent,
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
  isUserOrUniStudent,
  uploadToMemory.single('cv'),
  createTailoredApply,
);

router.post(
  '/applications/save',
  authMiddleware,
  isUserOrUniStudent,
  saveTailoredApplication,
);

router.get(
  '/applications',
  authMiddleware,
  isUserOrUniStudent,
  getSavedApplications,
);

router.post(
  '/calculate-match',
  authMiddleware,
  isUserOrUniStudent,
  calculateJobMatchScore,
);

export default router;
