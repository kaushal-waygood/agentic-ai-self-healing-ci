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
  updateOrganizationProfile,
  getOrganisationProfile,
  updateOrgLogo,
  getOrganisationStats,
  updateJobTitle,
  updateJobDetails,
  updateCandidateStatus,
} from '../controllers/organization.controller.js';
import {
  authMiddleware,
  isAnyAdmin,
  isHr,
} from '../middlewares/auth.middleware.js';
import { orgLogoUpload, upload } from '../middlewares/multer.js';
import {
  createRole,
  deleteRole,
  getOrgRoles,
  inviteMember,
  updateRole,
} from '../controllers/role.controller.js';

const router = Router();

router.patch(
  '/update-profile',
  authMiddleware,
  isAnyAdmin,
  updateOrganizationProfile,
);
router.get('/me', authMiddleware, isAnyAdmin, getOrganisationProfile);
router.get('/stats', authMiddleware, isAnyAdmin, getOrganisationStats);

router.patch(
  '/update-candidate-status/:appliedJobId',
  authMiddleware,
  isAnyAdmin,
  updateCandidateStatus,
);

router.patch(
  '/job-title/:appliedJobId',
  authMiddleware,
  isAnyAdmin,
  updateJobTitle,
);

router.patch(
  '/job-details/:jobId',
  authMiddleware,
  isAnyAdmin,
  updateJobDetails,
);

router.patch(
  '/profile/logo',
  authMiddleware,
  isAnyAdmin,
  orgLogoUpload.single('org-logo'),
  updateOrgLogo,
);

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

// ROLES
router.post('/roles/create', authMiddleware, isAnyAdmin, createRole);
router.get('/roles/all', authMiddleware, isAnyAdmin, getOrgRoles);
router.patch('/roles/:id/edit', authMiddleware, isAnyAdmin, updateRole);
router.delete('/roles/:id/remove', authMiddleware, isAnyAdmin, deleteRole);
router.post('/team/send-invite', authMiddleware, isAnyAdmin, inviteMember);

export default router;
