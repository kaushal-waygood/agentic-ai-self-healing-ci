/**
 * Delete all pending StudentTailoredApplication docs from the database.
 * Run from backend root: node scripts/deletePendingTailorDocs.js
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

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);

  const result = await StudentTailoredApplication.deleteMany({ status: 'pending' });

  console.log(`✅ Deleted ${result.deletedCount} pending tailor doc(s)`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
