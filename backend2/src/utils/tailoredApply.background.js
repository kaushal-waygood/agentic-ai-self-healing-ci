/* ============================================================
   Updated Worker: processTailoredApplication
============================================================ */
import { StudentTailoredApplication } from '../models/students/studentTailoredApplication.model.js';
import { User } from '../models/User.model.js';
import {
  notificationTemplates,
  sendRealTimeUserNotification,
} from './notification.utils.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';
import {
  generateEmailPrompt,
  processEmailResponse,
} from '../prompt/generateEmail.js';
import { genAIRequest as genAI } from '../config/gemini.js';
import { wrapCVHtml } from '../utils/cvTemplate.js';
import { wrapEmailHtml } from '../utils/emailTemplate.js';
import { condenseExperience } from '../utils/cvCondense.js';
import { calculateATSScore } from '../utils/atsScore.js';

// --- Helpers ---
const stripCodeFences = (s) =>
  String(s || '')
    .replace(/```json|```html|```/g, '')
    .trim();
const FORBIDDEN_TAG_REGEX = /<(style|html|head|body|script|link)|style\s*=/i;
const ensureArray = (arr) => (Array.isArray(arr) ? arr : []);

const genAIWithRetry = async (prompt) => {
  // Add retry logic here if needed, currently passing through
  return genAI(prompt);
};

export const processTailoredApplication = async (
  userId,
  applicationId,
  applicationData,
  io,
) => {
  console.log(`[Job Start] Processing Application: ${applicationId}`);

  try {
    // 1. Validate Document Exists
    const appDoc = await StudentTailoredApplication.findById(applicationId);
    if (!appDoc) throw new Error(`Application doc not found: ${applicationId}`);

    // 2. Normalize Candidate Data
    let candidateObj = {};
    if (typeof applicationData.candidate === 'string') {
      try {
        candidateObj = JSON.parse(applicationData.candidate);
      } catch {
        candidateObj = {};
      }
    } else if (typeof applicationData.candidate === 'object') {
      candidateObj = applicationData.candidate || {};
    }

    // 3. Prepare Slim Candidate (Fixing the cvText issue)
    // NOTE: If 'uploadedCV' is just a URL, the AI cannot read the file content.
    // Ideally, you should parse the PDF text before this step.
    // For now, we pass the URL so at least the AI knows a CV exists.
    const slimCandidate = {
      fullName: candidateObj.fullName || '',
      email: candidateObj.email || '',
      phone: candidateObj.phone || '',
      location: candidateObj.location || '',
      jobRole: candidateObj.jobRole || '',
      education: ensureArray(candidateObj.education),
      experience: ensureArray(candidateObj.experience),
      skills: ensureArray(candidateObj.skills),
      projects: ensureArray(candidateObj.projects),
      // ✅ FIX: Check uploadedCV if cv is missing
      cvText: candidateObj.cv || candidateObj.uploadedCV || '',
    };

    const sanitized = {
      ...applicationData,
      candidate: slimCandidate,
    };

    // ---------------------------------------------------------
    // A. Generate CV
    // ---------------------------------------------------------
    console.log('Generating CV...');
    const cvPrompt = generateCVPrompt(
      sanitized.job.description,
      JSON.stringify(slimCandidate, null, 2),
      sanitized.preferences,
    );

    const cvRaw = await genAIWithRetry(cvPrompt);
    let parsedCV;

    try {
      parsedCV = JSON.parse(stripCodeFences(cvRaw));
    } catch (e) {
      console.error('JSON Parse Error for CV:', cvRaw);
      throw new Error('AI returned invalid CV JSON format');
    }

    if (!parsedCV.cv || FORBIDDEN_TAG_REGEX.test(parsedCV.cv)) {
      throw new Error('AI returned invalid or malicious HTML in CV');
    }

    // Normalize and Wrap CV
    parsedCV.cv = condenseExperience(parsedCV.cv);
    parsedCV.cv = wrapCVHtml(parsedCV.cv, sanitized.job.title);
    parsedCV.atsScore = calculateATSScore(
      parsedCV.cv,
      sanitized.job.description,
    );
    parsedCV.atsScoreReasoning =
      parsedCV.atsScoreReasoning ||
      'Score calculated based on keyword overlap.';

    // ---------------------------------------------------------
    // B. Generate Cover Letter
    // ---------------------------------------------------------
    console.log('Generating Cover Letter...');
    const clPrompt = generateCoverLetterPrompts(
      sanitized.job.title,
      JSON.stringify(slimCandidate),
      sanitized.preferences,
    );

    const clRaw = await genAIWithRetry(clPrompt);
    const tailoredCoverLetter = stripCodeFences(clRaw);

    if (FORBIDDEN_TAG_REGEX.test(tailoredCoverLetter)) {
      throw new Error('AI returned invalid HTML in Cover Letter');
    }

    // ---------------------------------------------------------
    // C. Generate Email
    // ---------------------------------------------------------
    console.log('Generating Email...');
    const emailPrompt = generateEmailPrompt(sanitized);
    const emailRaw = await genAIWithRetry(emailPrompt);
    const emailText = processEmailResponse(emailRaw);

    // Parse Email Sections
    const subjectMatch = emailText.match(/SUBJECT:\s*(.+)/i);
    const bodyMatch = emailText.match(/BODY:\s*([\s\S]*?)\nSIGNATURE:/i);
    const signatureMatch = emailText.match(/SIGNATURE:\s*(.+)/i);

    let applicationEmail = {};
    if (subjectMatch && bodyMatch) {
      applicationEmail = {
        subject: subjectMatch[1].trim(),
        body: bodyMatch[1].trim(),
        signature: signatureMatch?.[1]?.trim() || slimCandidate.fullName || '',
        html: wrapEmailHtml(
          subjectMatch[1].trim(),
          bodyMatch[1].trim(),
          signatureMatch?.[1]?.trim(),
        ),
      };
    } else {
      applicationEmail = {
        raw: emailText,
        html: wrapEmailHtml('Job Application', emailText, ''),
      };
    }

    // ---------------------------------------------------------
    // D. Database Update
    // ---------------------------------------------------------
    console.log('Updating Database...');

    const updateResult = await StudentTailoredApplication.findByIdAndUpdate(
      applicationId,
      {
        $set: {
          status: 'completed',
          tailoredCV: parsedCV,
          tailoredCoverLetter: { html: tailoredCoverLetter },
          applicationEmail: applicationEmail,
          completedAt: new Date(),
          error: null, // Clear any previous errors
        },
      },
      { new: true, runValidators: true }, // ✅ Returns the updated doc and runs schema validators
    );

    if (!updateResult) {
      throw new Error('Application document missing during update phase');
    }

    // ---------------------------------------------------------
    // E. Usage & Notifications
    // ---------------------------------------------------------
    await User.updateOne(
      { _id: userId },
      { $inc: { 'usageCounters.aiApplication': 1 } },
    );

    console.log(`[Success] Application ${applicationId} completed.`);

    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_SUCCESS(
        'Your tailored application is ready!',
        applicationId,
      ),
    );
  } catch (error) {
    console.error(
      `[TAILORED APPLY FAILED] AppId: ${applicationId}`,
      error.message,
    );

    // Update DB with Failure Status
    await StudentTailoredApplication.findByIdAndUpdate(applicationId, {
      $set: {
        status: 'failed',
        error: error.message,
        completedAt: new Date(),
      },
    });

    // Notify User of Failure
    await sendRealTimeUserNotification(
      io,
      userId,
      notificationTemplates.TAILORED_APPLICATION_GENERATED_FAILED(
        'Tailored application generation failed.',
        error.message,
      ),
    );
  }
};
