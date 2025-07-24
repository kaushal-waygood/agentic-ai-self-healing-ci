import multer from 'multer';
import path from 'path';

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profileImage') cb(null, 'public/profileImage');
    else if (file.fieldname === 'resume') cb(null, 'public/resume');
    else if (file.fieldname === 'cv') {
      cb(null, 'public/pdf');
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

  const extname = path.extname(file.originalname).toLowerCase().slice(1); // e.g. 'jpg'
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
  } else {
    cb(new Error('Unknown file field'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
