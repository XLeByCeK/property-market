import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Layout } from '../../components/layout/Layout';
import { PropertyCard } from '../../components/card/PropertyCard';
import { getNewBuildings, getPropertiesForSale, getPropertiesForRent, Property } from '../../services/propertyService';

// Define category types and their respective titles
const categoryConfig = {
  'new-buildings': {
    title: 'Новостройки',
    fetchFunction: getNewBuildings
  },
  'buy': {
    title: 'Купить',
    fetchFunction: getPropertiesForSale
  },
  'rent': {
    title: 'Снять',
    fetchFunction: getPropertiesForRent
  }
};

type CategoryType = keyof typeof categoryConfig;

const CategoryPage = () => {
  const router = useRouter();
  const { type } = router.query;
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the title based on the category
  const getTitle = () => {
    if (!type || typeof type !== 'string') return 'Категория';
    return categoryConfig[type as CategoryType]?.title || 'Категория';
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!type || typeof type !== 'string') return;
      
      if (!Object.keys(categoryConfig).includes(type)) {
        setError('Категория не найдена');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Get the appropriate fetch function for this category
        const fetchFunction = categoryConfig[type as CategoryType].fetchFunction;
        // Fetch more properties for the category page (limit 24)
        const data = await fetchFunction(24);
        
        setProperties(data);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Не удалось загрузить объекты недвижимости. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    if (type) {
      fetchData();
    }
  }, [type]);
  
  return (
    <Layout>
      <Head>
        <title>{getTitle()} | Property Market</title>
        <meta 
          name="description" 
          content={`Недвижимость в категории ${getTitle()} - Property Market`} 
        />
      </Head>
      
      <div className="container mt-5 pt-4">
        <div className="category-header d-flex align-items-center mb-4">
          <Link href="/" className="back-button me-3">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="category-title m-0">{getTitle()}</h1>
        </div>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {properties.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted">В данной категории пока нет объектов недвижимости</p>
              </div>
            ) : (
              <div className="property-grid">
                {properties.map(property => (
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
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage; 