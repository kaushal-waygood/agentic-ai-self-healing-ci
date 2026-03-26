import {
  activateAgent,
  createAutopilotAgent,
  getAllPilotAgents,
  getAgentJobs,
  getSinglePilotAgent,
  replaceAgentJob,
  removeAutoPilotAgent,
  startAgentJobTailoredGeneration,
  singleActivateAgent,
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
router.get('/get/:id/jobs', authMiddleware, isGeneralUser, getAgentJobs);
router.post(
  '/get/:agentId/jobs/:jobId/find-other',
  authMiddleware,
  isGeneralUser,
  replaceAgentJob,
);
router.post(
  '/get/:agentId/jobs/:jobId/generate',
  authMiddleware,
  isGeneralUser,
  checkCredits('TAILORED_APPLY'),
  requireCompleteProfile,
  startAgentJobTailoredGeneration,
);
router.get('/get/:id', authMiddleware, isGeneralUser, getSinglePilotAgent);
router.delete(
  '/delete/:id',
  authMiddleware,
  isGeneralUser,
  removeAutoPilotAgent,
);
router.post('/activate/:id', authMiddleware, isGeneralUser, activateAgent);
router.patch(
  '/agent/active/:id',
  authMiddleware,
  isGeneralUser,
  singleActivateAgent,
);

export default router;
