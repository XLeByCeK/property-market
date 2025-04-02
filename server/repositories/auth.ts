import { Pool } from 'pg';
import { User, Session, NewUser, LoginCredentials } from '../types/db';
import { hashPassword, comparePasswords, generateSessionToken, getSessionExpiration } from '../utils/auth';

export class AuthRepository {
  constructor(private pool: Pool) {}

  async createUser(userData: NewUser): Promise<User> {
    const passwordHash = await hashPassword(userData.password);
    
    const result = await this.pool.query(
      `INSERT INTO users (
        email, phone, password_hash, first_name, last_name, birth_date
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        userData.email,
        userData.phone || null,
        passwordHash,
        userData.first_name || null,
        userData.last_name || null,
        userData.birth_date || null,
      ]
    );

    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  async createSession(userId: number): Promise<Session> {
    const token = generateSessionToken();
    const expiresAt = getSessionExpiration();

    const result = await this.pool.query(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, token, expiresAt]
    );

    return result.rows[0];
  }

  async validateSession(token: string): Promise<Session | null> {
    const result = await this.pool.query(
      `SELECT * FROM sessions 
       WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP`,
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

  async validateCredentials(credentials: LoginCredentials): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) return null;

    const isValid = await comparePasswords(credentials.password, user.password_hash);
    return isValid ? user : null;
  }
} 