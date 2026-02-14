import { Conversation } from '../models/Chat.js';

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('⚡ Connected:', socket.id);

    socket.on('join_room', (conversationId) => {
      if (!conversationId) return;

      socket.join(conversationId);

      console.log('👥 Joined room:', conversationId);
      console.log('Rooms:', socket.rooms);
    });

    socket.on('receive_message', (data) => {
      console.log('📥 Received message:', data);
    });

    socket.on('send_message', async (data) => {
      try {
        // 1. Destructure the NEW fields from the data payload
        const { conversationId, senderId, text, fileUrl, fileType } = data;

        if (!conversationId || !senderId) return;

        // 2. Build the message object including Cloudinary info
        const newMessage = {
          senderId,
          text: text || '',
          fileUrl: fileUrl || null, // <--- THIS IS KEY
          fileType: fileType || null, // <--- THIS IS KEY
          createdAt: new Date(),
        };

        // 3. Save to MongoDB
        await Conversation.findByIdAndUpdate(conversationId, {
          $push: { messages: newMessage },
          $set: { lastMessage: fileUrl ? '📎 File Attachment' : text },
        });

        // 4. Emit back to everyone in the room
        io.to(conversationId).emit('receive_message', newMessage);
      } catch (err) {
        console.error('❌ Socket Error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected:', socket.id);
    });
  });
};
