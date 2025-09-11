import { body, validationResult } from 'express-validator';
import prisma from '../utils/db.js';

export const askAIValidation = [
  body('prompt').trim().isLength({ min: 1, max: 500 }).withMessage('Prompt must be 1-500 characters')
];

// Mock AI service - replace with actual AI provider
const generateAIResponse = async (prompt, context) => {
  // This is a mock implementation
  // In production, replace with actual AI service call
  const responses = [
    "That's an interesting point! Let me think about that...",
    "I understand what you're saying. Here's my perspective:",
    "Thanks for sharing that with me. I'd like to add that...",
    "I see where you're coming from. What if we consider...",
    "That's a great question! Based on what you've told me...",
    "I appreciate you bringing this up. My thoughts are...",
    "That makes a lot of sense. I would also suggest...",
    "Interesting perspective! I think we should also consider..."
  ];
  
  // Simple mock - in reality, you'd call an AI service
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return {
    content: `${randomResponse} (AI Assistant)`,
    type: 'assistant'
  };
};

export const askAI = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { threadId } = req.params;
    const { prompt } = req.body;
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

    // Get recent messages for context
    const recentMessages = await prisma.message.findMany({
      where: { threadId: threadIdInt },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        content: true,
        type: true,
        sender: {
          select: {
            name: true
          }
        }
      }
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(prompt, recentMessages);

    // Create AI message
    const message = await prisma.message.create({
      data: {
        threadId: threadIdInt,
        senderId: req.user.id, // AI messages are associated with the user who requested them
        content: aiResponse.content,
        type: aiResponse.type,
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
    console.error('Ask AI error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
