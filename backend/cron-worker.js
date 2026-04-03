import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDb from './src/config/db.js';
import { startScheduledJobs } from './src/config/startScheduledJobs.js';

dotenv.config();

async function startCronWorker() {
  try {
    await connectDb();
    console.log('✅ Cron worker connected to MongoDB.');

    startScheduledJobs();
    console.log('🚀 Cron worker started scheduled jobs.');

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down cron worker.`);
      try {
        await mongoose.connection.close();
        await mongoose.disconnect();
      } catch {}
      process.exit(0);
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Cron worker failed to start:', error);
    process.exit(1);
  }
}

startCronWorker();

