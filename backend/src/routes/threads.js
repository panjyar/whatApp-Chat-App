import express from 'express';
import { getThreads, createThread, createThreadValidation } from '../controllers/threadController.js';
import { getMessages, sendMessage, markMessageAsRead, sendMessageValidation } from '../controllers/messageController.js';
import { askAI, askAIValidation } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // All thread routes require authentication

// Thread routes
router.get('/', getThreads);
router.post('/', createThreadValidation, createThread);

// Message routes
router.get('/:threadId/messages', getMessages);
router.post('/:threadId/messages', sendMessageValidation, sendMessage);
router.put('/:threadId/messages/:messageId/read', markMessageAsRead);

// AI routes
router.post('/:threadId/ai', askAIValidation, askAI);

export default router;
