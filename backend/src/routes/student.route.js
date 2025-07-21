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
} from '../controllers/student.controller.js';
import { upload } from '../middlewares/multer.js';

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

export default router;
