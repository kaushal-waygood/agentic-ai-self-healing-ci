import { Router } from 'express';
import {
  createOrganizationMember,
  getOrganizationMembers,
  updateOrganizationMember,
  deleteOrganizationMember,
  getUniqueDepartments,
  filterOrganizationMembers,
  getUniqueCourses,
  getJobsByOrgPosted,
  sendOrganizationInvite,
  acceptInvite,
} from '../controllers/organization.controller.js';
import {
  authMiddleware,
  isAnyAdmin,
  isHr,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/members/create',
  authMiddleware,
  isAnyAdmin,
  createOrganizationMember,
);
router.post(
  '/member/request',
  authMiddleware,
  isAnyAdmin,
  sendOrganizationInvite,
);
router.post('/member/accept-invite', authMiddleware, acceptInvite);
router.get('/members/all', authMiddleware, isAnyAdmin, getOrganizationMembers);
router.patch(
  '/members/:id/edit',
  authMiddleware,
  isAnyAdmin,
  updateOrganizationMember,
);
router.delete(
  '/members/:id/remove',
  authMiddleware,
  isAnyAdmin,
  deleteOrganizationMember,
);
router.get('/members/filter', authMiddleware, isHr, filterOrganizationMembers);
router.get(
  '/members/get-unique-departments',
  authMiddleware,
  isAnyAdmin,
  getUniqueDepartments,
);
router.get(
  '/members/get-unique-courses',
  authMiddleware,
  isAnyAdmin,
  getUniqueCourses,
);
router.get('/get-job', authMiddleware, isAnyAdmin, getJobsByOrgPosted);

export default router;
