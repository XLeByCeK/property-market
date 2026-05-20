import api from './api';
import { getMainImageUrl, PLACEHOLDER_NULL_IMAGE } from '../utils/imageUrl';
import {
  Property,
  PropertyDetails,
  PropertyFormData,
  PropertyFromAPI,
} from '../types/property';

// Реэкспорт типов — большая часть кодовой базы импортирует их именно отсюда.
// Со временем импорты следует перенацелить на `../types/property`.
export type {
  Property,
  PropertyDetails,
  PropertyFormData,
  PropertyFromAPI,
} from '../types/property';

/**
 * Запускает асинхронную операцию и возвращает её результат, либо `fallback`,
 * если случилась ошибка. Помогает не дублировать одинаковые try/catch.
 */
const safe = async <T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error(errorMessage, error);
    return fallback;
  }
};

const hasToken = (): boolean =>
  typeof window !== 'undefined' && Boolean(localStorage.getItem('token'));

/**
 * Преобразует данные с API в формат для отображения в UI: подбирает основное
 * изображение через getMainImageUrl, нормализует текст комнат/этажей и
 * определяет, является ли объект арендой.
 */
export const mapPropertyFromAPI = (property: PropertyFromAPI): Property => {
  const mainImage = getMainImageUrl(property.images, PLACEHOLDER_NULL_IMAGE);

  const roomsText = property.rooms === 0 ? 'Студия' : `${property.rooms} комн.`;

  let floorsText = '';
  if (property.floor && property.total_floors) {
    floorsText = `${property.floor}/${property.total_floors} эт.`;
  } else if (property.floor) {
    floorsText = `${property.floor} эт.`;
  } else if (property.total_floors) {
    floorsText = `${property.total_floors} эт.`;
  }

  const rentKeywords = ['аренд', 'снять', 'сдать', 'rent'];
  const descriptionLower = property.description.toLowerCase();
  const isForRent =
    property.transaction_type.name.toLowerCase().includes('аренд') ||
    rentKeywords.some((keyword) => descriptionLower.includes(keyword));

  return {
    id: property.id.toString(),
    image: mainImage,
    price: property.price,
    propertyType: property.property_type.name,
    rooms: roomsText,
    floors: floorsText,
    address: property.address,
    metro: property.metro_station?.name || '',
    isNewBuilding: property.is_new_building,
    isCommercial: property.is_commercial,
    isForRent,
    isCountry: property.is_country,
    description: property.description,
  };
};

export const transformPropertyToFormData = (property: PropertyFromAPI): PropertyFormData => ({
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
  images: property.images.map((img) => img.image_url),
});

// === Получение объявлений =====================================================

const fetchAndMap = async (
  fetcher: () => Promise<unknown>,
  errorMessage: string
): Promise<Property[]> =>
  safe(
    async () => {
      const data = (await fetcher()) as PropertyFromAPI[];
      return Array.isArray(data) ? data.map(mapPropertyFromAPI) : [];
    },
    [],
    errorMessage
  );

export const getAllProperties = () =>
  fetchAndMap(() => api.properties.getAll(), 'Error fetching properties:');

export const getNewBuildings = (limit = 8) =>
  fetchAndMap(() => api.properties.getNewBuildings(limit), 'Error fetching new buildings:');

export const getPropertiesForSale = (limit = 8) =>
  fetchAndMap(() => api.properties.getForSale(limit), 'Error fetching properties for sale:');

export const getPropertiesForRent = (limit = 8) =>
  fetchAndMap(() => api.properties.getForRent(limit), 'Error fetching properties for rent:');

export const searchProperties = (params: Record<string, any>) =>
  fetchAndMap(() => api.properties.search(params), 'Error searching properties:');

export const getPropertyById = async (id: number) => {
  try {
    return await api.properties.getById(id);
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

// === Favorites ===============================================================

export const toggleFavorite = async (
  propertyId: string | number
): Promise<{ favorited: boolean; message: string }> => {
  const numericId = typeof propertyId === 'string' ? parseInt(propertyId, 10) : propertyId;
  if (Number.isNaN(numericId)) throw new Error('Invalid property ID');
  if (!hasToken()) throw new Error('Authentication token not found');

  const response = (await api.properties.toggleFavorite(numericId)) as {
    favorited?: boolean;
    message?: string;
  };

  if (typeof response?.favorited !== 'boolean') {
    return { favorited: false, message: 'Unknown status' };
  }
  return { favorited: response.favorited, message: response.message ?? '' };
};

export const isPropertyFavorited = async (propertyId: string | number): Promise<boolean> => {
  const numericId = typeof propertyId === 'string' ? parseInt(propertyId, 10) : propertyId;
  if (Number.isNaN(numericId) || !hasToken()) return false;

  return safe(
    async () => {
      const response = (await api.properties.checkFavorite(numericId)) as { favorited?: boolean };
      return response?.favorited === true;
    },
    false,
    '[isPropertyFavorited] Error:'
  );
};

export const getFavoriteProperties = async (): Promise<Property[]> => {
  if (!hasToken()) return [];
  return fetchAndMap(() => api.properties.getFavorites(), '[getFavoriteProperties] Error:');
};

// === Reference data ==========================================================

export const getPropertyTypes = () =>
  safe(() => api.properties.getPropertyTypes(), [], 'Error fetching property types:');

export const getTransactionTypes = () =>
  safe(() => api.properties.getTransactionTypes(), [], 'Error fetching transaction types:');

export const getCities = () =>
  safe(() => api.properties.getCities(), [], 'Error fetching cities:');

export const getDistrictsByCityId = (cityId: number) =>
  safe(() => api.properties.getDistrictsByCityId(cityId), [], 'Error fetching districts:');

export const getMetroStationsByCityId = (cityId: number) =>
  safe(() => api.properties.getMetroStationsByCityId(cityId), [], 'Error fetching metro:');

// === Mutations ===============================================================

interface UploadImagesResponse {
  imageUrls: string[];
  [key: string]: any;
}

export const uploadPropertyImages = async (formData: FormData): Promise<UploadImagesResponse> => {
  // Сервер возвращает относительные пути `/property_images/uploads/<uuid>.jpg`,
  // абсолютный URL для рендера соберёт getImageUrl на клиенте.
  return (await api.properties.uploadImages(formData)) as UploadImagesResponse;
};

export const createProperty = (propertyData: PropertyFormData) =>
  api.properties.create(propertyData);

export const updateProperty = (id: number, propertyData: PropertyFormData) =>
  api.properties.update(id, propertyData);

// === View history ============================================================

export const recordPropertyView = async (propertyId: number): Promise<boolean> => {
  if (!hasToken()) return false;

  // Дедуплицируем повторные записи в рамках одной сессии — компоненты могут
  // перерендериваться несколько раз и каждый раз триггерить запись.
  const viewedKey = `property_viewed_${propertyId}_session`;
  if (sessionStorage.getItem(viewedKey)) return true;
  sessionStorage.setItem(viewedKey, 'true');

  return safe(
    async () => {
      await api.properties.recordView(propertyId);
      return true;
    },
    false,
    'Error recording property view:'
  );
};

export const getViewHistory = async (): Promise<Property[]> => {
  if (!hasToken()) return [];
  return fetchAndMap(() => api.properties.getViewHistory(), 'Error fetching view history:');
};
