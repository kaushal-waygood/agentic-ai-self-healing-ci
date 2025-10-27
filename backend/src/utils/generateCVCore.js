import { Student } from '../models/student.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.model.js'; // Ensure this path is correct

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

    // ... (Steps 1 and 2 for determining data source are unchanged)
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
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
      let extractedText;
      try {
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

    // Step 3: Create prompt and generate CV
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

    const updatedUser = await User.findByIdAndUpdate(_id, {
      $inc: { 'usageCounters.cvCreation': 1 }, // Increment the counter by 1
      $push: { cvs: parsedJson }, // Push the new CV object into the 'cvs' array
    });

    // Optional but good practice: check if the user was found
    if (!updatedUser) {
      return res
        .status(404)
        .json({ error: 'User could not be found to save CV.' });
    }

    // Finally, send the newly generated CV back to the client
    return res.json(parsedJson);
  } catch (error) {
    console.error('Error in CV generation core:', error);
    return res.status(500).json({ error: 'Failed to generate CV' });
  }
};
