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
  createJobPreference,
  getJobPreferences,
  updateFullName,
  savedJobs,
  getSavedJobs,
  isSavedOrNot,
  isAppliedOrNot,
} from '../controllers/student.controller.js';
import { upload } from '../middlewares/multer.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../utils/fileUploadingManaging.js';

const router = Router();

router.get('/details', authMiddleware, isStudent, studentDetails);
router.post('/job/apply/:jobId', authMiddleware, isStudent, appliedJob);
router.get('/job/isapplied', authMiddleware, isStudent, isAppliedOrNot);

router.patch('/fullname/update', authMiddleware, isStudent, updateFullName);

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

router.post(
  '/prefered-job/add',
  authMiddleware,
  isStudent,
  createJobPreference,
);

router.get('/prefered-job/get', authMiddleware, isStudent, getJobPreferences);

router.post('/jobs/saved', authMiddleware, isStudent, savedJobs);
router.get('/jobs/saved', authMiddleware, isStudent, getSavedJobs);
router.get('/jobs/issaved', authMiddleware, isStudent, isSavedOrNot);

export default router;
