import express from 'express';
import { Conversation } from '../models/Chat.js';
import mongoose from 'mongoose';
import { upload } from '../middlewares/multer.js';
import { cloudinary } from '../config/cloudinary.js';

const router = express.Router();

router.post(
  '/upload-attachment',
  upload.single('attachment'),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' });

      // Since you used diskStorage in your 'upload' instance,
      // we upload the file from the path.
      // If you use memoryStorage, use req.file.buffer with uploadBufferToCloudinary.
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'chat_attachments',
        resource_type: 'auto', // Important: detects if it's an image, pdf, or raw file
      });

      console.log('✅ File uploaded to Cloudinary:', result);

      res.json({
        fileUrl: result.secure_url,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      });
    } catch (error) {
      console.error('❌ Upload to Cloudinary failed:', error);
      res.status(500).json({ message: 'Upload to Cloudinary failed' });
    }
  },
);

router.post('/initialize', async (req, res) => {
  try {
    const { jobId, applicationId, participantIds } = req.body;

    if (!jobId || !applicationId || !participantIds) {
      return res.status(400).json({
        message: 'jobId, applicationId and participantIds are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        message: 'Invalid applicationId format',
      });
    }

    const validParticipants = participantIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (validParticipants.length !== 2) {
      return res.status(400).json({
        message: 'Exactly two valid participant IDs required',
      });
    }

    validParticipants.sort((a, b) => a.toString().localeCompare(b.toString()));

    console.log('🔎 Initialize request:', {
      jobId,
      applicationId,
      participants: validParticipants.map((p) => p.toString()),
    });

    // 🔥 ATOMIC UPSERT (no race condition)
    const chat = await Conversation.findOneAndUpdate(
      {
        jobId,
        applicationId: new mongoose.Types.ObjectId(applicationId),
      },
      {
        $setOnInsert: {
          jobId,
          applicationId: new mongoose.Types.ObjectId(applicationId),
          participants: validParticipants,
          messages: [],
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    console.log('✅ Chat returned:', chat._id);

    return res.status(200).json(chat);
  } catch (error) {
    console.error('❌ Chat Initialization Error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
});

router.get('/history/:conversationId', async (req, res) => {
  try {
    const chat = await Conversation.findById(req.params.conversationId)
      .populate('applicationId')
      .populate({
        path: 'participants',
        select: 'name email profileImage', // This helps you see both people
      });

    console.log('🚀 ~ file: chatRoutes.js:53 ~ router.get ~ chat:', chat);

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

export default router;
