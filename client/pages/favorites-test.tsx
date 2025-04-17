import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { getFavoriteProperties, toggleFavorite } from '../services/propertyService';

const FavoritesTestPage: NextPage = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [propertyIdToToggle, setPropertyIdToToggle] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (isAuthenticated) {
      addLog(`Authenticated as: ${user?.email}`);
      fetchFavorites();
    } else {
      addLog('Not authenticated. Please login first.');
    }
  }, [isAuthenticated, user]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      addLog('Fetching favorite properties...');
      
      const favorites = await getFavoriteProperties();
      
      addLog(`Received ${favorites.length} favorite properties`);
      
      // Для отладки, добавим ID всех избранных объектов
      if (favorites.length > 0) {
        addLog(`Property IDs: ${favorites.map(prop => prop.id).join(', ')}`);
      } else {
        addLog('No favorite properties found.');
      }
      
      setFavoriteProperties(favorites);
    } catch (error: any) {
      addLog(`Error fetching favorites: ${error.message}`);
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!propertyIdToToggle) {
      addLog('Please enter a property ID');
      return;
    }
    
    try {
      setIsLoading(true);
      addLog(`Toggling favorite status for property ID: ${propertyIdToToggle}`);
      
      const result = await toggleFavorite(propertyIdToToggle);
      
      addLog(`Toggle result: ${result.message} - Favorited: ${result.favorited}`);
      
      // После переключения, обновляем список избранных
      await fetchFavorites();
    } catch (error: any) {
      addLog(`Error toggling favorite: ${error.message}`);
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectAPI = async () => {
    try {
      setIsLoading(true);
      addLog('Making direct API call to /properties/favorites...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        addLog('No authentication token found. Please login first.');
        return;
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_URL}/properties/favorites`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      addLog(`Response status: ${response.status}`);
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        addLog(`Received ${data.length} properties directly from API`);
        
        // Для отладки, выведем подробности первого объекта, если он есть
        if (data.length > 0) {
          const firstProperty = data[0];
          addLog(`First property details: ID=${firstProperty.id}, Title=${firstProperty.title}`);
        }
      } else {
        addLog(`Unexpected response format: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      addLog(`Error making direct API call: ${error.message}`);
      console.error('Error making direct API call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '6rem' }}>
        <h1 className="text-2xl font-bold mb-4">Тест API Избранных Объектов</h1>
        
        <div className="bg-white shadow-md rounded p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Статус Аутентификации</h2>
            <div className={`p-2 rounded ${isAuthenticated ? 'bg-green-100' : 'bg-red-100'}`}>
              {isAuthenticated ? (
                <div>
                  <p><strong>Статус:</strong> Авторизован</p>
                  {user && (
                    <>
                      <p><strong>ID пользователя:</strong> {user.id}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Имя:</strong> {user.firstName} {user.lastName}</p>
                    </>
                  )}
                </div>
              ) : (
                <p><strong>Статус:</strong> Не авторизован</p>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Управление Избранным</h2>
            
            <div className="flex items-center mb-3">
              <input
                type="text"
                value={propertyIdToToggle}
                onChange={(e) => setPropertyIdToToggle(e.target.value)}
                placeholder="ID объекта"
                className="p-2 border rounded mr-2"
              />
              
              <button
                onClick={handleToggleFavorite}
                disabled={isLoading || !isAuthenticated}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Загрузка...' : 'Переключить избранное'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchFavorites}
                disabled={isLoading || !isAuthenticated}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Загрузка...' : 'Обновить список избранных'}
              </button>
              
              <button
                onClick={testDirectAPI}
                disabled={isLoading || !isAuthenticated}
                className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Загрузка...' : 'Прямой вызов API'}
              </button>
              
              <button
                onClick={clearLogs}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Очистить логи
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Избранные объекты ({favoriteProperties.length})</h2>
            {favoriteProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteProperties.map((property) => (
                  <div key={property.id} className="border rounded p-3">
                    <p><strong>ID:</strong> {property.id}</p>
                    <p><strong>Тип:</strong> {property.propertyType}</p>
                    <p><strong>Цена:</strong> {property.price} ₽</p>
                    <p><strong>Адрес:</strong> {property.address}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Нет избранных объектов.</p>
            )}
          </div>
        </div>
        
        <div className="bg-black rounded p-4 text-green-400 font-mono h-96 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2 text-white">Логи</h2>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          ) : (
            <p>Логи пока отсутствуют.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FavoritesTestPage; 