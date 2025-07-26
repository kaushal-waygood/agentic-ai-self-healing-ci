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
  updateEducation,
  updateStudentSkills,
} from '../controllers/student.controller.js';
import { upload } from '../middlewares/multer.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../utils/fileUploadingManaging.js';

const router = Router();

router.get('/details', authMiddleware, isStudent, studentDetails);
router.post('/apply/:jobId', authMiddleware, isStudent, appliedJob);

// Skills
router.post('/skill/add', authMiddleware, isStudent, addStudentSkills);
router.post(
  '/skill/remove/:skillId',
  authMiddleware,
  isStudent,
  removeStudentSkills,
);
router.patch(
  '/skill/update/:skillId',
  authMiddleware,
  isStudent,
  updateStudentSkills,
);

// Experience
router.post('/experience/add', authMiddleware, isStudent, addExperience);
router.post(
  '/experience/remove/:expId',
  authMiddleware,
  isStudent,
  removeExperience,
);
router.patch(
  '/experience/update/:expId',
  authMiddleware,
  isStudent,
  addExperience,
);

router.post('/education/add', authMiddleware, isStudent, addEducations);
router.post(
  '/education/remove/:eduId',
  authMiddleware,
  isStudent,
  removeEducation,
);
router.patch(
  '/education/update/:eduId',
  authMiddleware,
  isStudent,
  updateEducation,
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

export default router;
