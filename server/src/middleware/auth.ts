import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import config from '../config';
import { logger } from '../utils/logger';

export interface AuthenticatedUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Express middleware: проверяет JWT из заголовка Authorization и кладёт
 * найденного пользователя в req.user. При невалидном или отсутствующем
 * токене возвращает 401/403.
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: number };
    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user as unknown as AuthenticatedUser;
    next();
  } catch (error) {
    logger.warn('JWT verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};
