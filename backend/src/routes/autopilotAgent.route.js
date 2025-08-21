import {
  activateAgent,
  createAutopilotAgent,
  getAllPilotAgents,
  getSinglePilotAgent,
  removeAutoPilotAgent,
} from '../controllers/autopilotAgent.controller.js';
import express from 'express';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

router.post(
  '/create',
  authMiddleware,
  isStudent,
  upload.single('cv'),
  createAutopilotAgent,
);

router.get('/get', authMiddleware, isStudent, getAllPilotAgents);
router.get('/get/:id', authMiddleware, isStudent, getSinglePilotAgent);
router.delete('/delete/:id', authMiddleware, isStudent, removeAutoPilotAgent);
router.post('/activate/:id', authMiddleware, isStudent, activateAgent);

export default router;
