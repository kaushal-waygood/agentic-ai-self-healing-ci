import {
  cleanupIndexes,
  createPaymentIntent,
  createPlan,
  createSimplePurchase,
  getActivePlan,
  getAllPlans,
  getPaymentStatus,
  getSinglePlan,
  updatePlan,
} from '../controllers/plan.controller.js';
import { Router } from 'express';
import {
  isSuperAdmin,
  authMiddleware,
} from '../middlewares/auth.middleware.js';
import {
  createPurchase,
  getUserPurchases,
} from '../controllers/purchase.controller.js';
import {
  getUserUsage,
  getUserUsageLimits,
  trackUsage,
} from '../controllers/usage.controller.js';

const router = Router();

router.post('/create', authMiddleware, isSuperAdmin, createPlan);
router.post('/clean', authMiddleware, isSuperAdmin, cleanupIndexes);
router.patch('/update/:id', authMiddleware, isSuperAdmin, updatePlan);
router.get('/', getAllPlans);
router.get('/get-user-plan-type', authMiddleware, getActivePlan);

router.post('/perchase', authMiddleware, createPurchase);
router.get('/perchased', authMiddleware, getUserPurchases);

router.post('/usage', authMiddleware, trackUsage);
router.get('/usage', authMiddleware, getUserUsage);
router.get('/usage-limit', authMiddleware, getUserUsageLimits);
router.get('/:id', getSinglePlan);
// router.post('/payment/create-intent', authMiddleware, createPaymentIntent);
router.post('/payment/create-intent', authMiddleware, createSimplePurchase);
router.get('/payment/status/:id', authMiddleware, getPaymentStatus);

export default router;
