// hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken } from './useToken';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      try {
        // Get token from your auth system
        const token = getToken();

        if (!token) {
          console.error('❌ useSocket: No authentication token found');
          if (isMounted)
            setConnectionError('No authentication token found in storage');
          return;
        }

        // Use the correct URL format
        const baseURL = 'http://localhost:8080';

        // Create socket connection
        socketRef.current = io(baseURL, {
          auth: {
            token: token,
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        // Connection events
        socketRef.current.on('connect', () => {
          if (isMounted) {
            setIsConnected(true);
            setConnectionError(null);
          }
        });

        socketRef.current.on('disconnect', (reason) => {
          if (isMounted) {
            setIsConnected(false);
            setConnectionError(`Disconnected: ${reason}`);
          }
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('❌ useSocket: Connection error:', error.message);
          console.error('❌ Error details:', error);
          if (isMounted) {
            setIsConnected(false);
            setConnectionError(`Connection failed: ${error.message}`);
          }
        });

        socketRef.current.on('reconnect_attempt', (attempt) => {
          console.log(`🔄 useSocket: Reconnection attempt ${attempt}`);
        });

        socketRef.current.on('reconnect_failed', () => {
          console.error('❌ useSocket: All reconnection attempts failed');
          if (isMounted) setConnectionError('Reconnection failed');
        });
      } catch (error) {
        console.error('❌ useSocket: Setup error:', error);
        if (isMounted) setConnectionError(`Setup error: ${error.message}`);
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        console.log('🧹 useSocket: Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
  };
};
