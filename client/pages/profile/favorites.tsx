import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '../../components/layout/Header/Header';
import { Footer } from '../../components/layout/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { Property, getFavoriteProperties } from '../../services/propertyService';
import { PropertyCard } from '../../components/card/PropertyCard';

const ProfileFavoritesPage: NextPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch user favorites
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await getFavoriteProperties();
        setFavorites(response);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Не удалось загрузить избранные объекты. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  if (isLoading || loading) {
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
        <title>Избранное | Property Market</title>
        <meta name="description" content="Избранные объявления пользователя" />
      </Head>

      <Header />

      <main className="container mt-5 mb-5 profile-page">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4 p-3 bg-light rounded shadow-sm mt-5">Избранное</h1>
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
                  <Link href="/profile/favorites" className="list-group-item list-group-item-action active py-3 mb-2">
                    Избранное
                  </Link>
                  <Link href="/profile/history" className="list-group-item list-group-item-action py-3 mb-2">
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
                <h2 className="card-title mb-4 border-bottom pb-2">Избранные объекты</h2>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                {favorites.length === 0 && !loading && !error ? (
                  <div className="text-center my-5">
                    <p className="fs-5 text-muted">У вас пока нет избранных объектов</p>
                    <Link href="/" className="btn btn-primary mt-3">
                      Перейти к поиску объектов
                    </Link>
                  </div>
                ) : (
                  <div className="property-grid">
                    {favorites.map(property => (
                      <PropertyCard
                        key={property.id}
                        id={property.id}
                        image={property.image}
                        price={property.price}
                        propertyType={property.propertyType}
                        rooms={property.rooms}
                        floors={property.floors}
                        address={property.address}
                        metro={property.metro}
                      />
                    ))}
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

export default ProfileFavoritesPage; 