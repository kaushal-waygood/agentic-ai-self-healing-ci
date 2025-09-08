import { Student } from '../models/student.model.js';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { genAI } from '../config/gemini.js';
import {
  generateCoverLetterPrompt,
  generateCoverLetterPrompts,
} from '../prompt/generateCoverletter.js';

export const generateCoverLetterCore = async (req, res, jobContextString) => {
  try {
    const { _id } = req.user;
    const { useProfile, finalTouch } = req.body;
    let studentData;

    // Determine data source (same logic as CV)
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = JSON.stringify(student);
    } else {
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
        const dataBuffer = fs.readFileSync(filePath);
        const parsedPDF = await pdfParse(dataBuffer);
        studentData = JSON.stringify({ cvContent: parsedPDF.text });
      } finally {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Create prompt that asks for an HTML response
    const prompt = generateCoverLetterPrompts(
      jobContextString,
      studentData,
      finalTouch,
    );

    // Generate HTML response with a single AI call
    const rawHtmlResponse = await genAI(prompt);

    // Clean and send the response
    const htmlContent = rawHtmlResponse.replace(/```html|```/g, '').trim();
    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlContent);
  } catch (error) {
    console.error('Error in Cover Letter generation core:', error);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
};
