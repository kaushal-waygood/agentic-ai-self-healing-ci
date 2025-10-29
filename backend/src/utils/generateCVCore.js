import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Models
import { Student } from '../models/student.model.js';
import { User } from '../models/User.model.js';

// Parsers for file uploads
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

// Background processor
import { processCVGeneration } from '../utils/cv.background.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initiateCVGeneration = async (req, res, jobContextString) => {
  try {
    const { _id } = req.user;
    const { useProfile, finalTouch } = req.body;
    let studentData;

    console.log('initiateCVGeneration');

    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }
      studentData = JSON.stringify(student);
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

    const jobId = new mongoose.Types.ObjectId();
    const newCVJob = {
      jobId,
      status: 'pending',
      jobContextString,
      finalTouch,
      createdAt: new Date(),
    };

    // ✅ FIX: Use Student model instead of User
    await Student.findByIdAndUpdate(_id, {
      $push: { cvs: { $each: [newCVJob], $position: 0 } },
    });

    // Trigger background processing
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
    });
  } catch (error) {
    console.error('Error initiating CV generation:', error);
    return res.status(500).json({ error: 'Failed to start CV generation' });
  }
};
