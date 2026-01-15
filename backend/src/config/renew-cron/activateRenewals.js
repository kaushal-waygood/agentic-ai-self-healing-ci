import { Purchase } from '../../models/Purchase.js';
import mongoose from 'mongoose';
import { User } from '../../models/User.model.js';

export async function activateRenewalsCron() {
  const now = new Date();
  console.log('[ACTIVATE] running at', now.toISOString());

  const renewalsToActivate = await Purchase.find({
    purchaseType: 'renewal',
    isActive: false,
    startDate: { $lte: now },
  });

  for (const renewal of renewalsToActivate) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(renewal.user).session(session);
      if (!user) throw new Error('User not found');

      if (user.role !== 'student') {
        console.log(
          `[ACTIVATE] skipped renewal ${renewal._id} – user is not student`,
        );

        await session.abortTransaction();
        session.endSession();
        continue; // 🔥 skip activation
      }

      // 3️⃣ Deactivate previous active purchase
      await Purchase.updateMany(
        {
          user: renewal.user,
          isActive: true,
        },
        { $set: { isActive: false } },
        { session },
      );

      // 4️⃣ Activate renewal
      renewal.isActive = true;
      await renewal.save({ session });

      // 5️⃣ Update user plan pointers
      user.currentPlan = renewal.plan;
      user.currentPurchase = renewal._id;
      await user.save({ session });

      // 6️⃣ Commit
      await session.commitTransaction();
      session.endSession();

      console.log(
        `[ACTIVATE] student renewal activated for user ${renewal.user}`,
      );
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.error(
        `[ACTIVATE] failed for renewal ${renewal._id}:`,
        err.message,
      );
    }
  }
}
