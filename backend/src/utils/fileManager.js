import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

const uploadDir = path.join(process.cwd(), 'uploads');

export const getUploadPath = (filename) => {
  return path.join(uploadDir, filename);
};

export const deleteFile = async (filename) => {
  try {
    const filePath = getUploadPath(filename);
    await fs.remove(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const generateSecureFileName = (originalName) => {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString('hex');
  return `${hash}${ext}`;
};

export const getFileUrl = (filename) => {
  // Returns relative URL for the file
  return `/uploads/${filename}`;
};

export const isValidFile = (filename) => {
  const filePath = getUploadPath(filename);
  return fs.existsSync(filePath);
};