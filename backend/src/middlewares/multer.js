import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

export const upload = multer({
  storage,
  fileFilter,
});
