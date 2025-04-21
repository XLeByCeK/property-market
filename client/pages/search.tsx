import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '../components/layout/Layout';
import { PropertyCardAdapter } from '../components/card/PropertyCardAdapter';
import { Property, searchProperties } from '../services/propertyService';

const SearchPage: React.FC = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Ждем, пока router будет готов
    if (!router.isReady) return;

    const { 
      mode, 
      propertyTypeId, 
      transactionTypeId,
      rooms, 
      priceFrom, 
      priceTo,
      areaFrom,
      areaTo,
      floor,
      totalFloors,
      address, 
      cityId,
      districtId,
      metroId,
      metroDistance,
      isNewBuilding,
      isCommercial,
      isCountry,
      guests,
      checkIn,
      checkOut
    } = router.query;

    // Формируем строку для отображения параметров поиска
    const queryParts = [];
    if (mode) queryParts.push(`режим: ${getSearchModeText(mode as string)}`);
    if (propertyTypeId) queryParts.push(`тип недвижимости: ${propertyTypeId}`);
    if (transactionTypeId) queryParts.push(`тип сделки: ${transactionTypeId}`);
    if (rooms) queryParts.push(`комнаты: ${rooms}`);
    if (priceFrom || priceTo) {
      const priceRange = [];
      if (priceFrom) priceRange.push(`от ${priceFrom} ₽`);
      if (priceTo) priceRange.push(`до ${priceTo} ₽`);
      queryParts.push(`цена: ${priceRange.join(' ')}`);
    }
    if (areaFrom || areaTo) {
      const areaRange = [];
      if (areaFrom) areaRange.push(`от ${areaFrom} м²`);
      if (areaTo) areaRange.push(`до ${areaTo} м²`);
      queryParts.push(`площадь: ${areaRange.join(' ')}`);
    }
    if (floor) queryParts.push(`этаж: ${floor}`);
    if (totalFloors) queryParts.push(`этажей в доме: ${totalFloors}`);
    if (address) queryParts.push(`адрес: ${address}`);
    if (cityId) queryParts.push(`город: ${cityId}`);
    if (districtId) queryParts.push(`район: ${districtId}`);
    if (metroId) queryParts.push(`метро: ${metroId}`);
    if (metroDistance) queryParts.push(`расстояние до метро: ${metroDistance} м`);
    
    // Булевы параметры
    if (isNewBuilding === 'true') queryParts.push('новостройка');
    if (isCommercial === 'true') queryParts.push('коммерческая недвижимость');
    if (isCountry === 'true') queryParts.push('загородная недвижимость');
    
    // Для посуточной аренды
    if (guests) queryParts.push(`гостей: ${guests}`);
    if (checkIn) queryParts.push(`заезд: ${checkIn}`);
    if (checkOut) queryParts.push(`выезд: ${checkOut}`);

    setSearchQuery(queryParts.join(', '));

    // Выполняем поиск
    performSearch();
  }, [router.isReady, router.query]);

  const getSearchModeText = (mode: string): string => {
    switch (mode) {
      case 'buy': return 'Покупка';
      case 'rent': return 'Аренда';
      case 'daily': return 'Посуточно';
      default: return mode;
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Формируем параметры для запроса
      const params: Record<string, any> = {};
      
      // Добавляем все параметры из query, но фильтруем пустые значения
      Object.entries(router.query).forEach(([key, value]) => {
        if (value && value !== '') {
          // Преобразуем строковые boolean в настоящие boolean
          if (value === 'true') {
            params[key] = true;
          } else if (value === 'false') {
            params[key] = false;
          } else {
            params[key] = value;
          }
        }
      });

      console.log('Searching with params:', params);

      // Выполняем запрос через сервис
      const results = await searchProperties(params);
      setProperties(results);
    } catch (err) {
      console.error('Error searching properties:', err);
      setError('Не удалось выполнить поиск. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Результаты поиска | Property Market</title>
        <meta name="description" content="Результаты поиска недвижимости" />
      </Head>

      <main className="container mt-5">
        <h1 className="mb-4">Найдено по вашему запросу</h1>
        {searchQuery && <p className="text-muted mb-4">Параметры поиска: {searchQuery}</p>}

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : properties.length === 0 ? (
          <div className="alert alert-info">
            По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {properties.map((property) => (
              <div key={property.id} className="col">
                <PropertyCardAdapter property={property} />
              </div>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default SearchPage; 