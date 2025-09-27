import { Student } from '../models/student.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import text extraction libraries
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

import { genAI } from '../config/gemini.js';
import { generateCoverLetterPrompts } from '../prompt/generateCoverletter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCoverLetterCore = async (req, res, jobContextString) => {
  try {
    const { _id } = req.user;
    const { useProfile, finalTouch } = req.body;
    let studentData;

    // Step 1: Determine the data source (user profile or file upload)
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = JSON.stringify(student);
    } else {
      // Step 2: Handle file-based data extraction
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'CV file (PDF, DOCX, or Image) is required' });
      }

      // Ensure this path matches your Multer storage destination
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
          `Processing file for Cover Letter: ${req.file.filename} with type: ${fileMimeType}`,
        );

        if (fileMimeType === 'application/pdf') {
          // Handle PDF files
          const dataBuffer = fs.readFileSync(filePath);
          const parsedPDF = await pdfParse(dataBuffer);
          extractedText = parsedPDF.text;
        } else if (
          fileMimeType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileMimeType === 'application/msword'
        ) {
          // Handle DOCX and DOC files
          const result = await mammoth.extractRawText({ path: filePath });
          extractedText = result.value;
        } else if (fileMimeType.startsWith('image/')) {
          // Handle Image files using OCR
          console.log(`Starting OCR process for ${filePath}...`);
          const {
            data: { text },
          } = await Tesseract.recognize(filePath, 'eng', {
            logger: (m) =>
              console.log(m.status, `${(m.progress * 100).toFixed(2)}%`),
          });
          extractedText = text;
          console.log('OCR process finished.');
        } else {
          // Handle unsupported file types
          return res.status(400).json({
            error:
              'Unsupported file type. Please upload a PDF, DOCX, or an image.',
          });
        }

        studentData = JSON.stringify({ cvContent: extractedText });
      } finally {
        // IMPORTANT: Always clean up the uploaded file after processing
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Step 3: Create a prompt for the AI model
    const prompt = generateCoverLetterPrompts(
      jobContextString,
      studentData,
      finalTouch,
    );

    // Step 4: Generate the cover letter content
    const rawHtmlResponse = await genAI(prompt);

    // Step 5: Clean the AI response and send it to the client
    const htmlContent = rawHtmlResponse.replace(/```html|```/g, '').trim();
    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlContent);
  } catch (error) {
    console.error('Error in Cover Letter generation core:', error);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};
