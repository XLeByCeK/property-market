import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { SearchBanner } from '../components/layout/SearchBanner/SearchBanner';
import { PropertyCategory } from '../components/category/PropertyCategory';
import { getNewBuildings, getPropertiesForSale, getPropertiesForRent, Property } from '../services/propertyService';
import { CityProvider } from '../context/CityContext';

export default function Home() {
  const [newBuildingsData, setNewBuildingsData] = useState<Property[]>([]);
  const [forSaleData, setForSaleData] = useState<Property[]>([]);
  const [forRentData, setForRentData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Параллельная загрузка всех типов недвижимости
        const [newBuildings, propertiesForSale, propertiesForRent] = await Promise.all([
          getNewBuildings(8),
          getPropertiesForSale(8),
          getPropertiesForRent(8)
        ]);

        setNewBuildingsData(newBuildings);
        setForSaleData(propertiesForSale);
        setForRentData(propertiesForRent);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Не удалось загрузить данные о недвижимости. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <CityProvider>
      <Layout>
        <SearchBanner backgroundImage="/images/banner-bg.jpg" />
        
        <main className="container">
          {error && (
            <div className="alert alert-danger mt-4">{error}</div>
          )}

          {loading ? (
            <div className="text-center mt-5 pt-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : (
            <>
              <PropertyCategory 
                title="Новостройки" 
                properties={newBuildingsData}
                link="/new-buildings"
              />
              
              <PropertyCategory 
                title="Купить" 
                properties={forSaleData}
                link="/buy"
              />
              
              <PropertyCategory 
                title="Снять" 
                properties={forRentData}
                link="/rent"
              />
            </>
          )}
        </main>
      </Layout>
    </CityProvider>
  );
} 