import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateSessionToken = (): string => {
  return randomBytes(32).toString('hex');
};

export const generateJWT = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

export const verifyJWT = (token: string): { userId: number } => {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
};

export const getSessionExpiration = (): Date => {
  return new Date(Date.now() + SESSION_DURATION);
}; 