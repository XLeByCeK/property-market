import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';

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
        const data: any = await api.auth.getCurrentUser();
        console.log('Current user data:', data);
        
        if (data && (data.user || data)) {
          // Extract user data from response
          const userData = data.user || data;
          console.log('Setting user data:', userData);
          setUser(userData);
        } else {
          // If invalid, clear storage
          console.log('No user data received, clearing storage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth validation error:', error);
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
      
      // Убедимся, что данные отправляются в правильном формате
      const registerData = {
        email: userData.email,
        password: userData.password,
        // Используем значения из snake_case если есть, иначе из camelCase
        first_name: userData.first_name || userData.firstName,
        last_name: userData.last_name || userData.lastName,
        phone: userData.phone,
        birth_date: userData.birth_date || userData.birthDate,
        role: userData.role || 'BUYER'
      };
      
      console.log('Final registration data to be sent:', registerData);
      
      const data: any = await api.auth.register(registerData);
      
      console.log('Registration successful, response:', data);
      const { user, token } = data;
      
      if (!user || !token) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
    } catch (error: any) {
      console.error('Registration error details:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Sending login request for email:', email);
      const data: any = await api.auth.login(email, password);
      
      console.log('Login successful, response:', data);
      const { user, token } = data;
      
      if (!user || !token) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
    } catch (error: any) {
      console.error('Login error details:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw error;
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
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
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