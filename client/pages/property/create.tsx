import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '../../components/layout/Layout';
import PropertyForm from '../../components/property/PropertyForm';
import { useAuth } from '../../context/AuthContext';

const CreatePropertyPage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Проверяем авторизацию для доступа к странице
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      router.push('/login?returnUrl=/property/create');
    }
  }, [isAuthenticated, isLoading, router]);

  // Если проверка авторизации еще выполняется, показываем индикатор загрузки
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

  // Если пользователь не авторизован, не показываем форму
  if (!isAuthenticated) {
    return null;
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
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
          <PropertyForm />
        </div>
      </div>
    </Layout>
  );
};

export default CreatePropertyPage; 