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
  generateEmailDraft,
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
  getDocumentCounts,
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
import { generateContent } from '../config/gemini.js';

const router = Router();

const AI_ASSISTANT_SYSTEM_PROMPT = `You are a helpful AI assistant for the ZobsAI platform. Your goal is to answer user questions about the platform and guide them on how to use its features.

Key features of ZobsAI include:
- Profile creation and management.
- AI-powered CV generation (from uploaded documents or forms) and editing.
- Tailored cover letter and email draft generation for job applications.
- Job listings and an application tracking system.
- Tiered subscription model with varying features.
- Referral program for earning application credits.
- Self-help documentation and this AI assistant for support.

When answering, be clear, concise, and helpful. If you don't know the answer or if the question is too complex, politely suggest checking the FAQ page or contacting support.`;

router.post(
  '/assistant/chat',
  authMiddleware,
  isUserOrUniStudent,
  async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res
          .status(400)
          .json({ success: false, message: 'Query is required.' });
      }

      const prompt = `${AI_ASSISTANT_SYSTEM_PROMPT}\n\nUser Query: ${query.trim()}\n\nAnswer:`;
      const answer = await generateContent(prompt, {
        userId: req.user?._id?.toString(),
        endpoint: 'ai-assistant-chat',
        temperature: 0.4,
      });

      return res.status(200).json({ success: true, answer: answer.trim() });
    } catch (err) {
      console.error('AI assistant chat error:', err);
      const status = err?.status || 500;
      const msg =
        status === 429
          ? 'AI service is temporarily busy. Please try again in a moment.'
          : 'Sorry, the AI assistant is currently unavailable. Please try again later.';
      return res.status(status >= 500 ? 503 : status).json({
        success: false,
        message: msg,
      });
    }
  },
);

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

router.get(
  '/documents/count',
  authMiddleware,
  isUserOrUniStudent,
  getDocumentCounts,
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

router.post(
  '/email-draft/generate',
  authMiddleware,
  isUserOrUniStudent,
  generateEmailDraft,
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
