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
  connectDb();

  app.listen(config.port, () => {
    console.log(
      `🚀 Worker ${process.pid} started, server running on port ${config.port}`,
    );
  });
}
