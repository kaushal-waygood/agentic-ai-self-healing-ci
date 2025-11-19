// routes/coupon.route.js
import express from 'express';
import {
  createCoupon,
  updateCoupon,
  listCoupons,
  getCoupon,
  deleteCoupon,
  toggleCouponActive,
  validateCoupon,
  redeemCoupon,
  redeemCouponByCode,
} from '../controllers/coupon.controller.js';
import {
  authMiddleware,
  isSuperAdmin,
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin actions
router.post('/admin/create', authMiddleware, isSuperAdmin, createCoupon);
router.patch('/admin/:id', authMiddleware, isSuperAdmin, updateCoupon);
router.get('/admin', authMiddleware, isSuperAdmin, listCoupons);
router.get('/admin/:id', authMiddleware, isSuperAdmin, getCoupon);
router.delete('/admin/:id', authMiddleware, isSuperAdmin, deleteCoupon);
router.post(
  '/admin/:id/toggle',
  authMiddleware,
  isSuperAdmin,
  toggleCouponActive,
);

// Public / billing actions
// validate: permitted to authenticated users — you can remove authMiddleware to allow public validation
router.get('/validate', authMiddleware, validateCoupon);

// redeem: must be called during checkout, auth required
router.post('/redeem', authMiddleware, redeemCoupon);
router.post('/redeem-coupon', authMiddleware, redeemCouponByCode);

export default router;
