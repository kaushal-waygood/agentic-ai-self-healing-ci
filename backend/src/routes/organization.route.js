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
  rejectCandidate,
  shortListCandidate,
  updateJobTitle,
  updateJobDetails,
} from '../controllers/organization.controller.js';
import {
  authMiddleware,
  isAnyAdmin,
  isHr,
} from '../middlewares/auth.middleware.js';
import { orgLogoUpload, upload } from '../middlewares/multer.js';

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
  '/reject-candidate/:appliedJobId',
  authMiddleware,
  isAnyAdmin,
  rejectCandidate,
);

router.patch(
  '/shortlist-candidate/:appliedJobId',
  authMiddleware,
  isAnyAdmin,
  shortListCandidate,
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

export default router;
