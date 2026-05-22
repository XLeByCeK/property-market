import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '../../components/layout/Layout';
import PropertyForm from '../../components/features/property/PropertyForm';
import { AuthModal } from '../../components/features/auth/AuthModal';
import { useAuth } from '../../context/AuthContext';

const CreatePropertyPage: NextPage = () => {
  const router = useRouter();
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
        <div className="container mx-auto px-4 py-8" style={{ paddingTop: '6rem' }}>
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-gray-600">Загрузка...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Разместить объявление - Property Market</title>
        <meta 
          name="description" 
          content="Разместите своё объявление о продаже или аренде недвижимости на Property Market" 
        />
      </Head>
      
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: '6rem' }}>
        <div className="category-detail-header">
          <button
            onClick={() => router.back()}
            className="back-button"
            aria-label="Назад"
          >
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
          </button>
          <h1 className="category-title m-0">Разместить объявление</h1>
        </div>

        {isAuthenticated ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
            <PropertyForm />
          </div>
        ) : (
          <div className="alert alert-info">
            <p>Чтобы разместить объявление, необходимо войти в аккаунт.</p>
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

export default CreatePropertyPage; 