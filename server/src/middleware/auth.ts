import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { Prisma } from '@prisma/client';

type UserRole = 'ADMIN' | 'SELLER' | 'BUYER';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        role: UserRole;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: number };
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, first_name: true, last_name: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}; 