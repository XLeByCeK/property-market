import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Layout } from '../../../components/layout/Layout';
import PropertyForm from '../../../components/features/property/PropertyForm';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { PropertyFormData, PropertyFromAPI } from '../../../types/property';
import * as propertyService from '../../../services/propertyService';

const EditPropertyPage: NextPage = () => {
  const { isAuthenticated, isLoading, user } = useRequireAuth('/login');
  const router = useRouter();
  const { id } = router.query;

  const [error, setError] = useState<string | null>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [formData, setFormData] = useState<PropertyFormData | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    (async () => {
      try {
        setPropertyLoading(true);
        const property = (await propertyService.getPropertyById(
          Number(id)
        )) as PropertyFromAPI;
        if (cancelled) return;

        const ownerId = (property as any).user_id;
        if (user && ownerId !== user.id && user.role !== 'ADMIN') {
          setError('You are not authorized to edit this property');
          setTimeout(() => router.push('/profile/properties'), 3000);
          return;
        }
        setFormData(propertyService.transformPropertyToFormData(property));
      } catch (err) {
        console.error('Error fetching property:', err);
        if (!cancelled) setError('Failed to load property data');
      } finally {
        if (!cancelled) setPropertyLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, router, user]);

  if (isLoading || propertyLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="error-message">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!formData) {
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
        <PropertyForm propertyId={Number(id)} initialData={formData} />
      </div>
    </Layout>
  );
};

export default EditPropertyPage;
