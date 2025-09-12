import express from 'express';
import path from 'path';
import { isValidFile, getUploadPath } from '../utils/fileManager.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Serve uploaded files - protected by auth
router.get('/:filename', authenticateToken, async (req, res) => {
  const { filename } = req.params;

  if (!isValidFile(filename)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const filePath = getUploadPath(filename);
  res.sendFile(filePath);
});

export default router;