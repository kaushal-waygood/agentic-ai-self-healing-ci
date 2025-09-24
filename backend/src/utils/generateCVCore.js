import { Student } from '../models/student.model.js';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { genAI } from '../config/gemini.js';
import { generateCVPrompt } from '../prompt/generateCVPrompt.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCVCore = async (req, res, jobContextString) => {
  try {
    const { _id } = req.user;
    const { useProfile, finalTouch } = req.body;
    console.log(req.body);
    let studentData;

    // Step 2: Determine data source (Common Logic)
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      studentData = JSON.stringify(student);
    } else {
      if (!req.file) {
        return res.status(400).json({ error: 'CV PDF file is required' });
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

    // Step 3: Create prompt that asks for a JSON response
    const prompt = generateCVPrompt(jobContextString, studentData, finalTouch);

    // Step 4: Generate JSON response with a single AI call
    const rawJsonResponse = await genAI(prompt);

    // Step 5: Clean the response
    const cleanedJsonString = rawJsonResponse
      .replace(/```json|```/g, '')
      .trim();

    // Step 6: Parse the cleaned JSON string
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedJsonString);
    } catch (error) {
      console.error('Error parsing JSON from AI:', error);
      console.error('Raw AI Response:', cleanedJsonString);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Step 7: Send the parsed JSON object back to the client
    return res.json(parsedJson);
  } catch (error) {
    console.error('Error in CV generation core:', error);
    return res.status(500).json({ error: 'Failed to generate CV' });
  }
};
