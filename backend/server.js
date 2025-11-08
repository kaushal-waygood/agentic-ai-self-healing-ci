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

async function startHttpServer() {
  await connectDb();

  // Start worker supervisor after DB connects
  startWorkerSupervisor().catch((err) => {
    console.error('[WorkerSupervisor] Failed to start:', err);
  });

  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: ['http://localhost:3000', 'https://zobsai.com'],
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
    await stopWorkerSupervisor();
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
