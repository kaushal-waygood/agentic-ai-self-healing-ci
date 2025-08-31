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
} from '../controllers/ai.controller.js';

const router = Router();

router.post(
  '/resume/extract',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  extractStudentDataFromCV,
);

router.get('/resume/convert', authMiddleware, isStudent, convertDataIntoHTML);

router.post(
  '/resume/generate/jd',
  // authMiddleware,
  // isStudent,
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

router.post(
  '/coverletter/generate/jd',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  generateCoverLetterByJD,
);

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

router.post(
  '/applications/tailor',
  authMiddleware,
  isStudent,
  createTailoredApply,
);

router.post(
  '/calculate-match',
  authMiddleware,
  isStudent,
  calculateJobMatchScore,
);

export default router;
