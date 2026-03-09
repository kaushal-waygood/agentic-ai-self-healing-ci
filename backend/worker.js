// worker.js
import mongoose from 'mongoose';
import connectDb from './src/config/db.js';
import { findAndProcessJobs } from './src/worker/autopilotWorker.js';
import { config } from './src/config/config.js';

const toBool = (v) => v === true || String(v).toLowerCase() === 'true';

const logEnvOnce = () => {
  try {
    const uri = config.mongoUrl;
    const masked = uri.includes('@')
      ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
      : uri;
    console.log(`[DB] Using ${masked || 'MONGO_URI not set'}`);
  } catch {}
};

const startWorker = async () => {
  try {
    await connectDb();
    logEnvOnce();
    console.log('✅ DB Worker connected.');
    console.log('🚀 [Worker] Starting a new job-finding cycle...');
    await findAndProcessJobs();
  } catch (err) {
    console.error('❌ Fatal worker error:', err?.stack || err);
  } finally {
    try {
      await mongoose.connection.close();
      await mongoose.disconnect();
      console.log('🔌 Mongo disconnected.');
    } catch {}

    if (toBool(process.env.WORKER_KEEP_ALIVE || 'false')) {
      console.log('\n✅ Cycle complete. Keeping process alive...');
      setInterval(() => {}, 1 << 30);
    } else {
      console.log('\n✅ Cycle complete. Exiting.');
      process.exit(0);
    }
  }
};

startWorker();
