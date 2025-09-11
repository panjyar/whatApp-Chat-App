import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
