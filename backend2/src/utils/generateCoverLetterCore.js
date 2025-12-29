import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Student } from '../models/student.model.js';
import { User } from '../models/User.model.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { processCoverLetterGeneration } from '../utils/coverletter.background.js';
import {
  extractEmail,
  extractPhone,
  deduceNameFromText,
} from '../utils/coverletter.utils.js';
import { earnCreditsForAction } from '../utils/credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      flag,
    } = req.body;

    // 🔒 Validate user existence (matches CV flow)
    const user = await User.findById(_id).select('_id fullName email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const normalized = {
      resumeText: '',
      profile: {
        fullName: '',
        email: '',
        phone: '',
        education: [],
        experience: [],
        skills: [],
        projects: [],
      },
    };

    const hydrateFromStudent = (student) => {
      normalized.profile.fullName = student.fullName || '';
      normalized.profile.email = student.email || '';
      normalized.profile.phone = student.phone || '';
      normalized.profile.education = student.education || [];
      normalized.profile.experience = student.experience || [];
      normalized.profile.skills = student.skills || [];
      normalized.profile.projects = student.projects || [];

      if (typeof student.resumeText === 'string') {
        normalized.resumeText = student.resumeText;
      } else if (Array.isArray(student.htmlCV) && student.htmlCV.length) {
        normalized.resumeText =
          student.htmlCV[0].html || student.htmlCV[0].content || '';
      }
    };

    /* ----------------------------
       SOURCE RESOLUTION
    ----------------------------- */

    // 1️⃣ Use full profile
    if (useProfile === 'true' || useProfile === true) {
      const student = await Student.findById(_id).lean();
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      hydrateFromStudent(student);

      if (!normalized.profile.email && normalized.resumeText) {
        normalized.profile.email = extractEmail(normalized.resumeText) || '';
      }
      if (!normalized.profile.phone && normalized.resumeText) {
        normalized.profile.phone = extractPhone(normalized.resumeText) || '';
      }
    }

    // 2️⃣ Use saved CV
    else if (savedCVId) {
      if (!mongoose.Types.ObjectId.isValid(savedCVId)) {
        return res.status(400).json({ error: 'Invalid savedCVId' });
      }

      const student = await Student.findById(_id)
        .select('htmlCV fullName email phone')
        .lean();

      if (!student || !Array.isArray(student.htmlCV)) {
        return res.status(404).json({ error: 'Saved CV not found' });
      }

      const saved = student.htmlCV.find(
        (cv) => String(cv._id) === String(savedCVId),
      );

      if (!saved) {
        return res.status(404).json({ error: 'Saved CV not found' });
      }

      const html =
        saved.html ?? saved.content ?? saved.htmlCV ?? saved.body ?? '';

      if (!html.trim()) {
        return res
          .status(422)
          .json({ error: 'Saved CV has no usable content' });
      }

      normalized.resumeText = html;
      normalized.profile.fullName =
        student.fullName || deduceNameFromText(html) || '';
      normalized.profile.email = student.email || extractEmail(html) || '';
      normalized.profile.phone = student.phone || extractPhone(html) || '';
    }

    // 3️⃣ Uploaded file
    else {
      if (!req.file) {
        return res.status(400).json({
          error: 'CV file (PDF, DOCX, or Image) is required',
        });
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
        const type = req.file.mimetype;

        if (type === 'application/pdf') {
          const buf = fs.readFileSync(filePath);
          extractedText = (await pdfParse(buf)).text || '';
        } else if (
          type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          type === 'application/msword'
        ) {
          extractedText =
            (await mammoth.extractRawText({ path: filePath })).value || '';
        } else if (type.startsWith('image/')) {
          extractedText =
            (await Tesseract.recognize(filePath, 'eng')).data.text || '';
        } else {
          return res.status(400).json({ error: 'Unsupported file type' });
        }

        normalized.resumeText = extractedText;
        normalized.profile.email = extractEmail(extractedText) || '';
        normalized.profile.phone = extractPhone(extractedText) || '';
        normalized.profile.fullName = deduceNameFromText(extractedText) || '';
      } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    /* ----------------------------
       JOB CREATION
    ----------------------------- */

    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const jobId = new mongoose.Types.ObjectId();
    const isFirstCL = !Array.isArray(student.cls) || student.cls.length === 0;

    await Student.findByIdAndUpdate(_id, {
      $push: {
        cls: {
          $each: [
            {
              jobId,
              status: 'pending',
              jobContextString,
              finalTouch,
              outputFormat,
              flag,
              createdAt: new Date(),
            },
          ],
          $position: 0,
        },
      },
    });

    if (isFirstCL) {
      earnCreditsForAction(_id, 'FIRST_CL', { jobId: jobId.toString() }).catch(
        (err) => console.error('FIRST_CL credit failed:', err),
      );
    }

    /* ----------------------------
       BACKGROUND FIRE
    ----------------------------- */

    const io = req.app.get('io');
    processCoverLetterGeneration(
      _id,
      jobId,
      JSON.stringify(normalized),
      jobContextString,
      finalTouch,
      io,
      outputFormat,
    ).catch((err) => {
      console.error('Cover letter background job failed to start:', err);
    });

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
