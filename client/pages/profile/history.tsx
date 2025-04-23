import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '../../components/layout/Header/Header';
import { Footer } from '../../components/layout/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { getViewHistory } from '../../services/propertyService';
import { Property } from '../../services/propertyService';
import { PropertyCard } from '../../components/card/PropertyCard';

const ProfileHistoryPage: NextPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [viewHistory, setViewHistory] = useState<Property[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch view history
  useEffect(() => {
    const fetchViewHistory = async () => {
      if (isAuthenticated) {
        setHistoryLoading(true);
        setErrorMessage(null);
        
        try {
          console.log('Запрос истории просмотров...');
          
          // Добавляем небольшую задержку перед запросом для обеспечения корректного состояния авторизации
          await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 500);
          });
          
          try {
            const history = await getViewHistory();
            console.log('Получена история просмотров:', history);
            
            if (history && Array.isArray(history)) {
              console.log(`Найдено ${history.length} записей в истории просмотров`);
              setViewHistory(history);
            } else {
              console.error('Получены неверные данные истории:', history);
              setViewHistory([]);
              setErrorMessage('Не удалось получить данные истории просмотров');
            }
          } catch (error: any) {
            handleViewHistoryError(error);
          }
        } catch (error: any) {
          handleViewHistoryError(error);
        } finally {
          setHistoryLoading(false);
        }
      }
    };
    
    const handleViewHistoryError = (error: any) => {
      console.error('Error fetching view history:', error);
      setViewHistory([]);
      
      // Получаем подробную информацию об ошибке
      if (error.response) {
        console.error('Ошибка ответа сервера:', error.response.status, error.response.data);
        setErrorMessage(`Ошибка сервера: ${error.response.status}. ${error.response.data?.error || 'Пожалуйста, попробуйте позже.'}`);
      } else if (error.request) {
        console.error('Нет ответа от сервера:', error.request);
        setErrorMessage('Нет ответа от сервера. Проверьте подключение к интернету.');
      } else {
        console.error('Ошибка запроса:', error.message);
        setErrorMessage(`Ошибка: ${error.message}`);
      }
    };

    fetchViewHistory();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This handles the case where useEffect hasn't redirected yet
  }

  return (
    <>
      <Head>
        <title>История просмотров | Property Market</title>
        <meta name="description" content="История просмотров объектов недвижимости" />
      </Head>

      <Header />

      <main className="container mt-5 mb-5 profile-page">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4 p-3 bg-light rounded shadow-sm mt-5">История просмотров</h1>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-4 border-bottom pb-2">Навигация</h5>
                <div className="list-group flex-grow-1 nav-pills">
                  <Link href="/profile" className="list-group-item list-group-item-action py-3 mb-2">
                    Личные данные
                  </Link>
                  <Link href="/profile/favorites" className="list-group-item list-group-item-action py-3 mb-2">
                    Избранное
                  </Link>
                  <Link href="/profile/history" className="list-group-item list-group-item-action active py-3 mb-2">
                    История просмотров
                  </Link>
                  <Link href="/profile/properties" className="list-group-item list-group-item-action py-3">
                    Мои объявления
                  </Link>
                  <div className="flex-grow-1"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title mb-4 border-bottom pb-2">История просмотров объектов</h2>
                
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}
                
                {historyLoading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Загрузка...</span>
                    </div>
                  </div>
                ) : viewHistory.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-2 g-4">
                    {viewHistory.map((property) => (
                      <div className="col" key={property.id}>
                        <PropertyCard
                          id={property.id}
                          image={property.image}
                          price={property.price}
                          propertyType={property.propertyType}
                          rooms={property.rooms}
                          floors={property.floors}
                          address={property.address}
                          metro={property.metro}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center my-5 py-5">
                    <div className="mb-4">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-primary">
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.93 19.07L6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="mb-3">У вас пока нет просмотренных объектов</h3>
                    <p className="text-muted mb-4">
                      Просматривайте объекты недвижимости, чтобы они отображались в истории просмотров.
                    </p>
                    <Link href="/" className="btn btn-primary">
                      Найти объекты
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProfileHistoryPage; 