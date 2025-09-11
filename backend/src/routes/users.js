import express from 'express';
import { getMe, getUserById } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticateToken, getMe);
router.get('/:id', getUserById);

export default router;
