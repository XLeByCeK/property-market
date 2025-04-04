import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date | null;
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

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'password_hash'> & { password: string }): Promise<User> {
    const hashedPassword = await hash(userData.password, 10);
    const result = await this.pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, birth_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [userData.email, hashedPassword, userData.first_name, userData.last_name, userData.phone, userData.birth_date]
    );
    return result.rows[0];
  }

  async validateCredentials(credentials: { email: string; password: string }): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) return null;

    const isValid = await compare(credentials.password, user.password_hash);
    return isValid ? user : null;
  }

  async createSession(userId: number): Promise<Session> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Session expires in 7 days

    const result = await this.pool.query(
      `INSERT INTO sessions (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, token, expiresAt]
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