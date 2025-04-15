import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Layout } from '../../../components/layout/Layout';
import PropertyForm from '../../../components/property/PropertyForm';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

// Interface for API property data
interface PropertyData {
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
  property_type_id: number;
  transaction_type_id: number;
  city_id: number;
  district_id?: number;
  metro_id?: number;
  metro_distance?: number;
  is_new_building: boolean;
  is_commercial: boolean;
  is_country: boolean;
  user_id: number;
  images: Array<{
    id: number;
    image_url: string;
    is_main: boolean;
    order: number;
  }>;
}

// Interface for form property data
interface PropertyFormData {
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

// Convert API property data to form format
const mapPropertyDataToFormData = (property: PropertyData): PropertyFormData => {
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

const EditPropertyPage: NextPage = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState<string | null>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [formData, setFormData] = useState<PropertyFormData | null>(null);

  // Fetch property data
  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        setPropertyLoading(true);
        const propertyData = await api.properties.getById(Number(id)) as PropertyData;
        setProperty(propertyData);
        setFormData(mapPropertyDataToFormData(propertyData));
        
        // Check if user is authorized to edit this property
        if (user && propertyData.user_id !== user.id && user.role !== 'ADMIN') {
          setError('You are not authorized to edit this property');
          setTimeout(() => {
            router.push('/profile/properties');
          }, 3000);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property data');
      } finally {
        setPropertyLoading(false);
      }
    };

    fetchProperty();
  }, [id, router, user]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || propertyLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="error-message">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!property || !formData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="error-message">Property not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Edit Property</h1>
        <PropertyForm 
          propertyId={Number(id)} 
          initialData={formData}
        />
      </div>
    </Layout>
  );
};

export default EditPropertyPage; 