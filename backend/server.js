// server.js
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import app from './src/app.js';
import connectDb from './src/config/db.js';
import { setupNotificationSocket } from './src/socket/notification.socket.js';
import { config as appConfig } from './src/config/config.js';
import {
  startWorkerSupervisor,
  stopWorkerSupervisor,
} from './src/utils/workerSupervisor.js';

dotenv.config();

const toBool = (v) => v === true || String(v).toLowerCase() === 'true';

async function startHttpServer() {
  await connectDb();

  // Start worker supervisor after DB connects, only if explicitly enabled
  // if (toBool(process.env.WORKER_SUPERVISOR_ENABLED || 'false')) {
  //   startWorkerSupervisor().catch((err) => {
  //     console.error('[WorkerSupervisor] Failed to start:', err);
  //   });
  // } else {
  //   console.log(
  //     '[WorkerSupervisor] Disabled (WORKER_SUPERVISOR_ENABLED=false).',
  //   );
  // }

  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        'https://luminous-sherise-unobtrusively.ngrok-free.dev',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:3002',
        'http://localhost:3002',
        'https://zobsai.com',
        'https://dev.zobsai.com',
      ],
      credentials: true,
    },
  });
  setupNotificationSocket(io);
  app.set('io', io);

  const PORT = process.env.PORT || appConfig.port || 8080;
  server.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Server running on port ${PORT}`),
  );

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down.`);
    // try {
    //   await stopWorkerSupervisor();
    // } catch (e) {
    //   console.error('[WorkerSupervisor] stop failed:', e?.message || e);
    // }
    io.close();
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startHttpServer().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
