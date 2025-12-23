import { Student } from '../models/students/student.model.js'; // Ensure correct path
import { checkProfileCompletion } from '../utils/profileCompletion.js';

export const requireCompleteProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // We only need basic details here because checkProfileCompletion queries the rest
    const student = await Student.findById(userId)
      .select('fullName email jobRole location')
      .lean();

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // FIX: Add 'await' here
    const { complete, reasons } = await checkProfileCompletion(student);

    console.log('Middleware Check:', { complete, reasons });

    if (!complete) {
      return res.status(403).json({
        message: 'Profile incomplete',
        reasons,
      });
    }

    next();
  } catch (error) {
    console.error('Profile completion middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
