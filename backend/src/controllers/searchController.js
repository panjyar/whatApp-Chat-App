import prisma from '../utils/db.js';

export const search = async (req, res) => {
  try {
    const { q, type = 'threads' } = req.query;
    const searchTerm = q?.trim();

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters' });
    }

    if (type === 'threads') {
      // Search threads by contact name
      const threads = await prisma.thread.findMany({
        where: {
          OR: [
            { userAId: req.user.id },
            { userBId: req.user.id }
          ],
          OR: [
            {
              userA: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            },
            {
              userB: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            }
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

      // Format threads to include the other participant
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
    } else if (type === 'messages') {
      // Search messages by content
      const messages = await prisma.message.findMany({
        where: {
          content: {
            contains: searchTerm,
            mode: 'insensitive'
          },
          thread: {
            OR: [
              { userAId: req.user.id },
              { userBId: req.user.id }
            ]
          }
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          },
          thread: {
            select: {
              id: true,
              userA: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true
                }
              },
              userB: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      // Format messages to include thread info
      const formattedMessages = messages.map(message => {
        const otherUser = message.thread.userA.id === req.user.id ? message.thread.userB : message.thread.userA;
        return {
          id: message.id,
          content: message.content,
          type: message.type,
          status: message.status,
          createdAt: message.createdAt,
          sender: message.sender,
          thread: {
            id: message.thread.id,
            otherUser
          }
        };
      });

      res.json({ messages: formattedMessages });
    } else {
      res.status(400).json({ error: 'Invalid search type. Must be "threads" or "messages"' });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
