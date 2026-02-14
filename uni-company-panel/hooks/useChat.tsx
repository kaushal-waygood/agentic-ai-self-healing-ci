import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

export const useChat = (conversationId: string, userId: string) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!conversationId || !userId) return;

    // 1️⃣ Connect if not connected
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('join_room', conversationId);
    };

    const handleMessage = (message: any) => {
      console.log('📩 Received:', message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on('connect', handleConnect);
    socket.on('receive_message', handleMessage);

    // If already connected, join immediately
    if (socket.connected) {
      socket.emit('join_room', conversationId);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receive_message', handleMessage);
    };
  }, [conversationId, userId]);

  const sendMessage = (
    text: string,
    attachment?: { fileUrl: string; fileType: string },
  ) => {
    if (!text.trim()) return;

    socket.emit('send_message', {
      conversationId,
      senderId: userId,
      text,
      ...(attachment && { attachment }),
    });
  };

  return { messages, sendMessage };
};
