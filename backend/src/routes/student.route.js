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
  // savedJobs,
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
  jobViewedByStudent,
  isStudentViewedJob,
  jobVisitedByStudent,
  isJobVisitedByStudent,
  getAllVisitedJobs,
  getAllViewedJobs,
  getAllSavedJobs,
  getAllStatCounts,
  toggleSavedJob,
  getEducationsById,
} from '../controllers/student.controller.js';
import { upload } from '../middlewares/multer.js';
import { __dirname } from '../utils/fileUploadingManaging.js';
import puppeteer from 'puppeteer';
import pkg from 'generic-pool';
import { spawn } from 'child_process';

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

router.post('/jobs/saved', authMiddleware, isStudent, toggleSavedJob);
router.get('/jobs/saved', authMiddleware, isStudent, getSavedJobs);
router.get('/jobs/issaved', authMiddleware, isStudent, isSavedOrNot);
router.get('/jobs/recommended', authMiddleware, isStudent, getRecommendedJobs);
router.get('/profile/status', authMiddleware, isStudent, getProfileCompletion);
router.get('/jobs/stats', authMiddleware, isStudent, StudentAnalytics);
router.post('/autopilot/toggle', authMiddleware, isStudent, toggleAutopilot);
router.get(
  '/jobs/visited/:jobId',
  authMiddleware,
  isStudent,
  jobVisitedByStudent,
);
router.get('/education/:id', authMiddleware, isStudent, getEducationsById);

router.get(
  '/jobs/is-visited/:jobId',
  authMiddleware,
  isStudent,
  isJobVisitedByStudent,
);

router.get('/jobs/visited-all', authMiddleware, isStudent, getAllVisitedJobs);
router.get('/jobs/viewed-all', authMiddleware, isStudent, getAllViewedJobs);
router.get('/jobs/saved-all', authMiddleware, isStudent, getAllSavedJobs);

router.get('/job/stats', authMiddleware, isStudent, getAllStatCounts);

router.get('/job/viewed/:jobId', authMiddleware, isStudent, jobViewedByStudent);

router.post(
  '/job/viewed/:jobId',
  authMiddleware,
  isStudent,
  jobViewedByStudent,
);

router.get('/job/viewed/:jobId', authMiddleware, isStudent, isStudentViewedJob);

router.post('/pdf/generate-pdf', async (req, res) => {
  const { html, title } = req.body;

  if (!html) {
    return res.status(400).json({ message: 'HTML content is required.' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      protocolTimeout: 120000,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    // Use 'load' instead of 'networkidle0' for better reliability
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 30000,
    });

    // Removed the waitForTimeout call - 'load' should be sufficient

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      timeout: 30000,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="CareerPilot_${title.replace(/ /g, '_')}.pdf"`,
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    res.status(500).json({
      message: 'Failed to generate PDF.',
      error: error.message,
    });
  }
});

router.post('/docx/generate-docx', (req, res) => {
  const { html, title } = req.body;

  if (!html) {
    return res.status(400).json({ message: 'HTML content is required.' });
  }

  // Define the command and its arguments.
  // Note: spawn expects arguments as an array of strings.
  const pandoc = spawn('pandoc', ['-f', 'html', '-t', 'docx']);

  // We will collect the output chunks of the DOCX file in this array.
  const docxChunks = [];
  const errorChunks = [];

  // Listen for data coming from Pandoc's output stream (the generated file).
  pandoc.stdout.on('data', (chunk) => {
    docxChunks.push(chunk);
  });

  // Listen for any errors that Pandoc might throw.
  pandoc.stderr.on('data', (chunk) => {
    errorChunks.push(chunk);
  });

  // When the Pandoc process finishes, this event is fired.
  pandoc.on('close', (code) => {
    // If Pandoc exited with an error code or we captured error messages...
    if (code !== 0 || errorChunks.length > 0) {
      const errorMessage = Buffer.concat(errorChunks).toString();
      console.error(`Pandoc Error (code ${code}): ${errorMessage}`);
      return res.status(500).json({
        message: 'Failed to generate DOCX file using Pandoc.',
        error: errorMessage,
      });
    }

    // If successful, combine all the collected chunks into a single buffer.
    const docxBuffer = Buffer.concat(docxChunks);

    // Set the response headers to trigger a download.
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="CareerPilot_${title.replace(/ /g, '_')}.docx"`,
    );

    res.send(docxBuffer);
  });

  // Write your HTML content to Pandoc's input stream.
  pandoc.stdin.write(html);
  // Close the input stream to signal that you're done sending data.
  pandoc.stdin.end();
});

export default router;
