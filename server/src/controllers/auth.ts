import { Request, Response } from 'express';
import { AuthRepository } from '../repositories/auth';
import { generateJWT } from '../utils/auth';

export class AuthController {
  constructor(private authRepository: AuthRepository) {}

  async register(req: Request, res: Response) {
    try {
      console.log('Raw request body:', JSON.stringify(req.body));
      const { email, password, firstName, lastName, phone, birthDate, role = 'BUYER', first_name, last_name } = req.body;
      
      console.log('Full registration request body:', req.body);
      console.log('Registration attempt with all fields:', { 
        email, 
        password: password ? '(present)' : '(missing)', 
        firstName,
        lastName, 
        phone, 
        birthDate, 
        role,
        first_name,
        last_name
      });
      
      // Проверяем наличие необходимых полей в обоих форматах
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      
      // Проверяем имя и фамилию в обоих форматах
      const actualFirstName = first_name || firstName;
      const actualLastName = last_name || lastName;
      
      if (!actualFirstName) missingFields.push('firstName/first_name');
      if (!actualLastName) missingFields.push('lastName/last_name');
      
      if (missingFields.length > 0) {
        const message = `Missing required fields: ${missingFields.join(', ')}. Received fields: ${Object.keys(req.body).join(', ')}`;
        console.log(message);
        return res.status(400).json({ error: message });
      }

      // Format birth date if provided
      let parsedBirthDate: Date | undefined;
      const rawBirthDate = req.body.birth_date || birthDate;
      
      if (rawBirthDate) {
        try {
          parsedBirthDate = new Date(rawBirthDate);
          if (isNaN(parsedBirthDate.getTime())) {
            console.log('Invalid birth date format:', rawBirthDate);
            return res.status(400).json({ error: 'Invalid birth date format' });
          }
        } catch (error) {
          console.log('Error parsing birth date:', error);
          return res.status(400).json({ error: 'Invalid birth date format' });
        }
      }

      const existingUser = await this.authRepository.getUserByEmail(email);
      if (existingUser) {
        console.log('User already exists with email:', email);
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create user with the expected field names
      const userData = {
        email,
        password,
        first_name: actualFirstName,
        last_name: actualLastName,
        phone,
        birth_date: parsedBirthDate,
        role
      };

      console.log('Creating user with data:', userData);
      const user = await this.authRepository.createUser(userData);
      console.log('User created successfully, ID:', user.id);
      
      const session = await this.authRepository.createSession(user.id);
      const token = generateJWT(user.id);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
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
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ error: 'Internal server error during registration' });
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
          firstName: user.first_name,
          lastName: user.last_name,
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
      res.status(500).json({ error: 'Internal server error during login' });
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
      res.status(500).json({ error: 'Internal server error during logout' });
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
          firstName: session.user.first_name,
          lastName: session.user.last_name,
          role: session.user.role
        }
      });
    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({ error: 'Internal server error during session validation' });
    }
  }
} 