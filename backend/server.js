// server.js

import cluster from 'cluster';
import os from 'os';
import app from './src/app.js';
import connectDb from './src/config/db.js';
// import { startGeneralCronJobs } from './src/config/cron-config.js';
// import { scheduleAutopilotTriggers } from './src/config/autopilotCron.js';
import dotenv from 'dotenv';

dotenv.config();
console.log('Environment Mode: ', process.env.NODE_ENV);

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`✅ Primary process ${process.pid} is running`);

  const shutdown = () => {
    console.log('🔌 Primary process shutting down. Closing all workers.');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // scheduleAutopilotTriggers();
  // startGeneralCronJobs();

  // Fork a worker for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.error(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const startWorker = async () => {
    try {
      await connectDb();
      const PORT = process.env.PORT || 8080;
      app.listen(PORT, () => {
        console.log(
          `🚀 Worker ${process.pid} started, server running on port ${PORT}`,
        );
      });
    } catch (error) {
      console.error(`❌ Worker ${process.pid} failed to start.`);
      process.exit(1);
    }
  };
  startWorker();
}
