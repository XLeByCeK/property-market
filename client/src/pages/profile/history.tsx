import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { ProfileLayout } from '../../components/layout/ProfileLayout';
import { PropertyCard } from '../../components/features/property/card/PropertyCard';
import { getViewHistory } from '../../services/propertyService';
import { Property } from '../../types/property';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const formatRequestError = (error: any): string => {
  if (error?.response) {
    return `Ошибка сервера: ${error.response.status}. ${
      error.response.data?.error || 'Пожалуйста, попробуйте позже.'
    }`;
  }
  if (error?.request) return 'Нет ответа от сервера. Проверьте подключение к интернету.';
  return `Ошибка: ${error?.message || 'неизвестная ошибка'}`;
};

const EmptyState = () => (
  <div className="text-center my-5 py-5">
    <div className="mb-4">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto text-primary"
      >
        <path
          d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
);

const ProfileHistoryPage: NextPage = () => {
  const { user, isAuthenticated, isLoading } = useRequireAuth('/');
  const [viewHistory, setViewHistory] = useState<Property[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      setErrorMessage(null);
      try {
        const history = await getViewHistory();
        if (cancelled) return;

        if (Array.isArray(history)) {
          setViewHistory(history);
        } else {
          setViewHistory([]);
          setErrorMessage('Не удалось получить данные истории просмотров');
        }
      } catch (error) {
        if (cancelled) return;
        setViewHistory([]);
        setErrorMessage(formatRequestError(error));
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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

  if (!user) return null;

  return (
    <ProfileLayout title="История просмотров" description="История просмотров объектов недвижимости">
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
        <EmptyState />
      )}
    </ProfileLayout>
  );
};

export default ProfileHistoryPage;
