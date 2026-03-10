const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  '.webp',
  '.mp4',
  '.avi',
  '.mkv',
];

// Custom Multer storage engine for Cloudinary
const cloudinaryStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName,
      resource_type: 'auto', // auto-detect image/video/raw
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'mp4', 'avi', 'mkv'],
      public_id: (req, file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const randomString = Math.random().toString(36).substring(2, 7);
        return `${Date.now()}-${randomString}${ext}`;
      },
    },
  });
};

// Middleware to handle file uploads to Cloudinary
const imageUpload = (folderName) =>
  multer({
    storage: cloudinaryStorage(folderName),
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      if (allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            'Invalid file type. Only webp, JPG, JPEG, PNG, PDF, MP4, AVI, and MKV are allowed.'
          )
        );
      }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit the file size to 2 MB
  }).array('files'); // Handle multiple file uploads

module.exports = { imageUpload };
