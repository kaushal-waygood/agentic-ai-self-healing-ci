// utils/cvParser.js
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { CVDataPrompt } from '../prompt/studentCVData.js';
import { genAI } from '../config/gemini.js';

/**
 * Extracts and structures student data from a PDF CV
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - Structured student data
 */
export const extractDataFromCV = async (filePath) => {
  try {
    // Read and parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    // Process text with AI (replace with your actual AI processing)
    const prompt = CVDataPrompt(pdfData.text);
    const rawText = await genAI(prompt);
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    // Parse JSON response
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      throw new Error('Invalid JSON received from AI');
    }

    // Standardize the extracted data
    return {
      personalInfo: {
        fullName: parsedJson.fullName || '',
        phone: parsedJson.phone || '',
      },
      education: (parsedJson.education || []).map((item) => ({
        educationId: uuidv4(),
        institute: item.institute || '',
        degree: item.degree || '',
        fieldOfStudy: item.fieldOfStudy || '',
        startYear: item.startYear || null,
        endYear: item.endYear || null,
        grade: item.grade || '',
      })),
      experience: (parsedJson.experience || []).map((item) => ({
        experienceId: uuidv4(),
        company: item.company || '',
        title: item.title || '',
        employmentType: item.employmentType || 'FULL_TIME',
        location: item.location || '',
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        description: item.description || '',
        experienceYrs: item.experienceYrs || 0,
        currentlyWorking: item.currentlyWorking || false,
        technologies: item.technologies || [],
      })),
      skills: (parsedJson.skills || []).map((item) => {
        const skill = typeof item === 'string' ? item : item.skill;
        const level =
          typeof item === 'object' && item.level
            ? item.level.toUpperCase()
            : 'BEGINNER';

        return {
          skillId: uuidv4(),
          skill: skill || '',
          level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(level)
            ? level
            : 'BEGINNER',
        };
      }),
      projects: (parsedJson.projects || []).map((item) => ({
        projectName: item.projectName || '',
        description: item.description || '',
        startDate: item.startDate || null,
        endDate: item.endDate || null,
        technologies: item.technologies || [],
        link: item.link || '',
        isWorkingActive: item.isWorkingActive || false,
      })),
      jobPreferences: parsedJson.jobPreferences || {},
    };
  } catch (error) {
    console.error('CV Parsing Error:', error);
    throw error;
  }
};
