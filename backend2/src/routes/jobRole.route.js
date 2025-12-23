import { Router } from 'express';
import {
  authMiddleware,
  isSuperAdmin,
} from '../middlewares/auth.middleware.js';
import {
  createJobRole,
  getJobRoles,
} from '../controllers/jobRole.controller.js';

const router = Router();

router.post('/', authMiddleware, isSuperAdmin, createJobRole);
router.get('/', getJobRoles);

export default router;
