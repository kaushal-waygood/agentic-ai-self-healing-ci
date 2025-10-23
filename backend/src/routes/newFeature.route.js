import { requestNewFeature } from '../controllers/newFeature.controller.js';
import { Router } from 'express';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, isStudent, requestNewFeature);

export default router;
