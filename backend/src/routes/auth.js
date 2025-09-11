import express from 'express';
import { register, login, refresh, logout, registerValidation, loginValidation } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
