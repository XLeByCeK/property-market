import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '../../components/layout/Header/Header';
import { Footer } from '../../components/layout/Footer/Footer';
import { useAuth } from '../../context/AuthContext';

const ProfileHistoryPage: NextPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

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
                  <h3 className="mb-3">Скоро появится!</h3>
                  <p className="text-muted mb-4">
                    Мы работаем над разделом истории просмотров объектов недвижимости. 
                    Скоро вы сможете видеть здесь ранее просмотренные объявления.
                  </p>
                  <Link href="/" className="btn btn-primary">
                    Вернуться на главную
                  </Link>
                </div>
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