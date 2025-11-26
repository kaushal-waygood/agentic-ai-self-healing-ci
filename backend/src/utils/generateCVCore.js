import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Student } from '../models/student.model.js';
import { User } from '../models/User.model.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { processCVGeneration } from '../utils/cv.background.js';

// <-- NEW: credits helper (adjust path if your project stores it elsewhere)
import { earnCreditsForAction } from '../utils/credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_FREE_MONTHLY_CV_LIMIT = 3;

export const initiateCVGeneration = async (
  req,
  res,
  jobContextString,
  jobTitle,
) => {
  try {
    const { _id } = req.user;
    const { useProfile, finalTouch, savedCVId, flag } = req.body;

    const user = await User.findById(_id).select(
      'currentPlan currentPurchase plan usageLimits usageCounters email fullName',
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasPlan = !!(user.currentPlan || user.currentPurchase || user.plan);

    const freeLimit =
      user.usageLimits && Number.isFinite(user.usageLimits.cvCreation)
        ? user.usageLimits.cvCreation
        : DEFAULT_FREE_MONTHLY_CV_LIMIT;

    const overFreeLimit =
      !hasPlan && user.usageCounters.cvCreation >= freeLimit;

    let studentData;
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }
      studentData = JSON.stringify(student);
    } else if (savedCVId) {
      if (!mongoose.Types.ObjectId.isValid(savedCVId)) {
        return res.status(400).json({ error: 'Invalid savedCVId' });
      }

      const studentWithCVs = await Student.findById(_id).select('htmlCV');
      if (!studentWithCVs) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      if (
        !Array.isArray(studentWithCVs.htmlCV) ||
        studentWithCVs.htmlCV.length === 0
      ) {
        return res
          .status(404)
          .json({ error: 'No saved CVs found for this student' });
      }

      const saved =
        studentWithCVs.htmlCV.id(savedCVId) ||
        studentWithCVs.htmlCV.find(
          (cv) => String(cv._id) === String(savedCVId),
        );

      if (!saved) {
        return res.status(404).json({ error: 'Saved CV not found' });
      }

      const html =
        saved.html ?? saved.content ?? saved.htmlCV ?? saved.body ?? null;

      if (!html || typeof html !== 'string' || !html.trim()) {
        return res
          .status(422)
          .json({ error: 'Saved CV has no usable HTML content' });
      }

      studentData = JSON.stringify({ htmlCV: html });

      console.log('📡 Using saved CV for generation:', savedCVId);
    } else {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'CV file (PDF, DOCX, or Image) is required' });
      }
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        'pdf',
        req.file.filename,
      );

      try {
        let extractedText;
        const fileMimeType = req.file.mimetype;

        if (fileMimeType === 'application/pdf') {
          const dataBuffer = fs.readFileSync(filePath);
          const parsedPDF = await pdfParse(dataBuffer);
          extractedText = parsedPDF.text;
        } else if (
          fileMimeType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileMimeType === 'application/msword'
        ) {
          const result = await mammoth.extractRawText({ path: filePath });
          extractedText = result.value;
        } else if (fileMimeType.startsWith('image/')) {
          const {
            data: { text },
          } = await Tesseract.recognize(filePath, 'eng');
          extractedText = text;
        } else {
          return res.status(400).json({
            error:
              'Unsupported file type. Please upload a PDF, DOCX, or an image.',
          });
        }
        studentData = JSON.stringify({ cvContent: extractedText });
      } finally {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    await user.save();

    const cvTitle = `${student.fullName || user.fullName}'s CV (${
      jobTitle || ''
    })`;

    // --- create job metadata
    const jobId = new mongoose.Types.ObjectId();
    const newCVJob = {
      cvTitle,
      jobId,
      status: 'pending',
      jobContextString,
      finalTouch,
      flag,
      createdAt: new Date(),
      // extra metadata so front-end and background worker can act
      meta: {
        hasPlan,
        overFreeLimit,
        usageThisMonth: user.usageCounters.cvCreation,
        freeLimit,
      },
    };

    // determine whether this is the student's first CV (safe check)
    const isFirstCV = !Array.isArray(student.cvs) || student.cvs.length === 0;

    // push job with metadata
    await Student.findByIdAndUpdate(_id, {
      $push: { cvs: { $each: [newCVJob], $position: 0 } },
    });

    // attempt to reward first CV (do not block CV generation on failure)
    if (isFirstCV) {
      (async () => {
        try {
          // call earnCreditsForAction but do NOT throw if it fails
          const earnResult = await earnCreditsForAction(user._id, 'FIRST_CV', {
            jobId: jobId.toString(),
          });
          console.log(
            `FIRST_CV credits awarded to ${user._id}:`,
            earnResult?.tx ?? earnResult,
          );
        } catch (err) {
          // log and move on — credits failures should not break CV generation
          console.error('Failed to award FIRST_CV credits:', err);
        }
      })();
    }

    const io = req.app.get('io');
    processCVGeneration(
      _id,
      jobId,
      studentData,
      jobContextString,
      finalTouch,
      io,
    );

    return res.status(202).json({
      message:
        'CV generation has started. You will be notified when it is complete.',
      jobId: jobId.toString(),
      meta: {
        hasPlan,
        overFreeLimit,
        usageThisMonth: user.usageCounters.cvCreation,
        freeLimit,
      },
    });
  } catch (error) {
    console.error('Error initiating CV generation:', error);
    return res.status(500).json({ error: 'Failed to start CV generation' });
  }
};
