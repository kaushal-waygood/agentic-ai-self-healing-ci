import { Student } from '../models/student.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

import { genAI } from '../config/gemini.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCVCore = async (req, res, jobContextString) => {
  try {
    const { _id } = req.user;
    const { useProfile, finalTouch } = req.body;
    let studentData;

    // Step 1: Determine data source
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = JSON.stringify(student);
    } else {
      // Step 2: Handle file-based data source (PDF, DOCX, Image)
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
      let extractedText;

      try {
        const fileMimeType = req.file.mimetype;
        console.log(
          `Processing file: ${req.file.filename} with type: ${fileMimeType}`,
        );

        if (fileMimeType === 'application/pdf') {
          // Handle PDF
          const dataBuffer = fs.readFileSync(filePath);
          const parsedPDF = await pdfParse(dataBuffer);
          extractedText = parsedPDF.text;
        } else if (
          fileMimeType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileMimeType === 'application/msword'
        ) {
          // Handle DOCX and DOC
          const result = await mammoth.extractRawText({ path: filePath });
          extractedText = result.value;
        } else if (fileMimeType.startsWith('image/')) {
          // Handle Images with OCR
          console.log(`Starting OCR process for ${filePath}...`);
          const {
            data: { text },
          } = await Tesseract.recognize(filePath, 'eng', {
            logger: (m) => console.log(m), // Optional: log progress
          });
          extractedText = text;
          console.log('OCR process finished.');
        } else {
          // Handle unsupported types just in case
          return res.status(400).json({
            error:
              'Unsupported file type. Please upload a PDF, DOCX, or an image.',
          });
        }

        studentData = JSON.stringify({ cvContent: extractedText });
      } finally {
        // IMPORTANT: Always clean up the uploaded file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Step 3: Create prompt and generate CV (no changes needed here)
    const prompt = generateCVPrompt(jobContextString, studentData, finalTouch);
    const rawJsonResponse = await genAI(prompt);
    const cleanedJsonString = rawJsonResponse
      .replace(/```json|```/g, '')
      .trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedJsonString);
    } catch (error) {
      console.error('Error parsing JSON from AI:', error);
      console.error('Raw AI Response:', cleanedJsonString);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    return res.json(parsedJson);
  } catch (error) {
    console.error('Error in CV generation core:', error);
    return res.status(500).json({ error: 'Failed to generate CV' });
  }
};
