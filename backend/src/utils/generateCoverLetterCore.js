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
import { StudentCL } from '../models/students/studentCL.model.js'; // NEW: Separate model
import { StudentHtmlCV } from '../models/students/studentHtmlCV.model.js'; // Assuming this exists

// Utils
import { processCoverLetterGeneration } from '../utils/coverletter.background.js';
import {
  extractEmail,
  extractPhone,
  deduceNameFromText,
} from '../utils/coverletter.utils.js';
import { earnCreditsForAction } from '../utils/credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initiateCoverLetterGeneration = async (
  req,
  res,
  jobContextString,
) => {
  try {
    const { _id } = req.user;
    const {
      useProfile,
      finalTouch,
      savedCVId,
      outputFormat = 'plain',
      flag,
    } = req.body;

    // 🔒 Validate user
    const user = await User.findById(_id).select('_id fullName email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    /* ----------------------------
       DATA PREPARATION
    ----------------------------- */
    const normalized = {
      resumeText: '',
      profile: {
        fullName: '',
        email: '',
        phone: '',
        education: [],
        experience: [],
        skills: [],
        projects: [],
      },
    };

    const hydrateFromStudent = (student) => {
      normalized.profile.fullName = student.fullName || '';
      normalized.profile.email = student.email || '';
      normalized.profile.phone = student.phone || '';
      // Assuming these are populated or exist on the student object
      normalized.profile.education = student.education || [];
      normalized.profile.experience = student.experience || [];
      normalized.profile.skills = student.skills || [];
      normalized.profile.projects = student.projects || [];

      if (typeof student.resumeText === 'string') {
        normalized.resumeText = student.resumeText;
      }
    };

    // 1️⃣ Use full profile
    if (useProfile === 'true' || useProfile === true) {
      // Use .lean() and populate if your relational data is in separate schemas
      // For now assuming the necessary data is attached to the result or handled inside process logic
      const student = await Student.findById(_id).lean();
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      hydrateFromStudent(student);

      if (!normalized.profile.email && normalized.resumeText) {
        normalized.profile.email = extractEmail(normalized.resumeText) || '';
      }
      if (!normalized.profile.phone && normalized.resumeText) {
        normalized.profile.phone = extractPhone(normalized.resumeText) || '';
      }
    }

    // 2️⃣ Use saved CV
    else if (savedCVId) {
      if (!mongoose.Types.ObjectId.isValid(savedCVId)) {
        return res.status(400).json({ error: 'Invalid savedCVId' });
      }

      const saved = await StudentHtmlCV.findOne({
        _id: savedCVId,
        student: _id,
      });
      if (!saved) {
        return res.status(404).json({ error: 'Saved CV not found' });
      }

      // Fallback to fetch basic student details
      const student = await Student.findById(_id)
        .select('fullName email phone')
        .lean();

      const html = saved.html || saved.content || saved.htmlCV || '';
      if (!html.trim()) {
        return res
          .status(422)
          .json({ error: 'Saved CV has no usable content' });
      }

      normalized.resumeText = html;
      normalized.profile.fullName =
        student?.fullName || deduceNameFromText(html) || '';
      normalized.profile.email = student?.email || extractEmail(html) || '';
      normalized.profile.phone = student?.phone || extractPhone(html) || '';
    }

    // 3️⃣ Uploaded file
    else {
      if (!req.file) {
        return res.status(400).json({ error: 'CV file is required' });
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
        let extractedText = '';
        const type = req.file.mimetype;

        if (type === 'application/pdf') {
          const buf = fs.readFileSync(filePath);
          extractedText = (await pdfParse(buf)).text || '';
        } else if (
          type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          type === 'application/msword'
        ) {
          extractedText =
            (await mammoth.extractRawText({ path: filePath })).value || '';
        } else if (type.startsWith('image/')) {
          extractedText =
            (await Tesseract.recognize(filePath, 'eng')).data.text || '';
        } else {
          return res.status(400).json({ error: 'Unsupported file type' });
        }

        normalized.resumeText = extractedText;
        normalized.profile.email = extractEmail(extractedText) || '';
        normalized.profile.phone = extractPhone(extractedText) || '';
        normalized.profile.fullName = deduceNameFromText(extractedText) || '';
      } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    /* ----------------------------
       CREATE RECORD & FIRE
    ----------------------------- */

    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const jobId = new mongoose.Types.ObjectId();
    const clTitle = `${student.fullName || 'My'} Cover Letter`;

    // CREATE separate document
    const newCL = await StudentCL.create({
      student: _id,
      jobId: jobId,
      clTitle,
      status: 'pending',
      jobContextString,
      finalTouch,
      // outputFormat, // Add to schema if needed
      flag,
      createdAt: new Date(),
    });

    // Credits: Check if this is the FIRST Cover Letter
    const clCount = await StudentCL.countDocuments({ student: _id });
    const isFirstCL = clCount === 1;

    if (isFirstCL) {
      earnCreditsForAction(_id, 'FIRST_CL', {
        clId: newCL._id.toString(),
      }).catch((err) => console.error('FIRST_CL credit failed:', err));
    }

    const io = req.app.get('io');

    processCoverLetterGeneration(
      _id,
      jobId,
      JSON.stringify(normalized),
      jobContextString,
      finalTouch,
      io,
      // outputFormat,
    ).catch((err) => {
      console.error('Cover letter background job failed to start:', err);
    });

    return res.status(202).json({
      message: 'Cover letter generation has started.',
      jobId: jobId.toString(),
      clId: newCL._id,
    });
  } catch (error) {
    console.error('Error initiating cover letter generation:', error);
    return res
      .status(500)
      .json({ error: 'Failed to start cover letter generation' });
  }
};
