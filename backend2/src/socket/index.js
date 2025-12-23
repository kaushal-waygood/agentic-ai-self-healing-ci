import { Server } from 'socket.io';
import { setupNotificationSocket } from './notification.socket.js';

let io; // This will hold our io instance

export function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN, // Your frontend URL
      methods: ['GET', 'POST'],
    },
  });

  // Setup your different namespaces
  setupNotificationSocket(io);
  // setupChatSocket(io); // You can add more namespaces here

  console.log('Socket.IO server initialized');
  return io;
}

// Export a function to get the io instance
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
}
