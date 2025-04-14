import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response } = error;
    
    // Handle network errors
    if (!response) {
      console.error('Network Error - No response received');
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        statusCode: 0,
      });
    }
    
    // Log detailed error info for debugging
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config?.url,
      data: response.data,
    });
    
    return Promise.reject(error);
  }
);

// Generic API request function
const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return response.data;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};

// API endpoints
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) => 
      apiRequest({
        method: 'POST',
        url: '/auth/login',
        data: { email, password },
      }),
      
    register: (userData: any) => 
      apiRequest({
        method: 'POST',
        url: '/auth/register',
        data: userData,
      }),
      
    logout: () => 
      apiRequest({
        method: 'POST',
        url: '/auth/logout',
      }),
      
    getCurrentUser: () => 
      apiRequest({
        method: 'GET',
        url: '/auth/me',
      }),
  },
  
  // Properties
  properties: {
    getAll: (params?: any) => 
      apiRequest({
        method: 'GET',
        url: '/properties',
        params,
      }),
      
    getById: (id: number | string) => 
      apiRequest({
        method: 'GET',
        url: `/properties/${id}`,
      }),
      
    create: (propertyData: any) => 
      apiRequest({
        method: 'POST',
        url: '/properties',
        data: propertyData,
      }),
      
    update: (id: number | string, propertyData: any) => 
      apiRequest({
        method: 'PUT',
        url: `/properties/${id}`,
        data: propertyData,
      }),
      
    delete: (id: number | string) => 
      apiRequest({
        method: 'DELETE',
        url: `/properties/${id}`,
      }),
  },
  
  // Chat/Messages
  chat: {
    getConversations: () => 
      apiRequest({
        method: 'GET',
        url: '/chat/conversations',
      }),
      
    getPropertyMessages: (propertyId: number) => 
      apiRequest({
        method: 'GET',
        url: `/chat/properties/${propertyId}/messages`,
      }),
      
    sendMessage: (data: { content: string; recipient_id: number; property_id?: number }) => 
      apiRequest({
        method: 'POST',
        url: '/chat/messages',
        data,
      }),
      
    markAsRead: (messageIds: number[]) => 
      apiRequest({
        method: 'POST',
        url: '/chat/messages/read',
        data: { messageIds },
      }),
  },
};

export default api; 