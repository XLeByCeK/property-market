import React from 'react';
import { NextPage } from 'next';
import { Layout } from '../../components/layout/Layout';
import PropertyForm from '../../components/features/property/PropertyForm';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const NewPropertyPage: NextPage = () => {
  const { isAuthenticated, isLoading } = useRequireAuth('/login');

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Create New Property</h1>
        <PropertyForm />
      </div>
    </Layout>
  );
};

export default NewPropertyPage;
