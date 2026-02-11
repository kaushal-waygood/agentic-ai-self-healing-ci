// src/lib/socket.ts
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://127.0.0.1:8080';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
});
