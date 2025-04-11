import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

// Interface for property details
export interface PropertyDetails {
  id: number;
  title: string;
  description: string;
  price: number;
  area: number;
  rooms: number;
  floor?: number;
  total_floors?: number;
  address: string;
  year_built?: number;
  property_type: {
    id: number;
    name: string;
  };
  transaction_type: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
  metro_station?: {
    id: number;
    name: string;
    color: string;
  };
  metro_distance?: number;
  is_new_building: boolean;
  is_commercial: boolean;
  is_country: boolean;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
  };
  images: Array<{
    id: number;
    image_url: string;
    is_main: boolean;
    order: number;
  }>;
  created_at: string;
  updated_at: string;
}

// Get property by ID
export const getPropertyById = async (id: string | number): Promise<PropertyDetails> => {
  try {
    // Skip real API call in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping real API call');
      // Return a rejected promise instead of throwing an error directly
      return Promise.reject({
        isDevModeSkip: true,
        message: 'Skipping API call in development'
      });
    }
    
    const response = await axios.get(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};

// Toggle favorite status for a property
export const toggleFavorite = async (propertyId: string | number): Promise<void> => {
  try {
    await axios.post(`${API_URL}/favorites/${propertyId}`, {}, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
}; 