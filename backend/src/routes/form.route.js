import multer from 'multer';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Router } from 'express';
import { upload } from '../middlewares/multer.js';
import { BugReport } from '../models/BugReport.model.js';
import { Contact } from '../models/Contact.model.js';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/bug-report', upload.array('attachment'), async (req, res) => {
  const files = req.files || [];

  try {
    const { name, email, bugTitle, description, severity } = req.body;

    // basic sanity checks; adjust to your liking
    if (!name || !email || !bugTitle || !description || !severity) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // upload all files (if any) to Cloudinary
    const uploadPromises = files.map((file) => {
      const isImage = file.mimetype?.startsWith('image');
      const isVideo = file.mimetype?.startsWith('video');

      const options = {
        folder: 'bug-reports',
        access_mode: 'public',
        // use raw for everything that’s not image/video
        resource_type: isImage ? 'image' : isVideo ? 'video' : 'raw',
      };

      return cloudinary.uploader.upload(file.path, options);
    });

    const uploadResults = await Promise.all(uploadPromises);

    // ARRAY for MongoDB
    const attachmentUrlArray = uploadResults.map((r) => r.secure_url);

    // STRING (newline-joined) for Google Sheets cell
    const attachmentUrls = attachmentUrlArray.join('\n');

    // save to MongoDB
    const newBugReport = new BugReport({
      name,
      email,
      bugTitle,
      description,
      severity,
      attachments: attachmentUrlArray,
    });
    await newBugReport.save();

    // Google Sheets auth
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth,
    );
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['bug report'];
    if (!sheet) {
      return res.status(404).json({ message: "Sheet 'bug report' not found." });
    }

    // save to sheet
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      Name: name,
      Email: email,
      'Bug Title': bugTitle,
      Severity: severity,
      Description: description,
      Attachments: attachmentUrls, // single cell with newline-separated URLs
    });

    return res
      .status(201)
      .json({ message: 'Bug report submitted successfully!' });
  } catch (error) {
    console.error('Error in bug report API:', error);
    return res.status(500).json({
      message: 'An internal server error occurred.',
      error: error.message,
    });
  } finally {
    // clean up local temp files from multer
    for (const file of files) {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        console.error(`Failed to delete file ${file.path}:`, cleanupError);
      }
    }
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
    });
    await newContact.save();

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth,
    );
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['contact'];

    if (!sheet) {
      return res.status(404).json({ message: "Sheet 'contact' not found." });
    }

    // Save data to the sheet
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      Name: name,
      Email: email,
      Phone: phone,
      Message: message,
    });

    return res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error in contact API:', error);
    return res.status(500).json({
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
});

export default router;
