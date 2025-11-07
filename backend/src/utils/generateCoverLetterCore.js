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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initiateCoverLetterGeneration = async (
  req,
  res,
  jobContextString,
) => {
  try {
    const { _id } = req.user;
    const { useProfile, finalTouch, savedCVId } = req.body;
    let studentData;

    console.log('initiateCoverLetterGeneration');

    // Step 1: Get student data (same as CV generation)
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

      // Fetch only what's needed
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

    // Step 2: Create a new cover letter job entry
    const jobId = new mongoose.Types.ObjectId();
    const newCLJob = {
      jobId,
      status: 'pending',
      jobContextString,
      finalTouch,
      createdAt: new Date(),
    };

    await Student.findByIdAndUpdate(_id, {
      $push: { cls: { $each: [newCLJob], $position: 0 } },
    });

    // Step 3: Trigger background processing
    const io = req.app.get('io');
    processCoverLetterGeneration(
      _id,
      jobId,
      studentData,
      jobContextString,
      finalTouch,
      io,
    );

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
