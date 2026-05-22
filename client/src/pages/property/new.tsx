import React, { useState } from 'react';
import { NextPage } from 'next';
import { Layout } from '../../components/layout/Layout';
import PropertyForm from '../../components/features/property/PropertyForm';
import { AuthModal } from '../../components/features/auth/AuthModal';
import { useAuth } from '../../context/AuthContext';

const NewPropertyPage: NextPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = '';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Create New Property</h1>
        {isAuthenticated ? (
          <PropertyForm />
        ) : (
          <div className="alert alert-info">
            <p>Чтобы создать объявление, необходимо войти в аккаунт.</p>
            <button className="btn btn-primary" onClick={openAuthModal}>
              Войти
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </Layout>
  );
};

export default NewPropertyPage;
