import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import axios from 'axios';

// Interfaces
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Validating token with API');
        
        // Use direct axios call for better error handling
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const data = response.data;
        console.log('Current user data:', data);
        
        if (data && (data.user || data)) {
          // Extract user data from response
          const userData = data.user || data;
          console.log('Setting user data:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // If invalid, clear storage
          console.log('No user data received, clearing storage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error: any) {
        console.error('Auth validation error:', error);
        // Handle 401 error gracefully
        if (error.response && error.response.status === 401) {
          console.log('Auth token is invalid or expired, clearing it');
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register function
  const register = async (userData: RegisterData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Sending registration request with data:', userData);
      
      // Ensure data is in the correct format
      const registerData = {
        email: userData.email,
        password: userData.password,
        // Use values from snake_case if available, otherwise from camelCase
        first_name: userData.first_name || userData.firstName,
        last_name: userData.last_name || userData.lastName,
        phone: userData.phone,
        birth_date: userData.birth_date || userData.birthDate,
        role: userData.role || 'BUYER'
      };
      
      console.log('Final registration data to be sent:', registerData);
      
      // Use fetch directly for consistency with login
      const requestUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/register`;
      console.log('Register request URL:', requestUrl);
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });
      
      console.log('Register response status:', response.status);
      
      if (!response.ok) {
        // Handle error responses
        const errorData = await response.json().catch(() => ({}));
        console.error('Register error response:', errorData);
        
        if (response.status === 400) {
          setError(errorData.error || 'Неверные данные для регистрации');
        } else {
          setError(errorData.error || 'Ошибка при регистрации');
        }
        // Instead of throwing, just return here
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Registration successful, response:', data);
      
      const { user, token } = data;
      
      if (!user || !token) {
        setError('Invalid response from server');
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Registration error details:', error);
      
      setError('Ошибка соединения с сервером. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log(`Logging in with email: ${email}`);
      
      const requestUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`;
      console.log('Login request URL:', requestUrl);
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        // Handle error responses
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        
        if (response.status === 401) {
          setError(errorData.error || 'Неверный email или пароль');
        } else if (response.status === 400) {
          setError(errorData.error || 'Неверные данные для входа');
        } else {
          setError(errorData.error || 'Ошибка при входе');
        }
        
        // Instead of throwing an error, just return - this prevents the runtime error
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Login successful, response data:', data);
      
      const { user, token } = data;
      
      if (!user || !token) {
        setError('Invalid response from server');
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login error details:', error);
      setError('Ошибка соединения с сервером. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      console.log('Sending logout request');
      await api.auth.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 