import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { PropertyCard } from '../components/card/PropertyCard';
import { Property, mapPropertyFromAPI } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FavoritesPage: NextPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/favorites');
    }

    if (isAuthenticated) {
      // Fetch favorites
      const fetchFavorites = async () => {
        try {
          setLoading(true);
          console.log('Fetching favorites...');
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No authentication token available');
            router.push('/login?returnUrl=/favorites');
            return;
          }
          
          const response = await axios.get(`${API_URL}/properties/favorites`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          
          console.log('Got favorites response:', response.data);
          
          if (Array.isArray(response.data)) {
            const mappedProperties = response.data.map(mapPropertyFromAPI);
            setProperties(mappedProperties);
            console.log('Mapped properties:', mappedProperties.length);
          } else {
            console.error('Invalid response format:', response.data);
            setProperties([]);
          }
        } catch (error: any) {
          console.error('Error fetching favorites:', error);
          if (error.response?.status === 401) {
            // Handle unauthorized access
            console.warn('Authentication expired');
            router.push('/login?returnUrl=/favorites');
          } else {
            setProperties([]);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchFavorites();
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '6rem' }}>
        <div className="category-header">
          <h1 className="category-title">Избранное</h1>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
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
          <div className="empty-state">
            <p>У вас пока нет избранных объектов недвижимости.</p>
            <p>Добавляйте понравившиеся объекты в избранное, нажимая на иконку сердечка.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage; 