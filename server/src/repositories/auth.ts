import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcryptjs';

export interface UserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: Date;
  role?: string;
}

// In-memory sessions store (could be replaced with Redis, DB, etc.)
const sessions = new Map<string, { userId: number, expiresAt: Date }>();

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async getUserByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email }
    });
  }

  async getUserById(id: number) {
    return this.prisma.users.findUnique({
      where: { id }
    });
  }

  async createUser(userData: UserData) {
    const hashedPassword = await hash(userData.password, 10);
    
    return this.prisma.users.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        birth_date: userData.birth_date,
        role: userData.role || 'BUYER',
      }
    });
  }

  async validateCredentials(credentials: { email: string; password: string }) {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) return null;

    const isValid = await compare(credentials.password, user.password);
    return isValid ? user : null;
  }

  async createSession(userId: number) {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Session expires in 7 days

    // Store session in memory
    sessions.set(token, {
      userId,
      expiresAt
    });

    return {
      token,
      expires_at: expiresAt
    };
  }

  async validateSession(token: string) {
    const session = sessions.get(token);
    if (!session) return null;

    const now = new Date();
    if (session.expiresAt < now) {
      // Session expired
      sessions.delete(token);
      return null;
    }

    // Get user data
    const user = await this.getUserById(session.userId);
    if (!user) {
      sessions.delete(token);
      return null;
    }

    return {
      token,
      expires_at: session.expiresAt,
      user
    };
  }

  async deleteSession(token: string) {
    sessions.delete(token);
  }
} 