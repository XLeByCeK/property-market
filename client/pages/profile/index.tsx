import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Header } from '../../components/layout/Header/Header';
import { Footer } from '../../components/layout/Footer/Footer';
import { useAuth } from '../../context/AuthContext';

const ProfilePage: NextPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
        <title>Профиль | Property Market</title>
        <meta name="description" content="Личный кабинет пользователя" />
      </Head>

      <Header />

      <main className="container mt-5 mb-5 profile-page">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4 p-3 bg-light rounded shadow-sm">Личный кабинет</h1>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-4 border-bottom pb-2">Навигация</h5>
                <div className="list-group flex-grow-1 nav-pills">
                  <button className="list-group-item list-group-item-action active py-3 mb-2">
                    Личные данные
                  </button>
                  <button className="list-group-item list-group-item-action py-3 mb-2">
                    Избранное
                  </button>
                  <button className="list-group-item list-group-item-action py-3 mb-2">
                    История просмотров
                  </button>
                  <button className="list-group-item list-group-item-action py-3">
                    Мои объявления
                  </button>
                  <div className="flex-grow-1"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title mb-4 border-bottom pb-2">Личные данные</h2>
                
                <div className="row mb-4 p-2 bg-light rounded">
                  <div className="col-sm-3">
                    <p className="text-muted mb-0 fw-bold">Имя:</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="mb-0">{user.first_name || 'Не указано'}</p>
                  </div>
                </div>
                
                <div className="row mb-4 p-2 bg-light rounded">
                  <div className="col-sm-3">
                    <p className="text-muted mb-0 fw-bold">Фамилия:</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="mb-0">{user.last_name || 'Не указано'}</p>
                  </div>
                </div>
                
                <div className="row mb-4 p-2 bg-light rounded">
                  <div className="col-sm-3">
                    <p className="text-muted mb-0 fw-bold">Email:</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="mb-0">{user.email}</p>
                  </div>
                </div>
                
                <div className="mt-5">
                  <button className="btn btn-primary me-2 px-4 py-2">
                    Редактировать профиль
                  </button>
                  <button className="btn btn-outline-secondary px-4 py-2">
                    Изменить пароль
                  </button>
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

export default ProfilePage; 