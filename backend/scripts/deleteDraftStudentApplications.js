/**
 * Delete legacy StudentApplication docs with status "Draft".
 *
 * Usage:
 *   node scripts/deleteDraftStudentApplications.js           # dry-run
 *   node scripts/deleteDraftStudentApplications.js --delete  # actually delete
 *
 * Or:
 *   npm run delete:draft-student-applications -- --delete
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StudentApplication } from '../src/models/students/studentApplication.model.js';

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

  const filter = { status: 'Draft' };
  const count = await StudentApplication.countDocuments(filter);
  console.log(`🔍 Found ${count} draft StudentApplication record(s).`);

  if (count === 0) {
    console.log('✅ No draft StudentApplication records found.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  if (!doDelete) {
    console.log(`📋 Draft StudentApplication records: ${count}`);
    console.log('   Run with --delete to actually delete them.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  const result = await StudentApplication.deleteMany(filter);
  console.log(
    `✅ Deleted ${result.deletedCount || 0} draft StudentApplication record(s).`,
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
