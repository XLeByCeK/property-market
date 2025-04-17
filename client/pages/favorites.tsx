import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { PropertyCard } from '../components/card/PropertyCard';
import { Property, getFavoriteProperties } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FavoritesPage: NextPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const addLog = (message: string) => {
    console.log(`[FavoritesPage] ${message}`);
    setDebugLog(prev => [...prev, message]);
  };

  // Функция для прямого запроса к API без использования Axios
  const directFetchFavorites = async () => {
    try {
      addLog('Выполняем прямой запрос к API с fetch...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        addLog('Токен авторизации не найден!');
        return [];
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // Попробуем оба маршрута
      const endpoints = [
        '/properties/user-favorites',
        '/properties/favorites'
      ];
      
      for (const endpoint of endpoints) {
        try {
          addLog(`Запрос к ${API_URL}${endpoint}`);
          
          const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          
          addLog(`Статус ответа (${endpoint}): ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            
            if (Array.isArray(data)) {
              addLog(`Получено ${data.length} объектов через ${endpoint}`);
              return data;
            } else {
              addLog(`Неожиданный формат данных от ${endpoint}: ${JSON.stringify(data)}`);
            }
          } else {
            const errorText = await response.text();
            addLog(`Ошибка от ${endpoint}: ${response.status} - ${errorText}`);
          }
        } catch (endpointError) {
          addLog(`Ошибка при запросе к ${endpoint}: ${(endpointError as Error).message}`);
        }
      }
      
      // Если дошли сюда, то ни один запрос не удался
      return [];
    } catch (error) {
      addLog(`Общая ошибка прямого запроса: ${(error as Error).message}`);
      return [];
    }
  };

  // Функция для обновления данных через сервис
  const refreshFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      addLog('Загрузка избранных объектов...');
      
      if (user) {
        addLog(`Пользователь: ID=${user.id}, Email=${user.email}`);
      }
      
      // Попробуем сначала прямой запрос
      addLog('Пробуем прямой запрос fetch...');
      const directData = await directFetchFavorites();
      
      if (directData.length > 0) {
        addLog(`Успешно получено ${directData.length} объектов через прямой запрос.`);
        const mappedProperties = directData.map(convertApiPropertyToUiProperty);
        setProperties(mappedProperties);
      } else {
        // Если прямой запрос не удался, попробуем через сервис
        addLog('Прямой запрос не дал результатов. Пробуем через стандартный сервис...');
        try {
          const favProperties = await getFavoriteProperties();
          addLog(`Получено избранных объектов через сервис: ${favProperties.length}`);
          setProperties(favProperties);
        } catch (serviceError: any) {
          addLog(`Ошибка сервиса: ${serviceError.message}`);
          if (serviceError.response) {
            addLog(`Статус ошибки: ${serviceError.response.status}`);
            addLog(`Данные ошибки: ${JSON.stringify(serviceError.response.data)}`);
          }
          setError('Ошибка при загрузке избранных объектов. Подробности в отладочном логе.');
        }
      }
    } catch (error: any) {
      addLog(`Общая ошибка: ${error.message}`);
      setError('Ошибка при загрузке избранных объектов.');
    } finally {
      setLoading(false);
    }
  };

  // Функция для преобразования API-данных в UI-формат
  const convertApiPropertyToUiProperty = (property: any): Property => {
    // Основное изображение или заглушка
    const mainImage = property.images?.find((img: any) => img.is_main)?.image_url || 
                    property.images?.[0]?.image_url || 
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
    const isForRent = property.transaction_type?.name?.toLowerCase().includes('аренд') || 
                    property.description?.toLowerCase().includes('аренд') ||
                    property.description?.toLowerCase().includes('снять') ||
                    property.description?.toLowerCase().includes('сдать') ||
                    property.description?.toLowerCase().includes('rent');
    
    return {
      id: property.id.toString(),
      image: mainImage,
      price: property.price,
      propertyType: property.property_type?.name || '',
      rooms: roomsText,
      floors: floorsText,
      address: property.address || '',
      metro: metroName,
      isNewBuilding: property.is_new_building || false,
      isCommercial: property.is_commercial || false,
      isForRent: isForRent || false,
      description: property.description || ''
    };
  };

  useEffect(() => {
    // Редирект на страницу логина, если пользователь не авторизован
    if (!isLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/favorites');
      return;
    }

    // Загружаем избранное, когда пользователь авторизован
    if (isAuthenticated && !isLoading) {
      refreshFavorites();
    }
  }, [isAuthenticated, isLoading, router]);

  // Функция для повторной загрузки при ошибке
  const handleRetry = () => {
    refreshFavorites();
  };

  // Тестовая функция для проверки сервера
  const handleTestServer = async () => {
    addLog('Проверка статуса сервера...');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/health`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Сервер работает! Статус: ${JSON.stringify(data)}`);
      } else {
        addLog(`Сервер вернул ошибку: ${response.status}`);
      }
    } catch (error) {
      addLog(`Ошибка при проверке сервера: ${(error as Error).message}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '6rem' }}>
        <div className="category-header">
          <h1 className="category-title">Избранное</h1>
          <div className="flex space-x-2">
            <button 
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Обновить
            </button>
            <button 
              onClick={handleTestServer}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Проверить сервер
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-gray-600">Загрузка избранных объектов...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-6">
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Попробовать снова
            </button>
          </div>
        ) : properties.length > 0 ? (
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                image={property.image}
                price={property.price}
                propertyType={property.propertyType}
                rooms={property.rooms}
                floors={property.floors}
                address={property.address}
                metro={property.metro}
                isFavorited={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg mt-6">
            <svg 
              className="w-16 h-16 text-gray-400 mx-auto mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">У вас пока нет избранных объектов</h3>
            <p className="text-gray-500 mb-4">Добавляйте понравившиеся объекты недвижимости, нажимая на иконку сердечка на карточках.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Перейти к объектам
            </button>
          </div>
        )}

        {/* Блок отладочной информации */}
        <div className="mt-8 p-4 bg-gray-800 text-green-400 rounded-lg font-mono text-sm overflow-auto max-h-96">
          <h2 className="text-white text-lg mb-2">Отладочная информация:</h2>
          {debugLog.length > 0 ? (
            debugLog.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          ) : (
            <p>Нет отладочной информации</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FavoritesPage; 