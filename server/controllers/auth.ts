import { Request, Response } from 'express';
import { AuthRepository } from '../repositories/auth';
import { generateJWT } from '../utils/auth';

export class AuthController {
  constructor(private authRepository: AuthRepository) {}

  async register(req: Request, res: Response) {
    try {
      const userData = req.body;
      
      // Validate required fields
      if (!userData.email || !userData.password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await this.authRepository.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create new user
      const user = await this.authRepository.createUser(userData);
      
      // Create session
      const session = await this.authRepository.createSession(user.id);
      
      // Generate JWT
      const token = generateJWT(user.id);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
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

      // Validate credentials
      const user = await this.authRepository.validateCredentials({ email, password });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Create new session
      const session = await this.authRepository.createSession(user.id);
      
      // Generate JWT
      const token = generateJWT(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
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
      const token = req.headers.authorization?.split(' ')[1];
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
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const session = await this.authRepository.validateSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 