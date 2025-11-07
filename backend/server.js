// server.js (only the relevant parts shown)
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
import app from './src/app.js';
import connectDb from './src/config/db.js';
import { setupNotificationSocket } from './src/socket/notification.socket.js';
import { config as appConfig } from './src/config/config.js';
dotenv.config({ quiet: true, override: true, path: ['.env'] });

const NODE_ENV = process.env.NODE_ENV || appConfig.nodeEnv || 'development';
const isProd = NODE_ENV === 'production';

let server;
let io;
let shuttingDown = false;

// Track all sockets to force-destroy on shutdown
const sockets = new Set();

async function startHttpServer() {
  await connectDb();
  // startWorker();

  server = createServer(app);

  // Track connections
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });

  // Keep-alive can stall shutdown; keep it tight in dev
  server.keepAliveTimeout = 5000; // default 5s is fine; set smaller if needed
  server.headersTimeout = 7000;

  io = new SocketIOServer(server, {
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

  setupNotificationSocket(io);
  app.set('io', io);

  const PORT = Number(process.env.PORT || appConfig.port || 8080);
  const HOST = process.env.HOST || '0.0.0.0';

  await new Promise((resolve, reject) => {
    server.listen(PORT, HOST, (err) => {
      if (err) return reject(err);
      console.log(`🚀 Server ${process.pid} listening on ${HOST}:${PORT}`);
      resolve();
    });
  });

  // One shutdown function, guarded against double-fire
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received. Shutting down gracefully...`);

    // Stop accepting new WS connections and disconnect current clients
    try {
      io?.disconnectSockets(true); // immediately disconnect all clients
      io?.close(); // close the engine
    } catch (e) {
      console.error('Socket.IO close error:', e);
    }

    // Stop accepting new HTTP connections
    server.close((err) => {
      if (err) console.error('HTTP server close error:', err);
      else console.log('HTTP server closed.');

      // Destroy any remaining keep-alive sockets
      for (const s of sockets) {
        try {
          s.destroy();
        } catch {}
      }

      process.exit(0);
    });

    // Safety fuse: if close hangs, nuke sockets and bail
    setTimeout(() => {
      console.warn('Force exiting after 5s...');
      for (const s of sockets) {
        try {
          s.destroy();
        } catch {}
      }
      process.exit(1);
    }, 5000).unref();
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown('uncaughtException');
  });
  process.once('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    shutdown('unhandledRejection');
  });
}

if (isProd && cluster.isPrimary) {
  console.log(`✅ Primary process ${process.pid} is running`);
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) cluster.fork();
  process.on('SIGTERM', () => {
    for (const id in cluster.workers) cluster.workers[id]?.kill();
    process.exit(0);
  });
  cluster.on('exit', () => cluster.fork());
} else {
  startHttpServer().catch((err) => {
    console.error(`❌ Server ${process.pid} failed to start:`, err);
    process.exit(1);
  });
}
