import { Student } from '../models/student.model.js';
import { checkProfileCompletion } from '../utils/profileCompletion.js';

export const requireCompleteProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const student = await Student.findById(userId)
      .select(
        'fullName email jobRole location skills education experience projects hasCompletedOnboarding',
      )
      .lean();

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { complete, reasons } = checkProfileCompletion(student);

    console.log(complete, reasons);

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
