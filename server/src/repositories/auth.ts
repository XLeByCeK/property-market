import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export class AuthRepository {
  constructor(private pool: Pool) {}

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const hashedPassword = await hash(userData.password, 10);
    const result = await this.pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [uuidv4(), userData.email, hashedPassword, userData.first_name, userData.last_name]
    );
    return result.rows[0];
  }

  async validateCredentials(credentials: { email: string; password: string }): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) return null;

    const isValid = await compare(credentials.password, user.password);
    return isValid ? user : null;
  }

  async createSession(userId: string): Promise<Session> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Session expires in 7 days

    const result = await this.pool.query(
      `INSERT INTO sessions (id, user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [uuidv4(), userId, token, expiresAt]
    );
    return result.rows[0];
  }

  async validateSession(token: string): Promise<Session | null> {
    const result = await this.pool.query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    return result.rows[0] || null;
  }

  async deleteSession(token: string): Promise<void> {
    await this.pool.query(
      'DELETE FROM sessions WHERE token = $1',
      [token]
    );
  }
} 