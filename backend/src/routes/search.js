import express from 'express';
import { search } from '../controllers/searchController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // Search routes require authentication

router.get('/', search);

export default router;
