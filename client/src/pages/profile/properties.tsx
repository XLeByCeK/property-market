import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '../../components/layout/Header/Header';
import { Footer } from '../../components/layout/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Property {
  id: number;
  title: string;
  price: number;
  address: string;
  status: string;
  created_at: string;
  images: Array<{
    id: number;
    image_url: string;
    is_main: boolean;
  }>;
  property_type: {
    id: number;
    name: string;
  };
  transaction_type: {
    id: number;
    name: string;
  };
}

const ProfilePropertiesPage: NextPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch user properties
  useEffect(() => {
    if (!user) return;

    const fetchProperties = async () => {
      try {
        setLoading(true);
        // This endpoint would need to be implemented
        const response = await api.properties.getUserProperties();
        setProperties(response as Property[]);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load your properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  // Get main image URL or placeholder
  const getMainImage = (property: Property) => {
    const mainImage = property.images.find(img => img.is_main);
    return mainImage ? mainImage.image_url : '/images/null-image.jpg';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'sold':
        return 'bg-danger';
      default:
        return 'bg-info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Активно';
      case 'inactive':
        return 'Неактивно';
      case 'sold':
        return 'Продано';
      default:
        return status;
    }
  };

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
        <title>Мои объявления | Property Market</title>
        <meta name="description" content="Управление объявлениями пользователя" />
      </Head>

      <Header />

      <main className="container mt-5 mb-5 profile-page">
        <div className="row">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h1 className="mb-4 p-3 bg-light rounded shadow-sm mt-5">Мои объявления</h1>
            <Link href="/property/new" className="btn btn-primary mb-4 mt-5">
              <i className="fas fa-plus me-2"></i> Создать объявление
            </Link>
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
                  <Link href="/profile/history" className="list-group-item list-group-item-action py-3 mb-2">
                    История просмотров
                  </Link>
                  <Link href="/profile/properties" className="list-group-item list-group-item-action active py-3">
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
                <h2 className="card-title mb-4 border-bottom pb-2">Управление объявлениями</h2>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                {properties.length === 0 && !loading && !error ? (
                  <div className="text-center my-5">
                    <p className="fs-5 text-muted">У вас пока нет объявлений</p>
                    <Link href="/property/new" className="btn btn-primary mt-3">
                      Создать первое объявление
                    </Link>
                  </div>
                ) : (
                  <div className="properties-list" style={{ maxHeight: '600px', overflowY: 'auto', padding: '10px 5px' }}>
                    {properties.map(property => (
                      <div key={property.id} className="property-item card mb-3">
                        <div className="row g-0">
                          <div className="col-md-3">
                            <img 
                              src={getMainImage(property)} 
                              className="img-fluid rounded-start property-img" 
                              alt={property.title}
                              style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                            />
                          </div>
                          <div className="col-md-9">
                            <div className="card-body py-2 px-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <h5 className="card-title mb-1">{property.title}</h5>
                                <span className={`badge ${getStatusBadgeClass(property.status)}`}>
                                  {getStatusText(property.status)}
                                </span>
                              </div>
                              <p className="card-text text-primary fw-bold mb-1">
                                {property.price.toLocaleString()} ₽
                              </p>
                              <p className="card-text mb-1">
                                <small className="text-muted">
                                  {property.property_type.name}, {property.transaction_type.name}
                                </small>
                              </p>
                              <p className="card-text mb-1">{property.address}</p>
                              <p className="card-text mb-2">
                                <small className="text-muted">
                                  Создано: {formatDate(property.created_at)}
                                </small>
                              </p>
                              <div className="d-flex">
                                <Link 
                                  href={`/property/${property.id}`} 
                                  className="btn btn-sm btn-outline-secondary me-2"
                                >
                                  Просмотреть
                                </Link>
                                <Link 
                                  href={`/property/edit/${property.id}`} 
                                  className="btn btn-sm btn-outline-primary me-2"
                                >
                                  Редактировать
                                </Link>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    // This would need additional implementation for confirmation
                                    if (window.confirm('Вы уверены, что хотите удалить это объявление?')) {
                                      api.properties.delete(property.id)
                                        .then(() => {
                                          setProperties(properties.filter(p => p.id !== property.id));
                                        })
                                        .catch(err => {
                                          console.error('Error deleting property:', err);
                                          alert('Не удалось удалить объявление. Попробуйте позже.');
                                        });
                                    }
                                  }}
                                >
                                  Удалить
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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

export default ProfilePropertiesPage; 