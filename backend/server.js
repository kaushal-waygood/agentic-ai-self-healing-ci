import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import app from './src/app.js';
import connectDb from './src/config/db.js';
import { setupNotificationSocket } from './src/socket/notification.socket.js';
import { socketHandler } from './src/socket/socketHandler.js'; // <--- IMPORT ADDED
import { config as appConfig } from './src/config/config.js';
import { generateEmbedding } from './src/config/embedding.js';
import { startTailoredApplicationWorker } from './src/workers/tailoredApplication.worker.js';

dotenv.config();

async function startHttpServer() {
  await connectDb();

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

  // INITIALIZE SOCKETS
  setupNotificationSocket(io);
  socketHandler(io); // <--- INITIALIZATION ADDED

  // Make io accessible in controllers via req.app.get('io')
  app.set('io', io);
  startTailoredApplicationWorker({ io });

  const PORT = process.env.PORT || appConfig.port || 8080;
  server.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Server running on port ${PORT}`),
  );

  // Graceful Shutdown
  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down.`);
    io.close();
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startHttpServer()
  .then(() => {
    generateEmbedding('Init').catch(() => {});
  })
  .catch((err) => {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  });
