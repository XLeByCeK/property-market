import { Request, Response } from 'express';
import { AuthRepository } from '../repositories/auth';
import { generateJWT } from '../utils/auth';

export class AuthController {
  constructor(private authRepository: AuthRepository) {}

  async register(req: Request, res: Response) {
    try {
      const userData = req.body;
      
      if (!userData.email || !userData.password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = await this.authRepository.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const user = await this.authRepository.createUser(userData);
      const session = await this.authRepository.createSession(user.id);
      const token = generateJWT(user.id);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          role: user.role
        },
        token,
        session: {
          token: session.token,
          expires_at: session.expires_at,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      console.log(`Login attempt for email: ${email}`);
      const user = await this.authRepository.validateCredentials({ email, password });
      
      if (!user) {
        console.log(`Invalid credentials for email: ${email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log(`User authenticated successfully: ${user.id}`);
      const session = await this.authRepository.createSession(user.id);
      const token = generateJWT(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          role: user.role
        },
        token,
        session: {
          token: session.token,
          expires_at: session.expires_at,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : null;
      
      if (token) {
        await this.authRepository.deleteSession(token);
      }
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async validateSession(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : null;
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const session = await this.authRepository.validateSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      res.json({ 
        valid: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          first_name: session.user.first_name,
          last_name: session.user.last_name,
          role: session.user.role
        }
      });
    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 