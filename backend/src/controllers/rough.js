import fs from 'fs';
import path from 'path';
import os from 'os';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { CVDataPrompt } from '../prompt/studentCVData.js';
import { genAI } from '../config/gemini.js';
import { retryOperation } from '../utils/retry.js';
import { callGenAI } from '../utils/genAIWrapper.js';
import { parseBasicFromText } from '../utils/basicParser.js';
import { uploadBufferToCloudinary } from '../middlewares/multer.js'; // keep your existing util
import { Student } from '../models/student.model.js';
import redisClient from '../config/redis.js';

export const extractStudentDataFromCV = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file || !req.file.buffer)
      return res.status(400).json({ error: 'No CV uploaded' });

    // Upload to Cloudinary but don't fail the whole flow if upload fails
    let cvUrl = null;
    try {
      const originalName = (
        req.file.originalname || `cv-${Date.now()}`
      ).replace(/\s+/g, '-');
      const publicId = `cvs/${userId}-${Date.now()}-${path.basename(
        originalName,
        path.extname(originalName),
      )}`;
      const cloudResult = await uploadBufferToCloudinary(req.file.buffer, {
        resource_type: 'raw',
        public_id: publicId,
        folder: 'cvs',
        overwrite: false,
        chunk_size: 6000000,
      });
      cvUrl = cloudResult?.secure_url || cloudResult?.url || null;
    } catch (cloudErr) {
      console.warn(
        'Cloudinary upload failed, continuing without cloud URL',
        cloudErr && cloudErr.message,
      );
    }

    // write buffer to temp file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
    const ext = path.extname(req.file.originalname) || '.pdf';
    const tmpFilePath = path.join(tmpDir, `${userId}-${Date.now()}${ext}`);
    fs.writeFileSync(tmpFilePath, req.file.buffer);

    // parse pdf text
    let pdfData;
    try {
      const dataBuffer = fs.readFileSync(tmpFilePath);
      pdfData = await pdfParse(dataBuffer);
    } catch (e) {
      // Clean up and return error
      try {
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
      } catch {}
      console.error('PDF parse failed', e);
      return res.status(400).json({ error: 'Invalid PDF or unreadable CV' });
    }

    // Try AI extraction with retry. If it fails, fallback to basic parser.
    let extractedData = null;
    try {
      const prompt = CVDataPrompt(pdfData.text);

      const aiResponse = await retryOperation(() => callGenAI(prompt), {
        retries: 3,
        baseDelay: 800,
      });

      console.log('AI response:', aiResponse);

      // genAI probably returns a string; clean code fences and parse JSON
      const cleaned = String(aiResponse)
        .replace(/```json|```/g, '')
        .trim();
      let parsedJson;
      try {
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        throw new Error('Invalid JSON received from AI');
      }

      // normalize parsedJson to your structure (same as previous code)
      extractedData = {
        personalInfo: {
          fullName: parsedJson.fullName || parsedJson.name || '',
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
    } catch (aiErr) {
      console.warn(
        'AI extraction failed, falling back to basic parser:',
        aiErr && aiErr.message,
      );
      extractedData = parseBasicFromText(pdfData.text);
    } finally {
      // ensure cleanup
      try {
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.warn('Temp cleanup failed:', cleanupErr && cleanupErr.message);
      }
    }

    // Update Student record (use cvUrl if available)
    const updatedStudent = await Student.findByIdAndUpdate(
      userId,
      {
        skills: extractedData?.skills || [],
        education: extractedData?.education || [],
        experience: extractedData?.experience || [],
        projects: extractedData?.projects || [],
        jobPreferences: extractedData?.jobPreferences || {},
        uploadedCV: cvUrl || null,
        ...(cvUrl ? { cvUrl } : {}),
      },
      { new: true, runValidators: true },
    );

    // after you get updatedStudent
    try {
      // Option A: invalidate common student cache patterns
      await redisClient.invalidateStudentCache(userId);
    } catch (cacheErr) {
      console.warn(
        'Failed updating student cache:',
        cacheErr && cacheErr.message,
      );
    }

    return res.json({ success: true, data: updatedStudent });
  } catch (err) {
    console.error('CV extract error:', err && err.message, err);
    if (err.code === 'AI_503' || err.code === 'AI_TIMEOUT') {
      return res.status(503).json({
        error: 'AI service unavailable. Try again later or use fallback.',
      });
    }
    return res.status(500).json({ error: err.message || 'Extraction failed' });
  }
};
