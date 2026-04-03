import cron from 'node-cron';
import dayjs from 'dayjs';
import { User } from '../models/User.model.js';
import { runWithCronTelemetry } from './cronMonitor.js';

export const removeExpiredUnverifiedUsers = () => {
  console.log('🕒 Registering cron: removeExpiredUnverifiedUsers');

  return cron.schedule('*/15 * * * *', () =>
    runWithCronTelemetry('RemoveExpiredUnverifiedUsers', async () => {
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
    }),
  );
};

export const clearExpiredEmailChangeRequests = () => {
  console.log('🕒 Registering cron: clearExpiredEmailChangeRequests');

  return cron.schedule('*/10 * * * *', () =>
    runWithCronTelemetry('ClearExpiredEmailChangeRequests', async () => {
      const result = await User.updateMany(
        {
          tempEmail: { $exists: true, $ne: null },
          otpExpires: { $lt: new Date() },
        },
        { $unset: { tempEmail: '', otp: '', otpExpires: '' } },
      );

      if (result.modifiedCount > 0) {
        console.log(
          `🧹 Cleared ${result.modifiedCount} expired email change request(s) at ${new Date().toISOString()}`,
        );
      }
    }),
  );
};
