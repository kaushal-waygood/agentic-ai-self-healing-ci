import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary } from '../config/cloudinary.js';
import streamifier from 'streamifier';

/* ------------------------------------------------ */
/* Ensure directories exist                         */
/* ------------------------------------------------ */

const formUploadDir = 'public/form';
const tmpDir = 'public/tmp';
const blogDir = 'public/blog';

if (!fs.existsSync(formUploadDir)) {
  fs.mkdirSync(formUploadDir, { recursive: true });
}

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

/* ------------------------------------------------ */
/* Common field groups                              */
/* ------------------------------------------------ */

const blogImageFields = [
  'bannerImage',
  'thumbnailImage',
  'ogImage',
  'twitterImage',
];

/* ------------------------------------------------ */
/* Storage configuration                            */
/* ------------------------------------------------ */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'profileImage') {
      cb(null, 'public/profileImage');
    } else if (file.fieldname === 'cv') {
      cb(null, 'public/pdf');
    } else if (file.fieldname === 'coverLetter') {
      cb(null, 'public/pdf');
    } else if (file.fieldname === 'attachment') {
      cb(null, formUploadDir);
    } else if (file.fieldname === 'idCard') {
      cb(null, 'public/idCard');
    } else if (file.fieldname === 'org-logo') {
      cb(null, 'public/org-logo');
    } else if (blogImageFields.includes(file.fieldname)) {
      cb(null, blogDir);
    } else {
      cb(null, tmpDir);
    }
  },

  filename(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

/* ------------------------------------------------ */
/* File filter                                      */
/* ------------------------------------------------ */

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profileImage') {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid profile image type'));
    }
  } else if (file.fieldname === 'cv') {
    if (
      [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ].includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid CV file type'));
    }
  } else if (file.fieldname === 'coverLetter') {
    if (
      [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ].includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid cover letter file type'));
    }
  } else if (file.fieldname === 'idCard') {
    if (
      ['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid ID card file type'));
    }
  } else if (file.fieldname === 'attachment') {
    cb(null, true);
  } else if (file.fieldname === 'org-logo') {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid logo file type'));
    }
  } else if (blogImageFields.includes(file.fieldname)) {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid blog image type'));
    }
  } else {
    cb(new Error('Unknown file field'));
  }
};

/* ------------------------------------------------ */
/* CV memory upload                                 */
/* ------------------------------------------------ */

export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname !== 'cv') {
      return cb(new Error('This route expects field "cv"'));
    }

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

/* ------------------------------------------------ */
/* Upload buffer to Cloudinary                      */
/* ------------------------------------------------ */

export function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(
        new Error('uploadBufferToCloudinary called without buffer'),
      );
    }

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

/* ------------------------------------------------ */
/* Standard disk upload                             */
/* ------------------------------------------------ */

export const upload = multer({
  storage,
  fileFilter,
});

/* ------------------------------------------------ */
/* Org logo memory upload                           */
/* ------------------------------------------------ */

export const orgLogoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    if (file.fieldname !== 'org-logo') {
      return cb(new Error('Expected field "org-logo"'));
    }

    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid logo file type'));
    }
  },
});
