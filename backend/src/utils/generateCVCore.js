import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

// Models
import { Student } from '../models/students/student.model.js';
import { User } from '../models/User.model.js';
import { StudentCV } from '../models/students/studentCV.model.js'; // NEW: Separate model
import { StudentHtmlCV } from '../models/students/studentHtmlCV.model.js'; // Assuming you have this for Saved HTML CVs

// Utils
import { processCVGeneration } from '../utils/cv.background.js';
import { earnCreditsForAction } from '../utils/credits.js';
import { StudentSkill } from '../models/students/studentSkill.model.js';
import { StudentExperience } from '../models/students/studentExperience.model.js';
import { StudentEducation } from '../models/students/studentEducation.model.js';
import { StudentProject } from '../models/students/studentProject.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initiateCVGeneration = async (
  req,
  res,
  jobContextString,
  jobTitle,
) => {
  try {
    const { _id } = req.user;
    const { useProfile, finalTouch, savedCVId, flag } = req.body;

    // 1. Validate User
    const user = await User.findById(_id).select(
      'currentPlan currentPurchase plan usageLimits usageCounters email fullName',
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Prepare Data Source (Profile vs SavedCV vs Upload)
    let studentData;

    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id).lean();
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      const skills = await StudentSkill.find({ student: _id }).lean();
      const experiences = await StudentExperience.find({ student: _id }).lean();
      const educations = await StudentEducation.find({ student: _id }).lean();
      const projects = await StudentProject.find({ student: _id }).lean();

      studentData = JSON.stringify({
        student,
        skills,
        experiences,
        educations,
        projects,
      });
    } else if (savedCVId) {
      if (!mongoose.Types.ObjectId.isValid(savedCVId)) {
        return res.status(400).json({ error: 'Invalid savedCVId' });
      }

      // Updated: Fetch from StudentHtmlCV model
      const saved = await StudentHtmlCV.findOne({
        _id: savedCVId,
        student: _id,
      });

      if (!saved) {
        return res.status(404).json({ error: 'Saved CV not found' });
      }

      const html = saved.html || saved.content || saved.htmlCV;
      if (!html || typeof html !== 'string' || !html.trim()) {
        return res
          .status(422)
          .json({ error: 'Saved CV has no usable HTML content' });
      }

      studentData = JSON.stringify({ htmlCV: html });
      console.log('📡 Using saved CV for generation:', savedCVId);
    } else {
      // File Upload Handling
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

    const generatedCVTitle = `${student.fullName || user.fullName}'s CV (${
      jobTitle || 'New'
    })`;
    const jobId = new mongoose.Types.ObjectId(); // Unique ID for this job context

    // 3. Create Record in StudentCV Collection (NEW)
    const newCV = await StudentCV.create({
      student: _id,
      jobId: jobId,
      cvTitle: generatedCVTitle,
      status: 'pending',
      jobContextString,
      finalTouch,
      flag,
      // cvData is empty initially
    });

    // 4. Handle "First CV" Credits
    // We count existing CVs for this student to determine if it's the first one
    const cvCount = await StudentCV.countDocuments({ student: _id });
    const isFirstCV = cvCount === 1; // It's 1 because we just created one above

    if (isFirstCV) {
      // Non-blocking credit award
      (async () => {
        try {
          const earnResult = await earnCreditsForAction(user._id, 'FIRST_CV', {
            cvId: newCV._id.toString(),
          });
          console.log(`FIRST_CV credits awarded to ${user._id}`);
        } catch (err) {
          console.error('Failed to award FIRST_CV credits:', err);
        }
      })();
    }

    // 5. Trigger Background Processing
    const io = req.app.get('io');

    // Pass the IDs needed by the worker
    processCVGeneration(
      _id,
      jobId,
      studentData,
      jobContextString,
      finalTouch,
      io,
      req.endpoint,
    );

    // 6. Response
    return res.status(202).json({
      message:
        'CV generation has started. You will be notified when it is complete.',
      jobId: jobId.toString(),
      cvId: newCV._id, // Return the new document ID
    });
  } catch (error) {
    console.error('Error initiating CV generation:', error);
    return res.status(500).json({ error: 'Failed to start CV generation' });
  }
};
