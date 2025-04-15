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
export const getPropertyById = async (id: number) => {
  try {
    return await api.properties.getById(id);
  } catch (error) {
    console.error('Error fetching property:', error);
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

// Helper functions for property data transformations
export const transformPropertyToFormData = (property: PropertyFromAPI): PropertyFormData => {
  return {
    title: property.title,
    description: property.description,
    price: property.price,
    area: property.area,
    rooms: property.rooms,
    floor: property.floor,
    total_floors: property.total_floors,
    address: property.address,
    year_built: property.year_built,
    property_type_id: property.property_type_id,
    transaction_type_id: property.transaction_type_id,
    city_id: property.city_id,
    district_id: property.district_id,
    metro_id: property.metro_id,
    metro_distance: property.metro_distance,
    is_new_building: property.is_new_building,
    is_commercial: property.is_commercial,
    is_country: property.is_country,
    images: property.images.map(img => img.image_url),
  };
};

// Interface for property form data
export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  area: number;
  rooms: number;
  floor?: number;
  total_floors?: number;
  address: string;
  year_built?: number;
  property_type_id: number;
  transaction_type_id: number;
  city_id: number;
  district_id?: number;
  metro_id?: number;
  metro_distance?: number;
  is_new_building: boolean;
  is_commercial: boolean;
  is_country: boolean;
  images: string[];
}

// Methods for reference data
export const getPropertyTypes = async () => {
  try {
    return await api.properties.getPropertyTypes();
  } catch (error) {
    console.error('Error fetching property types:', error);
    return [];
  }
};

export const getTransactionTypes = async () => {
  try {
    return await api.properties.getTransactionTypes();
  } catch (error) {
    console.error('Error fetching transaction types:', error);
    return [];
  }
};

export const getCities = async () => {
  try {
    return await api.properties.getCities();
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const getDistrictsByCityId = async (cityId: number) => {
  try {
    return await api.properties.getDistrictsByCityId(cityId);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

export const getMetroStationsByCityId = async (cityId: number) => {
  try {
    return await api.properties.getMetroStationsByCityId(cityId);
  } catch (error) {
    console.error('Error fetching metro stations:', error);
    return [];
  }
};

// Methods for image upload
export const uploadPropertyImages = async (formData: FormData) => {
  try {
    return await api.properties.uploadImages(formData);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Create a new property
export const createProperty = async (propertyData: PropertyFormData) => {
  try {
    return await api.properties.create(propertyData);
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

// Update an existing property
export const updateProperty = async (id: number, propertyData: PropertyFormData) => {
  try {
    return await api.properties.update(id, propertyData);
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
}; 