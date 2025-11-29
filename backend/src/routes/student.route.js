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
  updatePhone,
  // savedJobs,
  getSavedJobs,
  isSavedOrNot,
  isAppliedOrNot,
  getAppliedJobs,
  getProfileBasedRecommendedJobs,
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
  onboardingProfile,
  completeOnboarding,
  getAllProjects,
  getCreditsSummary,
  getTotalCredits,
  earnCreditsViaSocialLinks,
} from '../controllers/student.controller.js';
import { upload } from '../middlewares/multer.js';
import { __dirname } from '../utils/fileUploadingManaging.js';
import puppeteer from 'puppeteer';
import pkg from 'generic-pool';
import { spawn } from 'child_process';
import fs from 'fs';
import {
  checkoutCredits,
  claimDailyStreak,
  getDailyStreak,
} from '../controllers/credit.controller.js';

const router = Router();

router.get('/details', authMiddleware, studentDetails);
router.get('/job/applications', authMiddleware, getAppliedJobs);

router.post('/job/apply/:jobId', authMiddleware, appliedJob);
router.get('/job/isapplied', authMiddleware, isAppliedOrNot);

router.patch('/fullname/update', authMiddleware, updateFullName);

router.patch('/phone/update', authMiddleware, updatePhone);

router.post('/job-role/update', authMiddleware, updateJobRole);

// Skills
router.post('/skill/add', authMiddleware, addStudentSkills);
router.delete(
  '/skill/remove/:skillId',
  authMiddleware,

  removeStudentSkills,
);
router.patch(
  '/skill/update/:skillId',
  authMiddleware,

  updateStudentSkills,
);

// Experience
router.post('/experience/add', authMiddleware, addExperience);
router.delete(
  '/experience/remove/:expId',
  authMiddleware,

  removeExperience,
);
router.patch(
  '/experience/update/:expId',
  authMiddleware,

  updateExperience,
);

router.post('/education/add', authMiddleware, addEducations);
router.delete(
  '/education/remove/:eduId',
  authMiddleware,

  removeEducation,
);
router.patch(
  '/education/update/:eduId',
  authMiddleware,

  updateEducation,
);
router.get('/education/:id', authMiddleware, getEducationsById);

router.get('/projects', authMiddleware, getAllProjects);
router.post('/project/add', authMiddleware, addProjects);
router.delete(
  '/project/remove/:projectId',
  authMiddleware,

  removeProject,
);
router.patch(
  '/project/update/:projectId',
  authMiddleware,

  updateProjects,
);
router.delete(
  '/project/remove/:projectId',
  authMiddleware,

  removeEducation,
);

router.post(
  '/profile/add',
  authMiddleware,

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
router.get(
  '/jobs/recommended',
  authMiddleware,
  isStudent,
  getProfileBasedRecommendedJobs,
);
router.get('/profile/status', authMiddleware, getProfileCompletion);
router.get('/jobs/stats', authMiddleware, StudentAnalytics);
router.post('/autopilot/toggle', authMiddleware, toggleAutopilot);
router.patch(
  '/complete-onboarding',
  authMiddleware,
  isStudent,
  completeOnboarding,
);
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

router.get('/jobs/visited-all', authMiddleware, getAllVisitedJobs);
router.get('/jobs/viewed-all', authMiddleware, getAllViewedJobs);
router.get('/jobs/saved-all', authMiddleware, getAllSavedJobs);

router.get('/job/stats', authMiddleware, isStudent, getAllStatCounts);

router.get('/job/viewed/:jobId', authMiddleware, isStudent, jobViewedByStudent);

router.post(
  '/job/viewed/:jobId',
  authMiddleware,
  isStudent,
  jobViewedByStudent,
);

router.get('/job/viewed/:jobId', authMiddleware, isStudent, isStudentViewedJob);

router.get('/credits', authMiddleware, getCreditsSummary);
router.get('/total-credits', authMiddleware, getTotalCredits);

router.get(
  '/credit/earn/:action',
  authMiddleware,
  isStudent,
  earnCreditsViaSocialLinks,
);

router.get('/streaks', authMiddleware, getDailyStreak);
router.post('/streaks', authMiddleware, claimDailyStreak);
router.post('/credits/checkout', authMiddleware, checkoutCredits);

router.post(
  '/profile/onboarding',
  authMiddleware,
  isStudent,
  onboardingProfile,
);

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

router.post('/docx/generate-docx', async (req, res) => {
  const { html, title } = req.body;

  if (!html) {
    return res.status(400).json({ message: 'HTML content is required.' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Simplified HTML structure for Pandoc
    const docxOptimizedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Times New Roman', serif;
            line-height: 1.2;
            color: #000;
            font-size: 11pt;
            margin: 0;
            padding: 20px;
          }
          
          .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .name {
            font-size: 22pt;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          
          .contact-info {
            font-size: 11pt;
            margin-bottom: 20px;
          }
          
          .section {
            margin-bottom: 18px;
          }
          
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
          }
          
          .summary-text, .additional {
            font-size: 11pt;
            line-height: 1.3;
            margin-bottom: 12px;
          }
          
          /* Convert flex layouts to simple blocks */
          .company-line, .role-line, .degree-line {
            margin-bottom: 4px;
          }
          
          .company, .university {
            font-weight: bold;
            font-size: 11pt;
          }
          
          .location, .dates {
            font-size: 11pt;
            font-style: italic;
            float: right;
          }
          
          .role {
            font-style: italic;
            font-size: 11pt;
          }
          
          .responsibilities {
            margin: 8px 0;
            padding-left: 20px;
          }
          
          .responsibilities li {
            font-size: 11pt;
            line-height: 1.3;
            margin-bottom: 4px;
          }
          
          .highlight {
            font-weight: bold;
          }
          
          .skill-category {
            margin-bottom: 6px;
          }
          
          .skill-title {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${html}
        </div>
      </body>
      </html>
    `;

    await page.setContent(docxOptimizedHtml, {
      waitUntil: 'load',
      timeout: 30000,
    });

    // Get cleaned HTML
    const cleanedHtml = await page.evaluate(() => {
      // Remove title tags and other problematic elements
      const titleElements = document.querySelectorAll('title');
      titleElements.forEach((el) => el.remove());

      // Remove scripts and styles that cause issues
      const elementsToRemove = document.querySelectorAll('script, link, meta');
      elementsToRemove.forEach((el) => el.remove());

      // Convert flex to simple layouts
      const flexElements = document.querySelectorAll('[style*="flex"]');
      flexElements.forEach((el) => {
        el.style.display = 'block';
      });

      return document.documentElement.outerHTML;
    });

    await browser.close();

    // Use Pandoc WITHOUT the template reference
    const outputPath = `./CareerPilot_${title.replace(/ /g, '_')}.docx`;

    const pandoc = spawn('pandoc', [
      '-f',
      'html',
      '-t',
      'docx',
      '-o',
      outputPath,
    ]);

    pandoc.stdin.write(cleanedHtml);
    pandoc.stdin.end();

    const errorChunks = [];

    pandoc.stderr.on('data', (chunk) => {
      errorChunks.push(chunk);
    });

    pandoc.on('close', (code) => {
      if (code !== 0) {
        const errorMessage = Buffer.concat(errorChunks).toString();
        console.error('Pandoc conversion failed:', errorMessage);
        return res.status(500).json({
          message: 'Failed to generate DOCX file.',
          error: errorMessage,
        });
      }

      console.log('DOCX generated successfully');
      res.download(outputPath, (err) => {
        if (err) {
          console.error('Error sending DOCX:', err);
          res.status(500).json({ message: 'Error sending DOCX file.' });
        }
        // Clean up
        try {
          fs.unlinkSync(outputPath);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      });
    });
  } catch (error) {
    console.error('DOCX Generation Error:', error);
    if (browser) await browser.close();
    res.status(500).json({
      message: 'Failed to generate DOCX.',
      error: error.message,
    });
  }
});

export default router;
