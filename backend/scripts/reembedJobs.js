/**
 * Migration script: Re-embed all jobs with BGESmallENV15 (384 dims).
 * Run after switching from BGEBaseEN (768 dims) to reduce memory ~3x.
 *
 * Prerequisites:
 * 1. Update MongoDB Atlas vector index to 384 dimensions:
 *    - Atlas UI: Database → Browse Collections → jobs → Indexes
 *    - Create/update vector index on job_embedding with dimensions: 384
 *    - Index name: vector_index (or update jobHelpers.js/job.controller.js if different)
 *
 * 2. Run: node scripts/reembedJobs.js (from backend directory)
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import mongoose from 'mongoose';
import { Job } from '../src/models/jobs.model.js';
import { generateEmbedding } from '../src/config/embedding.js';

const BATCH_SIZE = 20;
const DELAY_MS = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function reembedJobs() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('❌ MONGO_URL required. Set it in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  console.log('✅ Connected to MongoDB');

  const total = await Job.countDocuments({ isActive: true });
  console.log(`📊 Found ${total} active jobs to re-embed`);

  let processed = 0;
  let failed = 0;
  const cursor = Job.find({ isActive: true })
    .select('_id jobId title description company')
    .lean()
    .cursor();

  for await (const job of cursor) {
    const textToEmbed = `Title: ${job.title} Description: ${job.description || ''} Company: ${job.company || ''}`.trim();
    const embedding = await generateEmbedding(textToEmbed);

    if (!embedding || !Array.isArray(embedding)) {
      console.warn(`⚠️  No embedding for job ${job.jobId} (${job.title?.slice(0, 40)}...)`);
      failed++;
      continue;
    }

    await Job.updateOne(
      { _id: job._id },
      {
        $set: {
          job_embedding: embedding,
          needsEmbedding: false,
        },
      },
    );

    processed++;
    if (processed % 50 === 0) {
      console.log(`   Progress: ${processed}/${total} (${failed} failed)`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n✅ Re-embedding complete. Processed: ${processed}, Failed: ${failed}`);
  await mongoose.disconnect();
  process.exit(0);
}

reembedJobs().catch((err) => {
  console.error('❌ Re-embed failed:', err);
  process.exit(1);
});
