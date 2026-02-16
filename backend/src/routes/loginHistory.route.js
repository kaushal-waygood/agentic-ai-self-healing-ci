import express from 'express';
import {
  createLoginHistory,
  getUserLoginHistory,
  logoutUpdate,
  getAllLoginHistory,
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.post('/login-history', createLoginHistory);
router.get('/user/:userId', getUserLoginHistory);
router.patch('/logout', logoutUpdate);
router.get('/', getAllLoginHistory);

export default router;
