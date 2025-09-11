import { verifyToken } from '../utils/auth.js';
import prisma from '../utils/db.js';

// Store user socket mappings
const userSockets = new Map(); // userId -> Set of socketIds
const socketUsers = new Map(); // socketId -> userId

export const initializeSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          lastSeen: true
        }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected with socket ${socket.id}`);
    
    const userId = socket.userId;
    
    // Store socket mapping
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socketUsers.set(socket.id, userId);

    // Update user's last seen
    prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() }
    }).catch(console.error);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Notify contacts that user is online
    notifyContactsUserOnline(io, userId);

    // Handle message sending
    socket.on('message:send', async (data) => {
      try {
        const { threadId, content } = data;
        
        if (!threadId || !content) {
          socket.emit('error', { message: 'Thread ID and content are required' });
          return;
        }

        // Verify user has access to thread
        const thread = await prisma.thread.findFirst({
          where: {
            id: parseInt(threadId),
            OR: [
              { userAId: userId },
              { userBId: userId }
            ]
          },
          include: {
            userA: { select: { id: true, name: true } },
            userB: { select: { id: true, name: true } }
          }
        });

        if (!thread) {
          socket.emit('error', { message: 'Thread not found' });
          return;
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            threadId: parseInt(threadId),
            senderId: userId,
            content: content.trim(),
            type: 'text',
            status: 'sent'
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        });

        // Update thread's last message
        await prisma.thread.update({
          where: { id: parseInt(threadId) },
          data: {
            lastMessageId: message.id,
            updatedAt: new Date()
          }
        });

        // Get the other participant
        const otherUserId = thread.userAId === userId ? thread.userBId : thread.userAId;
        
        // Emit to both participants
        io.to(`user:${userId}`).emit('message:received', { message, threadId });
        io.to(`user:${otherUserId}`).emit('message:received', { message, threadId });

        // Update message status to delivered for the recipient
        setTimeout(async () => {
          await prisma.message.update({
            where: { id: message.id },
            data: { status: 'delivered' }
          });
        }, 1000);

      } catch (error) {
        console.error('Message send error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('message:read', async (data) => {
      try {
        const { threadId, messageId } = data;
        
        if (!threadId || !messageId) {
          socket.emit('error', { message: 'Thread ID and message ID are required' });
          return;
        }

        // Verify user has access to thread
        const thread = await prisma.thread.findFirst({
          where: {
            id: parseInt(threadId),
            OR: [
              { userAId: userId },
              { userBId: userId }
            ]
          }
        });

        if (!thread) {
          socket.emit('error', { message: 'Thread not found' });
          return;
        }

        // Update message status
        const updatedMessage = await prisma.message.updateMany({
          where: {
            id: parseInt(messageId),
            threadId: parseInt(threadId),
            senderId: { not: userId } // Can't mark own messages as read
          },
          data: { status: 'read' }
        });

        if (updatedMessage.count > 0) {
          // Notify sender that message was read
          const message = await prisma.message.findUnique({
            where: { id: parseInt(messageId) },
            select: { senderId: true }
          });

          if (message) {
            io.to(`user:${message.senderId}`).emit('message:read', { 
              messageId: parseInt(messageId), 
              threadId: parseInt(threadId),
              readBy: userId
            });
          }
        }

      } catch (error) {
        console.error('Message read error:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing', async (data) => {
      try {
        const { threadId, isTyping } = data;
        
        if (!threadId) {
          return;
        }

        // Verify user has access to thread
        const thread = await prisma.thread.findFirst({
          where: {
            id: parseInt(threadId),
            OR: [
              { userAId: userId },
              { userBId: userId }
            ]
          }
        });

        if (!thread) {
          return;
        }

        // Get the other participant
        const otherUserId = thread.userAId === userId ? thread.userBId : thread.userAId;
        
        // Forward typing indicator to the other participant
        io.to(`user:${otherUserId}`).emit('typing', {
          threadId: parseInt(threadId),
          userId,
          isTyping,
          user: socket.user
        });

      } catch (error) {
        console.error('Typing error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
      
      // Remove socket mapping
      const userSocketSet = userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
          // Notify contacts that user is offline
          notifyContactsUserOffline(io, userId);
        }
      }
      socketUsers.delete(socket.id);
    });
  });
};

// Helper function to notify contacts that user is online
const notifyContactsUserOnline = async (io, userId) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { ownerId: userId },
      select: { contactId: true }
    });

    for (const contact of contacts) {
      io.to(`user:${contact.contactId}`).emit('user:online', { userId });
    }
  } catch (error) {
    console.error('Notify contacts online error:', error);
  }
};

// Helper function to notify contacts that user is offline
const notifyContactsUserOffline = async (io, userId) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { ownerId: userId },
      select: { contactId: true }
    });

    for (const contact of contacts) {
      io.to(`user:${contact.contactId}`).emit('user:offline', { userId });
    }
  } catch (error) {
    console.error('Notify contacts offline error:', error);
  }
};
