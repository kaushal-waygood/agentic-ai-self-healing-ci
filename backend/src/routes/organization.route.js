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
} from '../controllers/organization.controller.js';
import { authMiddleware, isOrgAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/members/create',
  authMiddleware,
  isOrgAdmin,
  createOrganizationMember,
);
router.get('/members/all', authMiddleware, isOrgAdmin, getOrganizationMembers);
router.patch(
  '/members/:id/edit',
  authMiddleware,
  isOrgAdmin,
  updateOrganizationMember,
);
router.delete(
  '/members/:id/remove',
  authMiddleware,
  isOrgAdmin,
  deleteOrganizationMember,
);

router.get(
  '/members/filter',
  authMiddleware,
  isOrgAdmin,
  filterOrganizationMembers,
);

router.get(
  '/members/get-unique-departments',
  authMiddleware,
  isOrgAdmin,
  getUniqueDepartments,
);

router.get(
  '/members/get-unique-courses',
  authMiddleware,
  isOrgAdmin,
  getUniqueCourses,
);

router.get('/get-job', authMiddleware, isOrgAdmin, getJobsByOrgPosted);

export default router;
