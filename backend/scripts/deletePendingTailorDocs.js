/**
 * Delete all pending docs from StudentTailoredApplication, StudentCV, and StudentCL.
 *
 * Usage:
 *   node scripts/deletePendingTailorDocs.js           # dry-run (preview only)
 *   node scripts/deletePendingTailorDocs.js --delete  # actually delete
 *
 * Or: npm run delete:pending-tailor-docs [-- --delete]
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StudentTailoredApplication } from '../src/models/students/studentTailoredApplication.model.js';
import { StudentCV } from '../src/models/students/studentCV.model.js';
import { StudentCL } from '../src/models/students/studentCL.model.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('❌ MONGO_URL is required. Set it in .env');
  process.exit(1);
}

const doDelete = process.argv.includes('--delete');

const models = [
  { name: 'StudentTailoredApplication', model: StudentTailoredApplication },
  { name: 'StudentCV', model: StudentCV },
  { name: 'StudentCL', model: StudentCL },
];

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);

  let totalCount = 0;
  const counts = {};

  for (const { name, model } of models) {
    const count = await model.countDocuments({ status: 'pending' });
    counts[name] = count;
    totalCount += count;
  }

  if (totalCount === 0) {
    console.log('✅ No pending docs found in any collection.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  if (doDelete) {
    for (const { name, model } of models) {
      const result = await model.deleteMany({ status: 'pending' });
      if (result.deletedCount > 0) {
        console.log(`✅ ${name}: deleted ${result.deletedCount} pending doc(s)`);
      }
    }
  } else {
    console.log('📋 Pending docs to delete:');
    for (const { name } of models) {
      if (counts[name] > 0) console.log(`   ${name}: ${counts[name]}`);
    }
    console.log(`   Total: ${totalCount}`);
    console.log('   Run with --delete to actually delete them.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
