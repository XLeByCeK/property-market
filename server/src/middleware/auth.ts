import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { Prisma } from '@prisma/client';

type UserRole = 'ADMIN' | 'SELLER' | 'BUYER';

interface UserWithRole {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserWithRole;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[authenticateToken] Проверка токена для ${req.method} ${req.originalUrl}`);
  
  const authHeader = req.headers['authorization'];
  console.log(`[authenticateToken] Заголовок Authorization: ${authHeader ? 'присутствует' : 'отсутствует'}`);
  
  const token = authHeader ? authHeader.split(' ')[1] : null;
  console.log(`[authenticateToken] Токен: ${token ? token.substring(0, 15) + '...' : 'не найден'}`);

  if (!token) {
    console.log('[authenticateToken] Ошибка: Токен не предоставлен');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log('[authenticateToken] Проверка токена через JWT...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: number };
    console.log(`[authenticateToken] Токен проверен успешно, ID пользователя: ${decoded.id}`);
    
    console.log(`[authenticateToken] Поиск пользователя с ID: ${decoded.id}`);
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      console.log('[authenticateToken] Ошибка: Пользователь не найден в БД');
      return res.status(401).json({ error: 'User not found' });
    }

    console.log(`[authenticateToken] Пользователь найден: ${user.first_name} ${user.last_name} (${user.email})`);
    req.user = user as unknown as UserWithRole;
    console.log('[authenticateToken] Аутентификация успешна, передаем управление далее');
    next();
  } catch (error) {
    console.error('[authenticateToken] Ошибка проверки токена:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
}; 