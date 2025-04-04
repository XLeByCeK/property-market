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

      <main className="container mt-4 mb-5">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">Личный кабинет</h1>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Навигация</h5>
                <div className="list-group">
                  <button className="list-group-item list-group-item-action active">
                    Личные данные
                  </button>
                  <button className="list-group-item list-group-item-action">
                    Избранное
                  </button>
                  <button className="list-group-item list-group-item-action">
                    История просмотров
                  </button>
                  <button className="list-group-item list-group-item-action">
                    Мои объявления
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title mb-4">Личные данные</h2>
                
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <p className="text-muted mb-0">Имя:</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="mb-0">{user.first_name || 'Не указано'}</p>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <p className="text-muted mb-0">Фамилия:</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="mb-0">{user.last_name || 'Не указано'}</p>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <p className="text-muted mb-0">Email:</p>
                  </div>
                  <div className="col-sm-9">
                    <p className="mb-0">{user.email}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="btn btn-primary me-2">
                    Редактировать профиль
                  </button>
                  <button className="btn btn-outline-secondary">
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