// server.js (AFTER - RECOMMENDED)

import cluster from 'cluster';
import os from 'os';
import app from './src/app.js';
import dotenv from 'dotenv';
import connectDb from './src/config/db.js';
import { config } from './src/config/config.js';

// ✅ Load environment variables ONCE. All forked workers will inherit them.
dotenv.config();

const numCPUs = os.cpus().length;

console.log(
  process.env.NODE_ENV,
  process.env.MONGO_URL,
  process.env.PORT,
  process.env.REDIS_HOST,
  process.env.REDIS_PORT,
  process.env.RAPID_API_KEY,
  process.env.GOOGLE_API_KEY,
  process.env.STRIPE_SECRET_KEY,
  process.env.STRIPE_WEBHOOK_SECRET,
  process.env.FIREBASE_PROJECT_ID,
  process.env.FIREBASE_PRIVATE_KEY,
  process.env.FIREBASE_CLIENT_EMAIL,
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL,
  process.env.GOOGLE_REFRESH_TOKEN,
  process.env.EMAIL_HOST,
  process.env.EMAIL_PORT,
  process.env.EMAIL_USERNAME,
  process.env.EMAIL_PASSWORD,
  process.env.EMAIL_FROM,
);

if (cluster.isPrimary) {
  console.log(
    `✅ Primary ${process.pid} is running in ${process.env.NODE_ENV} mode`,
  );
  console.log(`Forking server for ${numCPUs} CPUs`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // This is a worker process, it already has process.env from the primary.
  connectDb();

  app.listen(config.port, () => {
    console.log(
      `🚀 Worker ${process.pid} started, server running on port ${config.port}`,
    );
  });
}
