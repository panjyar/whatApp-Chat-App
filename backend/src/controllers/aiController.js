import { body, validationResult } from 'express-validator';
import prisma from '../utils/db.js';

export const askAIValidation = [
  body('prompt').trim().isLength({ min: 1, max: 500 }).withMessage('Prompt must be 1-500 characters')
];

// Mock AI service - replace with actual AI provider
const generateAIResponse = async (prompt, context) => {
  // Get conversation context from recent messages
  const conversationContext = context
    .reverse()
    .map(msg => `${msg.sender.name}: ${msg.content}`)
    .join('\n');

  // Generate response based on prompt type
  let response;
  
  if (prompt.toLowerCase().includes('summarize')) {
    response = 'Here\'s a summary of the recent conversation: ' + 
      summarizeConversation(conversationContext);
  } else if (prompt.toLowerCase().includes('suggest') || prompt.toLowerCase().includes('help')) {
    response = generateSuggestion(prompt, conversationContext);
  } else if (prompt.toLowerCase().includes('translate')) {
    response = 'Translation feature coming soon! For now, I can help rephrase messages.';
  } else {
    response = generateContextualResponse(prompt, conversationContext);
  }

  return {
    content: response,
    type: 'assistant'
  };
};

// Helper functions for different types of AI responses
const summarizeConversation = (context) => {
  const lines = context.split('\n');
  if (lines.length <= 2) return 'The conversation just started.';
  
  return 'The conversation involves ' + 
    [...new Set(lines.map(l => l.split(':')[0]))].join(' and ') +
    ' discussing ' + (context.length > 100 ? context.slice(-100) : context);
};

const generateSuggestion = (prompt, context) => {
  const suggestions = [
    "Based on the conversation, you might want to discuss...",
    "Consider asking about...",
    "You could share your thoughts on...",
    "This might be a good time to bring up...",
  ];
  
  // Add keywords from context
  const keywords = extractKeywords(context);
  return suggestions[Math.floor(Math.random() * suggestions.length)] +
    ' ' + keywords.join(', ');
};

const generateContextualResponse = (prompt, context) => {
  const toneMap = {
    formal: [
      "I understand the context. My analysis suggests...",
      "Given the conversation history, I recommend...",
      "Based on the discussion, here's my perspective..."
    ],
    casual: [
      "Got it! Here's what I think...",
      "Cool conversation! My thoughts are...",
      "I see what you mean. Maybe try..."
    ]
  };

  // Detect tone from context
  const isFormal = context.includes('please') || context.includes('would you') || context.includes('could you');
  const tone = isFormal ? 'formal' : 'casual';
  const responses = toneMap[tone];
  
  return responses[Math.floor(Math.random() * responses.length)] +
    ' ' + generateRelevantContent(prompt, context);
};

const extractKeywords = (text) => {
  // Simple keyword extraction
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 4)
    .slice(-3);
};

const generateRelevantContent = (prompt, context) => {
  const keywords = extractKeywords(context);
  return `I notice you're talking about ${keywords.join(', ')}. ` +
    `This relates to your question about "${prompt}". ` +
    `Consider exploring how these topics connect.`;
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
