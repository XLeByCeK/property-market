import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '../../components/layout/Layout';
import { PropertyImageCarousel } from '../../components/property/PropertyImageCarousel';
import { PropertyInfo } from '../../components/property/PropertyInfo';
import { PropertyContactCard } from '../../components/property/PropertyContactCard';
import { YandexMap } from '../../components/property/YandexMap';
import { getPropertyById, PropertyDetails } from '../../services/propertyService';

const PropertyPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock coordinates for yandex map since we don't have real coordinates in the API
  const [coordinates, setCoordinates] = useState({ lat: 55.753215, lng: 37.622504 }); // Moscow center by default
  
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Handle the case where id could be an array
        const propertyId = Array.isArray(id) ? id[0] : id;
        
        // Try to fetch from API
        try {
          const data = await getPropertyById(Number(propertyId)) as PropertyDetails;
          
          if (data) {
            setProperty(data);
            
            // In a real app, we would get coordinates from the API
            setCoordinates({
              lat: 55.753215 + (Math.random() * 0.1 - 0.05),
              lng: 37.622504 + (Math.random() * 0.1 - 0.05)
            });
          } else {
            throw new Error('Property data is empty');
          }
        } catch (apiError: any) {
          console.error('API error:', apiError);
          
          // If in development mode, load mock data
          if (process.env.NODE_ENV === 'development') {
            console.log('Loading mock data in development mode');
            loadMockData(propertyId);
          } else {
            // In production, show the error
            throw apiError;
          }
        }
      } catch (err) {
        console.error('Failed to fetch property details:', err);
        setError('Не удалось загрузить данные об объекте недвижимости');
      } finally {
        // Always set loading to false regardless of result
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id]);
  
  // Extracted the mock data creation to a separate function
  const loadMockData = (propertyId: string | number) => {
    const mockProperty: PropertyDetails = {
      id: Number(propertyId),
      title: 'ЖК "Современный"',
      description: 'Просторная светлая квартира в новом жилом комплексе. Отличная планировка, качественная отделка, панорамные окна с видом на город. Развитая инфраструктура: школы, детские сады, магазины в шаговой доступности.',
      price: 12500000,
      area: 72,
      rooms: 2,
      floor: 8,
      total_floors: 24,
      address: 'г. Москва, ул. Пушкина, д. 10, корп. 2',
      year_built: 2022,
      property_type: {
        id: 1,
        name: 'Квартира'
      },
      transaction_type: {
        id: 1,
        name: 'Продажа'
      },
      city: {
        id: 1,
        name: 'Москва'
      },
      district: {
        id: 1,
        name: 'Центральный'
      },
      metro_station: {
        id: 1,
        name: 'Охотный ряд',
        color: 'red'
      },
      metro_distance: 7,
      is_new_building: true,
      is_commercial: false,
      is_country: false,
      user: {
        id: 1,
        first_name: 'Иван',
        last_name: 'Петров',
        phone: '+7 (999) 123-45-67'
      },
      images: [
        {
          id: 1,
          image_url: '/images/null-image.jpg',
          is_main: true,
          order: 0
        },
        {
          id: 2,
          image_url: '/images/null-image.jpg',
          is_main: false,
          order: 1
        },
        {
          id: 3,
          image_url: '/images/null-image.jpg',
          is_main: false,
          order: 2
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Set random coordinates for Moscow area
    setCoordinates({
      lat: 55.753215 + (Math.random() * 0.1 - 0.05),
      lng: 37.622504 + (Math.random() * 0.1 - 0.05)
    });
    
    setProperty(mockProperty);
    setLoading(false);
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      );
    }
    
    if (!property) {
      return (
        <div className="alert alert-warning" role="alert">
          Объект недвижимости не найден
        </div>
      );
    }
    
    return (
      <>
        <div className="property-details-container">
          <div className="property-details-main">
            <PropertyInfo property={property} />
            <PropertyImageCarousel images={property.images} />
            <div className="property-description">
              <h2 className="section-title">О доме</h2>
              <div className="property-details-grid">
                {property.area && (
                  <div className="property-detail-item">
                    <span className="detail-label">Площадь</span>
                    <span className="detail-value">{property.area} м²</span>
                  </div>
                )}
                
                {property.rooms && (
                  <div className="property-detail-item">
                    <span className="detail-label">Комнаты</span>
                    <span className="detail-value">{property.rooms}</span>
                  </div>
                )}
                
                {property.floor && (
                  <div className="property-detail-item">
                    <span className="detail-label">Этаж</span>
                    <span className="detail-value">
                      {property.floor}{property.total_floors ? `/${property.total_floors}` : ''}
                    </span>
                  </div>
                )}
                
                {property.year_built && (
                  <div className="property-detail-item">
                    <span className="detail-label">Год постройки</span>
                    <span className="detail-value">{property.year_built}</span>
                  </div>
                )}
                
                {property.is_new_building && (
                  <div className="property-detail-item">
                    <span className="detail-label">Тип</span>
                    <span className="detail-value">Новостройка</span>
                  </div>
                )}
              </div>
              
              {!property.is_new_building && property.year_built && (
                <p className="property-building-info">
                  Год постройки: {property.year_built}
                </p>
              )}
            </div>
            
            {property.description && (
              <div className="property-description-text">
                <h2 className="section-title">Описание</h2>
                <p>{property.description}</p>
              </div>
            )}
            
            {coordinates && (
              <YandexMap 
                latitude={coordinates.lat} 
                longitude={coordinates.lng} 
                address={property.address} 
              />
            )}
          </div>
          
          <div className="property-details-sidebar">
            <PropertyContactCard property={property} />
          </div>
        </div>
      </>
    );
  };
  
  // Create a title based on property data
  const getPageTitle = () => {
    if (!property) return 'Загрузка... | Property Market';
    
    if (property.is_new_building && property.title) {
      return `${property.title} | Property Market`;
    }
    
    return `${property.property_type.name}, ${property.rooms}-комн., ${property.floor || ''} этаж | Property Market`;
  };
  
  return (
    <Layout>
      <Head>
        <title>{getPageTitle()}</title>
        <meta name="description" content={property?.description?.substring(0, 160) || 'Описание объекта недвижимости'} />
      </Head>
      
      <main className="container property-details-page">
        {renderContent()}
      </main>
    </Layout>
  );
};

export default PropertyPage; 