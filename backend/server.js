// server.js
import cluster from 'cluster';
import os from 'os';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDb from './src/config/db.js';
import { setupNotificationSocket } from './src/socket/notification.socket.js';
// import { startGeneralCronJobs } from './src/config/cron-config.js';
// import { scheduleAutopilotTriggers } from './src/config/autopilotCron.js';
import dotenv from 'dotenv';
import { config } from './src/config/config.js';

dotenv.config({ quiet: true, override: true, path: ['.env'] });
console.log('Environment Mode: ', config.nodeEnv);

const numCPUs = os.cpus().length;

// Create HTTP server and Socket.io instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'https://dev.zobsai.com',
      'https://www.zobsai.com',
      'https://zobsai.com',
      'chrome-extension://mmmbijnmokcdpnabaahhbmioeobobcnb',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  },
});

// Setup notification socket
setupNotificationSocket(io);

// Make io accessible to routes
app.set('io', io);

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
      const PORT = config.port || 8080;

      server.listen(PORT, () => {
        console.log(
          `🚀 Worker ${process.pid} started, server running on port ${PORT}`,
        );
      });
    } catch (error) {
      console.error(`❌ Worker ${process.pid} failed to start:`, error);
      process.exit(1);
    }
  };
  startWorker();
}
