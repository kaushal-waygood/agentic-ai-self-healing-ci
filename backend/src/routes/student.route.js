import { Router } from 'express';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';
import {
  studentDetails,
  appliedJob,
  addStudentSkills,
  removeStudentSkills,
  removeExperience,
  addExperience,
  addEducations,
  removeEducation,
  addProfileImage,
  updateProfileImage,
  addResume,
  extractStudentDataFromCV,
  convertDataIntoHTML,
  generateCVByJD,
  generateCVByJobId,
  generateCVByTitle,
  generateCoverLetterByJD,
  generateCoverLetterByJobId,
  generateCoverLetterByTitle,
} from '../controllers/student.controller.js';
import { upload } from '../middlewares/multer.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../utils/fileUploadingManaging.js';

const router = Router();

router.get('/details', authMiddleware, isStudent, studentDetails);
router.post('/apply/:jobId', authMiddleware, isStudent, appliedJob);

router.post('/skill/add', authMiddleware, isStudent, addStudentSkills);
router.post(
  '/skill/remove/:skillId',
  authMiddleware,
  isStudent,
  removeStudentSkills,
);

router.post('/experience/add', authMiddleware, isStudent, addExperience);
router.post(
  '/experience/remove/:expId',
  authMiddleware,
  isStudent,
  removeExperience,
);
router.post('/education/add', authMiddleware, isStudent, addEducations);

router.post(
  '/education/remove/:eduId',
  authMiddleware,
  isStudent,
  removeEducation,
);

router.post(
  '/profile/add',
  authMiddleware,
  isStudent,
  upload.single('profileImage'),
  addProfileImage,
);

router.patch(
  '/profile/update',
  authMiddleware,
  isStudent,
  upload.single('profileImage'),
  updateProfileImage,
);

router.post(
  '/resume/add',
  authMiddleware,
  isStudent,
  upload.single('resume'),
  addResume,
);

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
  '/resume/generate/title',
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
  '/coverletter/generate/title',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  generateCoverLetterByTitle,
);

export default router;
