import express from 'express';
import { upload } from '../middlewares/multer.js'; // <-- your existing file

import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js'; // or whatever you use

const router = express.Router();

router.post('/student', authMiddleware, isStudent, submitStudentBringRequest);

router.post(
  '/company',
  authMiddleware,
  isStudent,
  upload.single('attachment'),
  submitCompanyBringRequest,
);

export default router;
