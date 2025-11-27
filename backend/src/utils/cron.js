import cron from 'node-cron';
import dayjs from 'dayjs';
import { User } from '../models/User.model.js';

export const removeExpiredUnverifiedUsers = () => {
  console.log('🕒 Registering cron: removeExpiredUnverifiedUsers'); // <= runs at startup

  return cron.schedule('*/15 * * * *', async () => {
    const cutoff = dayjs().subtract(15, 'minute').toDate();

    console.log('⛔ Checking for expired unverified users...');

    const result = await User.deleteMany({
      isEmailVerified: false,
      otpExpires: { $lt: cutoff },
    });

    console.log(
      `🧹 Removed ${
        result.deletedCount
      } expired unverified users at ${new Date().toISOString()}`,
    );
  });
};
