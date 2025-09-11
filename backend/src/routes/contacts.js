import express from 'express';
import { getContacts, addContact, removeContact, addContactValidation } from '../controllers/contactController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // All contact routes require authentication

router.get('/', getContacts);
router.post('/', addContactValidation, addContact);
router.delete('/:id', removeContact);

export default router;
