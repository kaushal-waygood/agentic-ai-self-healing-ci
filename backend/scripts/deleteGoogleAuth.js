/**
 * Remove googleAuth field from all User documents.
 * Does NOT delete users or any other data - only unsets the googleAuth field.
 *
 * Usage:
 *   node scripts/deleteGoogleAuth.js           # dry-run (preview only)
 *   node scripts/deleteGoogleAuth.js --delete  # actually unset googleAuth
 *
 * Or: npm run delete:google-auth [-- --delete]
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.model.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('❌ MONGO_URL is required. Set it in .env');
  process.exit(1);
}

const doDelete = process.argv.includes('--delete');

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);

  const count = await User.countDocuments({ googleAuth: { $exists: true, $ne: null } });

  if (count === 0) {
    console.log('✅ No users with googleAuth found.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  if (doDelete) {
    const result = await User.updateMany(
      { googleAuth: { $exists: true } },
      { $unset: { googleAuth: '' } },
    );
    console.log(`✅ Removed googleAuth from ${result.modifiedCount} user(s)`);
  } else {
    console.log(`📋 Found ${count} user(s) with googleAuth`);
    console.log('   Run with --delete to actually remove it.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
