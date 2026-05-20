import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

interface AuthResponse {
  user?: User;
  token?: string;
  error?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Тонкая обёртка над fetch для auth-эндпойнтов. Возвращает либо `data`,
 * либо `{ error }`, чтобы вызывающий код не дублировал try/catch и парсинг.
 */
const authFetch = async <T extends AuthResponse>(
  path: string,
  body: unknown
): Promise<{ data?: T; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return { error: errorBody.error || `Ошибка сервера: ${response.status}` };
    }

    return { data: (await response.json()) as T };
  } catch (error) {
    console.error('Auth request failed:', error);
    return { error: 'Ошибка соединения с сервером. Пожалуйста, попробуйте позже.' };
  }
};

const persistSession = (user: User, token: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Восстанавливаем сессию по токену в localStorage при загрузке страницы.
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = (await api.auth.getCurrentUser()) as { user?: User } | User;
        const userData = (data as any)?.user ?? data;
        if (userData) {
          setUser(userData as User);
          setIsAuthenticated(true);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (userData: RegisterData) => {
    setError(null);
    setIsLoading(true);

    // Бэкенд принимает оба именования — отдаём snake_case, при отсутствии берём camelCase.
    const payload = {
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name || userData.firstName,
      last_name: userData.last_name || userData.lastName,
      phone: userData.phone,
      birth_date: userData.birth_date || userData.birthDate,
      role: userData.role || 'BUYER',
    };

    const { data, error: requestError } = await authFetch<AuthResponse>('/auth/register', payload);

    if (requestError || !data?.user || !data.token) {
      setError(requestError ?? 'Invalid response from server');
      setIsLoading(false);
      return;
    }

    persistSession(data.user, data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    const { data, error: requestError } = await authFetch<AuthResponse>('/auth/login', {
      email,
      password,
    });

    if (requestError || !data?.user || !data.token) {
      setError(requestError ?? 'Invalid response from server');
      setIsLoading(false);
      return;
    }

    persistSession(data.user, data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } catch (logoutError) {
      console.error('Logout error:', logoutError);
    } finally {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
