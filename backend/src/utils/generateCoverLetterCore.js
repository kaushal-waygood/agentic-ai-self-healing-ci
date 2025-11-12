// src/controllers/coverletter.controller.js

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Student } from '../models/student.model.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { processCoverLetterGeneration } from '../utils/coverletter.background.js';
import {
  extractEmail,
  extractPhone,
  deduceNameFromText,
} from '../utils/coverletter.utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /api/coverletters
 * body: { useProfile, finalTouch, savedCVId, jobContextString, outputFormat }
 * file: optional CV file (pdf/docx/image)
 *
 * Note: outputFormat optional: 'plain' (default) | 'html'
 */
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
    } = req.body;
    let normalized = {
      resumeText: '',
      profile: {},
    };

    // Helper assigner to make code readable
    const setProfileFromStudent = (student) => {
      normalized.profile = {
        fullName: student.fullName || '',
        email: student.email || '',
        phone: student.phone || '',
        education: student.education || [],
        experience: student.experience || [],
        skills: student.skills || [],
        projects: student.projects || [],
      };
      // If student stores a resume text or html, prefer that for resumeText
      if (student.resumeText && typeof student.resumeText === 'string') {
        normalized.resumeText = student.resumeText;
      } else if (
        student.htmlCV &&
        Array.isArray(student.htmlCV) &&
        student.htmlCV.length
      ) {
        // pick the most recent html CV if present
        normalized.resumeText =
          student.htmlCV[0].html || student.htmlCV[0].content || '';
      }
    };

    // Branch 1: use profile stored in DB
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id).lean();
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }
      setProfileFromStudent(student);
      // If profile has no email/phone/name, try to fill some from resumeText if present
      if (!normalized.profile.email && normalized.resumeText) {
        normalized.profile.email = extractEmail(normalized.resumeText) || '';
      }
      if (!normalized.profile.phone && normalized.resumeText) {
        normalized.profile.phone = extractPhone(normalized.resumeText) || '';
      }
    }
    // Branch 2: use saved CV id (html or saved cv object)
    else if (savedCVId) {
      if (!mongoose.Types.ObjectId.isValid(savedCVId)) {
        return res.status(400).json({ error: 'Invalid savedCVId' });
      }

      const studentWithCVs = await Student.findById(_id)
        .select('htmlCV fullName email phone')
        .lean();
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

      normalized.resumeText = html;
      normalized.profile = {
        fullName: studentWithCVs.fullName || '',
        email: studentWithCVs.email || '',
        phone: studentWithCVs.phone || '',
      };

      // fill from html content if profile fields empty
      if (!normalized.profile.email)
        normalized.profile.email = extractEmail(html) || '';
      if (!normalized.profile.phone)
        normalized.profile.phone = extractPhone(html) || '';
      if (!normalized.profile.fullName)
        normalized.profile.fullName = deduceNameFromText(html) || '';
    }
    // Branch 3: user uploaded a file (pdf, docx, image)
    else {
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
        let extractedText = '';
        const fileMimeType = req.file.mimetype;

        if (fileMimeType === 'application/pdf') {
          const dataBuffer = fs.readFileSync(filePath);
          const parsedPDF = await pdfParse(dataBuffer);
          extractedText = parsedPDF.text || '';
        } else if (
          fileMimeType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileMimeType === 'application/msword'
        ) {
          const result = await mammoth.extractRawText({ path: filePath });
          extractedText = result.value || '';
        } else if (fileMimeType.startsWith('image/')) {
          const {
            data: { text },
          } = await Tesseract.recognize(filePath, 'eng');
          extractedText = text || '';
        } else {
          return res.status(400).json({
            error:
              'Unsupported file type. Please upload a PDF, DOCX, or an image.',
          });
        }

        normalized.resumeText = extractedText;

        // Try to extract contact info heuristically
        normalized.profile.email = extractEmail(extractedText) || '';
        normalized.profile.phone = extractPhone(extractedText) || '';
        normalized.profile.fullName = deduceNameFromText(extractedText) || '';
      } finally {
        // remove uploaded file no matter what
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            /* ignore unlink errors */
          }
        }
      }
    }

    // At this point normalized contains { resumeText, profile } (strings/arrays)
    const studentData = JSON.stringify(normalized);

    // Step 2: Create a new cover letter job entry
    const jobId = new mongoose.Types.ObjectId();
    const newCLJob = {
      jobId,
      status: 'pending',
      jobContextString,
      finalTouch,
      outputFormat, // track requested format
      createdAt: new Date(),
    };

    await Student.findByIdAndUpdate(_id, {
      $push: { cls: { $each: [newCLJob], $position: 0 } },
    });

    // Step 3: Trigger background processing (fire and forget)
    const io = req.app.get('io');
    processCoverLetterGeneration(
      _id,
      jobId,
      studentData,
      jobContextString,
      finalTouch,
      io,
      outputFormat,
    ).catch((err) => {
      // The background function already handles errors and updates DB, but just in case:
      console.error(
        'Background cover letter job failed to start cleanly:',
        err,
      );
    });

    // Step 4: Immediately respond to the user
    return res.status(202).json({
      message:
        'Cover letter generation has started. You will be notified when it is complete.',
      jobId: jobId.toString(),
    });
  } catch (error) {
    console.error('Error initiating cover letter generation:', error);
    return res
      .status(500)
      .json({ error: 'Failed to start cover letter generation' });
  }
};
