import { body, validationResult } from 'express-validator';
import prisma from '../utils/db.js';

export const sendMessageValidation = [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be 1-1000 characters')
];

export const getMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { limit = 50, before } = req.query;
    const threadIdInt = parseInt(threadId);

    if (isNaN(threadIdInt)) {
      return res.status(400).json({ error: 'Invalid thread ID' });
    }

    // Check if user has access to this thread
    const thread = await prisma.thread.findFirst({
      where: {
        id: threadIdInt,
        OR: [
          { userAId: req.user.id },
          { userBId: req.user.id }
        ]
      }
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Build query conditions
    const where = { threadId: threadIdInt };
    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate.getTime())) {
        where.createdAt = { lt: beforeDate };
      }
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({ messages: messages.reverse() }); // Reverse to get chronological order
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { threadId } = req.params;
    const { content } = req.body;
    const file = req.file;
    const threadIdInt = parseInt(threadId);

    if (isNaN(threadIdInt)) {
      return res.status(400).json({ error: 'Invalid thread ID' });
    }

    // Check if user has access to this thread
    const thread = await prisma.thread.findFirst({
      where: {
        id: threadIdInt,
        OR: [
          { userAId: req.user.id },
          { userBId: req.user.id }
        ]
      }
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Prepare message data
    const messageData = {
      threadId: threadIdInt,
      senderId: req.user.id,
      content: content || '',
      status: 'sent'
    };

    // Handle file upload
    if (file) {
      messageData.type = 'media';
      messageData.mediaUrl = `/uploads/${file.filename}`;
      messageData.mediaType = file.mimetype;
      messageData.fileName = file.originalname;
    } else {
      messageData.type = 'text';
    }

    // Create message
    const message = await prisma.message.create({
      data: messageData,
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

    // Update thread's last message and updatedAt
    await prisma.thread.update({
      where: { id: threadIdInt },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date()
      }
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { threadId, messageId } = req.params;
    const threadIdInt = parseInt(threadId);
    const messageIdInt = parseInt(messageId);

    if (isNaN(threadIdInt) || isNaN(messageIdInt)) {
      return res.status(400).json({ error: 'Invalid thread or message ID' });
    }

    // Check if user has access to this thread
    const thread = await prisma.thread.findFirst({
      where: {
        id: threadIdInt,
        OR: [
          { userAId: req.user.id },
          { userBId: req.user.id }
        ]
      }
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Update message status
    const message = await prisma.message.updateMany({
      where: {
        id: messageIdInt,
        threadId: threadIdInt,
        senderId: { not: req.user.id } // Can't mark own messages as read
      },
      data: { status: 'read' }
    });

    if (message.count === 0) {
      return res.status(404).json({ error: 'Message not found or already read' });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
