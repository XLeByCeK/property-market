import { Request, Response } from 'express';
import { AuthRepository } from '../repositories/auth';
import { generateJWT } from '../utils/auth';
import { logger } from '../utils/logger';

type Role = string;

const toPublicUser = (user: {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  role: user.role,
});

const parseBirthDate = (raw: unknown): Date | undefined | { error: string } => {
  if (!raw) return undefined;
  const parsed = new Date(raw as string);
  if (Number.isNaN(parsed.getTime())) return { error: 'Invalid birth date format' };
  return parsed;
};

export class AuthController {
  constructor(private authRepository: AuthRepository) {}

  async register(req: Request, res: Response) {
    try {
      // Поддерживаем оба именования (camelCase и snake_case) — клиент может прислать любой формат.
      const { email, password, firstName, lastName, phone, birthDate, first_name, last_name } = req.body;
      const role = req.body.role || 'BUYER';
      const actualFirstName = first_name || firstName;
      const actualLastName = last_name || lastName;

      const missing: string[] = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!actualFirstName) missing.push('firstName/first_name');
      if (!actualLastName) missing.push('lastName/last_name');

      if (missing.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missing.join(', ')}`,
        });
      }

      const parsedBirthDate = parseBirthDate(req.body.birth_date || birthDate);
      if (parsedBirthDate && typeof parsedBirthDate === 'object' && 'error' in parsedBirthDate) {
        return res.status(400).json({ error: parsedBirthDate.error });
      }

      const existingUser = await this.authRepository.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const user = await this.authRepository.createUser({
        email,
        password,
        first_name: actualFirstName,
        last_name: actualLastName,
        phone,
        birth_date: parsedBirthDate as Date | undefined,
        role,
      });

      const session = await this.authRepository.createSession(user.id);
      const token = generateJWT(user.id);

      res.status(201).json({
        user: toPublicUser(user),
        token,
        session: { token: session.token, expires_at: session.expires_at },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error during registration' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await this.authRepository.validateCredentials({ email, password });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const session = await this.authRepository.createSession(user.id);
      const token = generateJWT(user.id);

      res.json({
        user: toPublicUser(user),
        token,
        session: { token: session.token, expires_at: session.expires_at },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) await this.authRepository.deleteSession(token);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error during logout' });
    }
  }

  async validateSession(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const session = await this.authRepository.validateSession(token);
      if (!session) return res.status(401).json({ error: 'Invalid or expired session' });

      res.json({ valid: true, user: toPublicUser(session.user) });
    } catch (error) {
      logger.error('Session validation error:', error);
      res.status(500).json({ error: 'Internal server error during session validation' });
    }
  }
}
