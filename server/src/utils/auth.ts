import jwt from 'jsonwebtoken';
import config from '../config/index'; // Импортируем из конфига

export function generateJWT(userId: number): string {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any});
}

export function verifyJWT(token: string): { id: number } | null {
  try {
    return jwt.verify(token, config.jwtSecret) as { id: number };
  } catch (error) {
    return null;
  }
}