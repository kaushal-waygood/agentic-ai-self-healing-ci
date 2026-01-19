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
  calculateATS,
  changeTempateCV,
  getAllTemplates,
  deleteSingleStudentSavedCV,
  deleteSingleStudentSavedCL,
  renameSavedStudentCL,
  renameSavedStudentCV,
  getStudentCLsFromExtension,
  getStudentCVsFromExtension,
} from '../controllers/ai.controller.js';
import multer from 'multer';
import {
  cvGenerationSSE,
  getCVGenerationStatus,
} from '../controllers/sse.controller.js';
import {
  extractStudentDataFromCV,
  getStudentDataFromUploadedCV,
} from '../controllers/rough.js';
import { checkCredits } from '../middlewares/checkCredits.js';
import { requireCompleteProfile } from '../middlewares/profileComplete.js';

const router = Router();

router.post(
  '/resume/extract',
  authMiddleware,
  isUserOrUniStudent,
  memoryUpload.single('cv'),
  extractStudentDataFromCV,
);

router.get('/templates', authMiddleware, isUserOrUniStudent, getAllTemplates);

router.get(
  '/cv/ext',
  authMiddleware,
  isUserOrUniStudent,
  getStudentCVsFromExtension,
);
router.get(
  '/coverletter/ext',
  authMiddleware,
  isUserOrUniStudent,
  getStudentCLsFromExtension,
);

router.post(
  '/change/template',
  authMiddleware,
  isUserOrUniStudent,
  changeTempateCV,
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
  checkCredits('CV_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCVByJD,
);

router.post(
  '/resume/generate/jobid',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('CV_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCVByJobId,
);

router.post(
  '/resume/generate/jobtitle',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('CV_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCVByTitle,
);

router.post(
  '/resume/regenerate',
  authMiddleware,
  isUserOrUniStudent,
  regenerateCV,
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
  '/coverletter/generate/jd',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('COVER_LETTER_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCoverLetterByJD,
);
router.post(
  '/coverletter/generate/jobid',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('COVER_LETTER_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCoverLetterByJobId,
);
router.post(
  '/coverletter/generate/jobtitle',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('COVER_LETTER_GENERATION'),
  requireCompleteProfile,
  upload.single('cv'),
  generateCoverLetterByTitle,
);

router.post(
  '/coverletter/regenerate',
  authMiddleware,
  isUserOrUniStudent,
  requireCompleteProfile,
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

router.delete(
  '/resume/saved/:cvId',
  authMiddleware,
  isUserOrUniStudent,
  deleteSingleStudentSavedCV,
);

router.delete(
  '/letter/saved/:clId',
  authMiddleware,
  isUserOrUniStudent,
  deleteSingleStudentSavedCL,
);

router.patch(
  '/letter/saved/:clId/rename',
  authMiddleware,
  isUserOrUniStudent,
  renameSavedStudentCL,
);

router.patch(
  '/resume/saved/:cvId/rename',
  authMiddleware,
  isUserOrUniStudent,
  renameSavedStudentCV,
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
  checkCredits('TAILORED_APPLY'),
  requireCompleteProfile,
  uploadToMemory.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'jobDescriptionFile', maxCount: 1 },
  ]),
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
  checkCredits('JOB_MATCHING'),
  calculateJobMatchScore,
);

router.post(
  '/extract/onboarding',
  authMiddleware,
  isUserOrUniStudent,
  memoryUpload.single('cv'),
  getStudentDataFromUploadedCV,
);

router.post(
  '/ats-score',
  authMiddleware,
  isUserOrUniStudent,
  checkCredits('ATS_SCORE'),
  calculateATS,
);

export default router;
