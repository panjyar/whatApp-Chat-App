import { body, validationResult } from 'express-validator';
import prisma from '../utils/db.js';

export const createThreadValidation = [
  body('participantId').isInt({ min: 1 }).withMessage('Valid participant ID required')
];

export const getThreads = async (req, res) => {
  try {
    const threads = await prisma.thread.findMany({
      where: {
        OR: [
          { userAId: req.user.id },
          { userBId: req.user.id }
        ]
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            lastSeen: true
          }
        },
        userB: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            lastSeen: true
          }
        },
        lastMessage: {
          select: {
            id: true,
            content: true,
            type: true,
            status: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                status: { not: 'read' },
                senderId: { not: req.user.id }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format threads to include the other participant and unread count
    const formattedThreads = threads.map(thread => {
      const otherUser = thread.userAId === req.user.id ? thread.userB : thread.userA;
      return {
        id: thread.id,
        otherUser,
        lastMessage: thread.lastMessage,
        unreadCount: thread._count.messages,
        updatedAt: thread.updatedAt,
        createdAt: thread.createdAt
      };
    });

    res.json({ threads: formattedThreads });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createThread = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participantId } = req.body;
    const participantIdInt = parseInt(participantId);

    if (isNaN(participantIdInt)) {
      return res.status(400).json({ error: 'Invalid participant ID' });
    }

    // Check if user is trying to create thread with themselves
    if (participantIdInt === req.user.id) {
      return res.status(400).json({ error: 'Cannot create thread with yourself' });
    }

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantIdInt },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        lastSeen: true
      }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Check if thread already exists
    let thread = await prisma.thread.findFirst({
      where: {
        OR: [
          { userAId: req.user.id, userBId: participantIdInt },
          { userAId: participantIdInt, userBId: req.user.id }
        ]
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            lastSeen: true
          }
        },
        userB: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            lastSeen: true
          }
        },
        lastMessage: {
          select: {
            id: true,
            content: true,
            type: true,
            status: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                status: { not: 'read' },
                senderId: { not: req.user.id }
              }
            }
          }
        }
      }
    });

    // If thread doesn't exist, create it
    if (!thread) {
      thread = await prisma.thread.create({
        data: {
          userAId: req.user.id,
          userBId: participantIdInt
        },
        include: {
          userA: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              lastSeen: true
            }
          },
          userB: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              lastSeen: true
            }
          },
          lastMessage: {
            select: {
              id: true,
              content: true,
              type: true,
              status: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              messages: {
                where: {
                  status: { not: 'read' },
                  senderId: { not: req.user.id }
                }
              }
            }
          }
        }
      });
    }

    // Format thread to include the other participant
    const otherUser = thread.userAId === req.user.id ? thread.userB : thread.userA;
    const formattedThread = {
      id: thread.id,
      otherUser,
      lastMessage: thread.lastMessage,
      unreadCount: thread._count.messages,
      updatedAt: thread.updatedAt,
      createdAt: thread.createdAt
    };

    res.json({ thread: formattedThread });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
