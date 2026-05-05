import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { PropertyCard } from '../components/card/PropertyCard';
import { Property, getFavoriteProperties } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

const FavoritesPage: NextPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Функция для обновления данных через сервис
  const refreshFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const favProperties = await getFavoriteProperties();
      setProperties(favProperties);
    } catch (error: any) {
      console.error('Ошибка при загрузке избранных объектов:', error);
      setError('Ошибка при загрузке избранных объектов.');
    } finally {
      setLoading(false);
    }
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '6rem' }}>
        <div className="category-detail-header">
          <Link href="/" className="back-button" style={{ transform: 'none' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <h1 className="category-title m-0">Избранное</h1>
          <Link href="/profile/favorites" className="btn btn-outline-primary ms-auto">
            Управление избранным в профиле
          </Link>
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
              onClick={refreshFavorites}
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
      </div>
    </Layout>
  );
};

export default FavoritesPage; 