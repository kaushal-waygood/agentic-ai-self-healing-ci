/**
 * Delete pending StudentTailoredApplication docs only.
 *
 * Usage:
 *   node scripts/deletePendingTailoredApplications.js           # dry-run
 *   node scripts/deletePendingTailoredApplications.js --delete  # actually delete
 *
 * Or:
 *   npm run delete:pending-tailored-applications -- --delete
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StudentTailoredApplication } from '../src/models/students/studentTailoredApplication.model.js';

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

  const filter = { status: 'pending' };
  const count = await StudentTailoredApplication.countDocuments(filter);
  console.log(`🔍 Found ${count} pending tailored application(s).`);

  if (count === 0) {
    console.log('✅ No pending tailored applications found.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  if (!doDelete) {
    console.log(`📋 Pending tailored applications: ${count}`);
    console.log('   Run with --delete to actually delete them.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  const result = await StudentTailoredApplication.deleteMany(filter);
  console.log(
    `✅ Deleted ${result.deletedCount || 0} pending tailored application(s).`,
  );

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ Error:', err.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
