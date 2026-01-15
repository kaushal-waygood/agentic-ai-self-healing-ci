import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary } from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Define paths and ensure directories exist
const formUploadDir = 'public/form';
if (!fs.existsSync(formUploadDir)) {
  fs.mkdirSync(formUploadDir, { recursive: true });
}

// Storage config remains the same
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profileImage') cb(null, 'public/profileImage');
    else if (file.fieldname === 'resume') cb(null, 'public/resume');
    else if (file.fieldname === 'cv')
      cb(null, 'public/pdf'); // All CV types will go here
    else if (file.fieldname === 'attachment') {
      cb(null, formUploadDir);
    } else if (file.fieldname === 'idCard') {
      cb(null, 'public/idCard');
    } else {
      cb(new Error('Invalid field name for file upload'));
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// MODIFIED: Updated File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profileImage') {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .jpeg, & .png are allowed for profile image'));
    }
  } else if (file.fieldname === 'cv') {
    // Allow PDF, DOCX, and common image formats
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
      file.mimetype === 'application/msword' || // .doc
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'application/docs' ||
      file.mimetype === 'application/docx' ||
      file.mimetype === 'application/doc'
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only PDF, DOCX, and image files are allowed for CVs.',
        ),
      );
    }
  } else if (file.fieldname === 'attachment') {
    cb(null, true); // Allow any file type for attachments
  } else {
    cb(new Error('Unknown file field'));
  }
};

export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname !== 'cv')
      return cb(new Error('This route expects field "cv"'));
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'application/octet-stream',
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid CV file type'));
  },
});

// Upload buffer -> Cloudinary (resource_type: 'auto' so pdf/doc ok)
export function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

async function downloadUrlToTempFile(url) {
  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-'));
  // try to preserve extension
  let ext = path.extname(new URL(url).pathname) || '.pdf';
  if (!ext) ext = '.pdf';
  const tmpPath = path.join(tmpDir, `upload${ext}`);
  fs.writeFileSync(tmpPath, Buffer.from(resp.data));
  return tmpPath;
}

export const upload = multer({
  storage,
  fileFilter,
});
