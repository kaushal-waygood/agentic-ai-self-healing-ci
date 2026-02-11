import { Conversation } from '../models/Chat.js';

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a specific conversation room
    socket.on('join_room', (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined room: ${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      const { conversationId, senderId, text } = data;

      console.log('Received message:', data);

      try {
        const message = { senderId, text, createdAt: new Date() };

        // 1. Save to Database
        const updatedChat = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            $push: { messages: message },
            $set: { lastMessage: text, updatedAt: new Date() },
          },
          { new: true },
        );

        // 2. Emit to everyone in the room (including sender for sync)
        io.to(conversationId).emit('receive_message', message);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
