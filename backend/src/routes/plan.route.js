import {
  cleanupIndexes,
  createPaymentIntent,
  createPlan,
  // createSimplePurchase,
  createSimplePurchaseDev,
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
import { ensurePlanValidity } from '../middlewares/ensurePlanValidity.js';

const router = Router();

router.use(ensurePlanValidity);

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
router.post('/payment/create-intent', authMiddleware, createPaymentIntent);
router.post(
  '/payment/create-intent-test',
  authMiddleware,
  createSimplePurchaseDev,
);
router.get('/payment/status/:id', authMiddleware, getPaymentStatus);

export default router;
