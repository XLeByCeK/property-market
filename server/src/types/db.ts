export interface User {
  id: number;
  email: string;
  phone: string | null;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface NewUser {
  email: string;
  phone?: string;
  password: string;
  first_name?: string;
  last_name?: string;
  birth_date?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 