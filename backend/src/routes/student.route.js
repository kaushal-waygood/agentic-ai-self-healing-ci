import { Router } from 'express';
import {
  authMiddleware,
  isUserOrUniStudent,
} from '../middlewares/auth.middleware.js';

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import {
  getStudentDetails,
  updateStudentCoreProfile,
  onboardingProfile,
  completeOnboarding,
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  getEducations,
  addEducation,
  getExperiences,
  addExperience,
  getProjects,
  addProject,
  trackJobEvent,
  toggleSaveJob,
  applyToJob,
  getSavedJobs,
  getAppliedJobs,
  deleteEducation,
  updateEducation,
  deleteExperience,
  updateExperience,
  deleteProject,
  updateProject,
  getJobInteractionStatus,
  getJobAnalytics,
  getProfileCompletion,
  StudentAnalytics,
  updateJobPreferences,
  getRecentAIActivity,
  completeStudentOnboarding,
  verifyStudentViaIdCardOrUniEmail,
  activateStudentPlan,
  getCreditsSummary,
} from '../controllers/student.c.js';
import {
  getProfileBasedRecommendedJobs,
  getTotalCredits,
  toggleAutopilot,
  getAutopilotStatus,
} from '../controllers/student.controller.js';
import {
  checkoutCredits,
  claimDailyStreak,
  getDailyStreak,
  earnCredits,
} from '../controllers/credit.controller.js';
import { upload } from '../middlewares/multer.js';
import multer from 'multer';
import { logToFile } from '../utils/logFile.js';

const router = Router();

router.post(
  '/job-preferences',
  authMiddleware,
  isUserOrUniStudent,
  updateJobPreferences,
);

export const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Only JPG and PNG allowed'));
    }
    cb(null, true);
  },
});
/* Student */
router.get('/details', authMiddleware, isUserOrUniStudent, getStudentDetails);
router.patch(
  '/profile/update',
  authMiddleware,
  isUserOrUniStudent,
  profileImageUpload.single('profileImage'),
  updateStudentCoreProfile,
);
router.post(
  '/profile/onboarding',
  authMiddleware,
  isUserOrUniStudent,
  completeStudentOnboarding,
);

router.post(
  '/profile/complete',
  authMiddleware,
  isUserOrUniStudent,
  completeOnboarding,
);

/* Skills */
router.get('/skills', authMiddleware, isUserOrUniStudent, getSkills);
router.post('/skills', authMiddleware, isUserOrUniStudent, addSkill);
router.patch(
  '/skills/:skillId',
  authMiddleware,
  isUserOrUniStudent,
  updateSkill,
);
router.delete(
  '/skills/:skillId',
  authMiddleware,
  isUserOrUniStudent,
  deleteSkill,
);

/* Education */
router.get('/educations', authMiddleware, isUserOrUniStudent, getEducations);
router.post('/educations', authMiddleware, isUserOrUniStudent, addEducation);
router.delete(
  '/educations/:educationId',
  authMiddleware,
  isUserOrUniStudent,
  deleteEducation,
);
router.patch(
  '/educations/:educationId',
  authMiddleware,
  isUserOrUniStudent,
  updateEducation,
);

/* Experience */
router.get('/experiences', authMiddleware, isUserOrUniStudent, getExperiences);
router.post('/experiences', authMiddleware, isUserOrUniStudent, addExperience);
router.delete(
  '/experiences/:experienceId',
  authMiddleware,
  isUserOrUniStudent,
  deleteExperience,
);
router.patch(
  '/experiences/:experienceId',
  authMiddleware,
  isUserOrUniStudent,
  updateExperience,
);

/* Projects */
router.get('/projects', authMiddleware, isUserOrUniStudent, getProjects);
router.post('/projects', authMiddleware, isUserOrUniStudent, addProject);
router.delete(
  '/projects/:projectId',
  authMiddleware,
  isUserOrUniStudent,
  deleteProject,
);
router.patch(
  '/projects/:projectId',
  authMiddleware,
  isUserOrUniStudent,
  updateProject,
);

router.get(
  '/jobs/recommended',
  authMiddleware,
  isUserOrUniStudent,
  getProfileBasedRecommendedJobs,
);

/* Job interactions */
router.post('/jobs/events', authMiddleware, isUserOrUniStudent, trackJobEvent);
router.post('/jobs/saved', authMiddleware, isUserOrUniStudent, toggleSaveJob);
router.post(
  '/jobs/:jobId/apply',
  authMiddleware,
  isUserOrUniStudent,
  applyToJob,
);
router.get('/jobs/events', authMiddleware, isUserOrUniStudent, getSavedJobs);
router.get('/jobs/applied', authMiddleware, isUserOrUniStudent, getAppliedJobs);
router.get(
  '/jobs/intraction-status',
  authMiddleware,
  isUserOrUniStudent,
  getJobInteractionStatus,
);
router.get(
  '/jobs/interaction-analytics',
  authMiddleware,
  isUserOrUniStudent,
  getJobAnalytics,
);

router.get('/streaks', authMiddleware, isUserOrUniStudent, getDailyStreak);
router.post('/streaks', authMiddleware, isUserOrUniStudent, claimDailyStreak);
router.get('/credits', authMiddleware, isUserOrUniStudent, getCreditsSummary);
router.get(
  '/credit/earn/:action',
  authMiddleware,
  isUserOrUniStudent,
  earnCredits,
);

router.get(
  '/total-credits',
  authMiddleware,
  isUserOrUniStudent,
  getTotalCredits,
);

router.get(
  '/profile/status',
  authMiddleware,
  isUserOrUniStudent,
  getProfileCompletion,
);

router.get('/jobs/stats', authMiddleware, isUserOrUniStudent, StudentAnalytics);

router.post(
  '/credits/checkout',
  authMiddleware,
  isUserOrUniStudent,
  checkoutCredits,
);

router.get(
  '/ai-activity',
  authMiddleware,
  isUserOrUniStudent,
  getRecentAIActivity,
);

router.post(
  '/autopilot/toggle',
  authMiddleware,
  isUserOrUniStudent,
  toggleAutopilot,
);

router.get(
  '/autopilot/status',
  authMiddleware,
  isUserOrUniStudent,
  getAutopilotStatus,
);

router.post(
  '/verify-student',
  authMiddleware,
  isUserOrUniStudent,
  upload.single('idCard'),
  verifyStudentViaIdCardOrUniEmail,
);

router.post(
  '/activate-student-plan',
  authMiddleware,
  isUserOrUniStudent,
  activateStudentPlan,
);

router.post('/pdf/generate-pdf', async (req, res) => {
  const { html, title, isShowImage } = req.body;

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

    await page.emulateMediaType('screen');

    // FIX 2: Better wait strategy
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 60000,
    });

    // FIX 3: Inject CSS to prevent content clipping
    await page.addStyleTag({
      content: `
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            display: block !important;
          }

          ${
            isShowImage
              ? ''
              : '.resume-container .profile-image { display: none; }'
          }
        `,
    });

    // FIX 4: Wait for fonts (Inter, Plus Jakarta Sans, etc.) to load before PDF
    // Ensures downloaded PDF matches web preview font-family
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await new Promise((r) => setTimeout(r, 300));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      timeout: 60000,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    // Sanitize filename to remove characters that might break headers
    const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="zobsai_${safeTitle}.pdf"`,
    );

    logToFile(html, 'pdf.txt');

    console.log('PDF generated successfully');

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

router.post(
  '/docx/generate-docx',
  authMiddleware,
  isUserOrUniStudent,
  async (req, res) => {
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
            font-family: Arial, Helvetica, sans-serif;
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
          ${html}
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
        const elementsToRemove =
          document.querySelectorAll('script, link, meta');
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
  },
);

export default router;
