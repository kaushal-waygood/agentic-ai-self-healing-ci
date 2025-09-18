import multer from 'multer';
import path from 'path';
import fs from 'fs'; // NEW: Import the 'fs' module

// NEW: Define paths and ensure directories exist
const formUploadDir = 'public/form';
if (!fs.existsSync(formUploadDir)) {
  fs.mkdirSync(formUploadDir, { recursive: true });
}
// You can add similar checks for your other directories if needed
// if (!fs.existsSync('public/profileImage')) { ... }
// if (!fs.existsSync('public/resume')) { ... }

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profileImage') cb(null, 'public/profileImage');
    else if (file.fieldname === 'resume') cb(null, 'public/resume');
    else if (file.fieldname === 'cv') cb(null, 'public/pdf');
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

// File filter
const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png/;
  const pdfType = /pdf/;

  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  if (file.fieldname === 'profileImage') {
    if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only image files (jpg, jpeg, png) are allowed for profile image',
        ),
      );
    }
  } else if (file.fieldname === 'resume' || file.fieldname === 'cv') {
    if (pdfType.test(extname) && mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resume'));
    }
  } else if (file.fieldname === 'attachment') {
    // MODIFIED: Added this block to handle the 'attachment' field
    cb(null, true); // Allow any file type for bug report attachments
  } else {
    cb(new Error('Unknown file field'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
