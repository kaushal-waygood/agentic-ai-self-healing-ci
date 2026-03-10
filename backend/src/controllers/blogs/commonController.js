import { upload } from '../middlewares/multer.js';

/**
 * Upload a file to the configured storage destination.
 * Usage: POST /upload/:type
 *   type = '1' → universities folder
 *   type = '2' → blogs folder
 *   type = other → tmp folder
 */
export const uploadFile = (req, res, next) => {
  try {
    const { type } = req.params;

    if (!type) {
      return res.status(400).json({
        message: 'Insufficient request parameters! type is required.',
      });
    }

    // The multer `upload` middleware already handles routing to the correct
    // public sub-folder based on the fieldname. We just run it here.
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Error during upload:', err.message);
        return res.status(400).json({ message: err.message });
      }

      if (req.file) {
        return res.status(200).json({
          message: 'File uploaded successfully.',
          data: {
            filename: req.file.filename,
            path: req.file.path,
          },
        });
      }

      if (req.files && req.files.length > 0) {
        const filesData = req.files.map((file) => ({
          filename: file.filename,
          path: file.path,
        }));
        return res.status(200).json({
          message: 'Files uploaded successfully.',
          data: { files: filesData },
        });
      }

      return res.status(400).json({ message: 'No files were uploaded.' });
    });
  } catch (error) {
    console.error('Error in uploadFile function:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
