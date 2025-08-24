import { Router } from 'express';
import { authMiddleware, isStudent } from '../middlewares/auth.middleware.js';
import {
  studentDetails,
  appliedJob,
  addStudentSkills,
  removeStudentSkills,
  removeExperience,
  addExperience,
  addEducations,
  removeEducation,
  addProfileImage,
  updateProfileImage,
  addResume,
  updateEducation,
  updateStudentSkills,
  updateJobPreferences,
  getJobPreferences,
  updateFullName,
  savedJobs,
  getSavedJobs,
  isSavedOrNot,
  isAppliedOrNot,
  getAppliedJobs,
  getRecommendedJobs,
  updateProjects,
  updateExperience,
  addProjects,
  removeProject,
  getProfileCompletion,
  StudentAnalytics,
  toggleAutopilot,
  updateJobRole,
} from '../controllers/student.controller.js';
import { upload } from '../middlewares/multer.js';
import { __dirname } from '../utils/fileUploadingManaging.js';
import puppeteer from 'puppeteer';

const router = Router();

router.get('/details', authMiddleware, isStudent, studentDetails);
router.get('/job/applications', authMiddleware, isStudent, getAppliedJobs);

router.post('/job/apply/:jobId', authMiddleware, isStudent, appliedJob);
router.get('/job/isapplied', authMiddleware, isStudent, isAppliedOrNot);

router.patch('/fullname/update', authMiddleware, isStudent, updateFullName);

router.post('/job-role/update', authMiddleware, isStudent, updateJobRole);

// Skills
router.post('/skill/add', authMiddleware, isStudent, addStudentSkills);
router.delete(
  '/skill/remove/:skillId',
  authMiddleware,
  isStudent,
  removeStudentSkills,
);
router.patch(
  '/skill/update/:skillId',
  authMiddleware,
  isStudent,
  updateStudentSkills,
);

// Experience
router.post('/experience/add', authMiddleware, isStudent, addExperience);
router.delete(
  '/experience/remove/:expId',
  authMiddleware,
  isStudent,
  removeExperience,
);
router.patch(
  '/experience/update/:expId',
  authMiddleware,
  isStudent,
  updateExperience,
);

router.post('/education/add', authMiddleware, isStudent, addEducations);
router.post(
  '/education/remove/:eduId',
  authMiddleware,
  isStudent,
  removeEducation,
);
router.patch(
  '/education/update/:eduId',
  authMiddleware,
  isStudent,
  updateEducation,
);

router.post('/project/add', authMiddleware, isStudent, addProjects);
router.delete(
  '/project/remove/:projectId',
  authMiddleware,
  isStudent,
  removeProject,
);
router.patch(
  '/project/update/:projectId',
  authMiddleware,
  isStudent,
  updateProjects,
);
router.delete(
  '/project/remove/:projectId',
  authMiddleware,
  isStudent,
  removeEducation,
);

router.post(
  '/profile/add',
  authMiddleware,
  isStudent,
  upload.single('profileImage'),
  addProfileImage,
);

router.patch(
  '/profile/update',
  authMiddleware,
  isStudent,
  upload.single('profileImage'),
  updateProfileImage,
);

router.post(
  '/resume/add',
  authMiddleware,
  isStudent,
  upload.single('resume'),
  addResume,
);

router.post(
  '/prefered-job/add',
  authMiddleware,
  isStudent,
  updateJobPreferences,
);

router.get('/prefered-job/get', authMiddleware, isStudent, getJobPreferences);

router.post('/jobs/saved', authMiddleware, isStudent, savedJobs);
router.get('/jobs/saved', authMiddleware, isStudent, getSavedJobs);
router.get('/jobs/issaved', authMiddleware, isStudent, isSavedOrNot);
router.get('/jobs/recommended', authMiddleware, isStudent, getRecommendedJobs);
router.get('/profile/status', authMiddleware, isStudent, getProfileCompletion);
router.get('/jobs/stats', authMiddleware, isStudent, StudentAnalytics);
router.post('/autopilot/toggle', authMiddleware, isStudent, toggleAutopilot);

router.post('/pdf/generate-pdf', async (req, res) => {
  console.log('Received request to generate PDF...');

  const { html, title } = req.body;

  if (!html) {
    return res.status(400).json({ message: 'HTML content is required.' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="CareerPilot_${title.replace(/ /g, '_')}.pdf"`,
    );

    console.log('Successfully generated and sent PDF.');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF.' });
  }
});

export default router;
