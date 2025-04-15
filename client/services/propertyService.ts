import axios from 'axios';
import api from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

// Interface for property from API
export interface PropertyFromAPI {
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
  status: string;
  is_new_building: boolean;
  is_commercial: boolean;
  is_country: boolean;
  created_at: string;
  updated_at: string;
  property_type_id: number;
  transaction_type_id: number;
  user_id: number;
  city_id: number;
  district_id?: number;
  metro_id?: number;
  metro_distance?: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  property_type: {
    id: number;
    name: string;
    description?: string;
  };
  transaction_type: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
    region?: string;
    country?: string;
  };
  district?: {
    id: number;
    name: string;
  };
  metro_station?: {
    id: number;
    name: string;
    line?: string;
    color?: string;
  };
  images: {
    id: number;
    image_url: string;
    is_main: boolean;
    order: number;
  }[];
}

// Interface for property representation in UI
export interface Property {
  id: string;
  image: string;
  price: number;
  propertyType: string;
  rooms: string;
  floors: string;
  address: string;
  metro: string;
  isNewBuilding: boolean;
  isCommercial: boolean;
  isForRent: boolean;
  description: string;
}

// Get property by ID
export const getPropertyById = async (id: string | number): Promise<PropertyFromAPI> => {
  try {
    const response = await api.properties.getById(id) as PropertyFromAPI;
    return response;
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

/**
 * Преобразует данные с API в формат для отображения в UI
 */
export const mapPropertyFromAPI = (property: PropertyFromAPI): Property => {
  // Основное изображение или заглушка, если нет изображений
  const mainImage = property.images.find(img => img.is_main)?.image_url || 
                    property.images[0]?.image_url || 
                    '/images/null-image.jpg';
  
  // Определение типа комнат
  let roomsText = '';
  if (property.rooms === 0) {
    roomsText = 'Студия';
  } else {
    roomsText = `${property.rooms} комн.`;
  }
  
  // Определение этажности
  let floorsText = '';
  if (property.floor && property.total_floors) {
    floorsText = `${property.floor}/${property.total_floors} эт.`;
  } else if (property.floor) {
    floorsText = `${property.floor} эт.`;
  } else if (property.total_floors) {
    floorsText = `${property.total_floors} эт.`;
  }
  
  // Определение метро
  const metroName = property.metro_station?.name || '';
  
  // Определяем, является ли объект арендным
  const isForRent = property.transaction_type.name.toLowerCase().includes('аренд') || 
                    property.description.toLowerCase().includes('аренд') ||
                    property.description.toLowerCase().includes('снять') ||
                    property.description.toLowerCase().includes('сдать') ||
                    property.description.toLowerCase().includes('rent');
  
  return {
    id: property.id.toString(),
    image: mainImage,
    price: property.price,
    propertyType: property.property_type.name,
    rooms: roomsText,
    floors: floorsText,
    address: property.address,
    metro: metroName,
    isNewBuilding: property.is_new_building,
    isCommercial: property.is_commercial,
    isForRent: isForRent,
    description: property.description
  };
};

/**
 * Получает все объекты недвижимости с сервера
 */
export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const data = await api.properties.getAll() as PropertyFromAPI[];
    return data.map(mapPropertyFromAPI);
  } catch (error) {
    console.error('Error fetching properties:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
};

/**
 * Получает новостройки 
 */
export const getNewBuildings = async (limit = 8): Promise<Property[]> => {
  try {
    const data = await api.properties.getNewBuildings(limit) as PropertyFromAPI[];
    return data.map(mapPropertyFromAPI);
  } catch (error) {
    console.error('Error fetching new buildings:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
};

/**
 * Получает объекты для покупки
 */
export const getPropertiesForSale = async (limit = 8): Promise<Property[]> => {
  try {
    const data = await api.properties.getForSale(limit) as PropertyFromAPI[];
    return data.map(mapPropertyFromAPI);
  } catch (error) {
    console.error('Error fetching properties for sale:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
};

/**
 * Получает объекты для аренды
 */
export const getPropertiesForRent = async (limit = 8): Promise<Property[]> => {
  try {
    const data = await api.properties.getForRent(limit) as PropertyFromAPI[];
    return data.map(mapPropertyFromAPI);
  } catch (error) {
    console.error('Error fetching properties for rent:', error);
    // Возвращаем пустой массив вместо ошибки
    return [];
  }
}; 