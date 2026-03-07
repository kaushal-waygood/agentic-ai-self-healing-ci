import {
  activateAgent,
  createAutopilotAgent,
  getAllPilotAgents,
  getSinglePilotAgent,
  removeAutoPilotAgent,
} from '../controllers/autopilotAgent.controller.js';
import express from 'express';
import {
  authMiddleware,
  isGeneralUser,
} from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.js';
import { requireCompleteProfile } from '../middlewares/profileComplete.js';
import { checkCredits } from '../middlewares/checkCredits.js';

const router = express.Router();

router.post(
  '/create',
  authMiddleware,
  isGeneralUser,
  checkCredits('AI_AUTO_APPLY'),
  requireCompleteProfile,
  upload.single('cv'),
  createAutopilotAgent,
);

router.get('/get', authMiddleware, isGeneralUser, getAllPilotAgents);
router.get('/get/:id', authMiddleware, isGeneralUser, getSinglePilotAgent);
router.delete(
  '/delete/:id',
  authMiddleware,
  isGeneralUser,
  removeAutoPilotAgent,
);
router.post('/activate/:id', authMiddleware, isGeneralUser, activateAgent);

export default router;
