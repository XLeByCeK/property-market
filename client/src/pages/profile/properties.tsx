import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { ProfileLayout } from '../../components/layout/ProfileLayout';
import api from '../../services/api';
import { getMainImageUrl } from '../../utils/imageUrl';
import { formatDate } from '../../utils/formatters';
import { useRequireAuth } from '../../hooks/useRequireAuth';

interface UserPropertyListItem {
  id: number;
  title: string;
  price: number;
  address: string;
  status: string;
  created_at: string;
  images: Array<{ id: number; image_url: string; is_main: boolean }>;
  property_type: { id: number; name: string };
  transaction_type: { id: number; name: string };
}

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  active: { className: 'bg-success', label: 'Активно' },
  inactive: { className: 'bg-secondary', label: 'Неактивно' },
  sold: { className: 'bg-danger', label: 'Продано' },
};

const getStatusBadge = (status: string) =>
  STATUS_BADGE[status.toLowerCase()] ?? { className: 'bg-info', label: status };

const ProfilePropertiesPage: NextPage = () => {
  const { user, isLoading } = useRequireAuth('/');
  const [properties, setProperties] = useState<UserPropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = (await api.properties.getUserProperties()) as UserPropertyListItem[];
        if (!cancelled) setProperties(response);
      } catch (err) {
        console.error('Error fetching properties:', err);
        if (!cancelled) setError('Failed to load your properties. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) return;
    try {
      await api.properties.delete(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting property:', err);
      alert('Не удалось удалить объявление. Попробуйте позже.');
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

  if (!user) return null;

  return (
    <ProfileLayout
      title="Мои объявления"
      description="Управление объявлениями пользователя"
      headerAction={
        <Link href="/property/new" className="btn btn-primary mb-4 mt-5">
          <i className="fas fa-plus me-2" /> Создать объявление
        </Link>
      }
    >
      <h2 className="card-title mb-4 border-bottom pb-2">Управление объявлениями</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {properties.length === 0 && !error ? (
        <div className="text-center my-5">
          <p className="fs-5 text-muted">У вас пока нет объявлений</p>
          <Link href="/property/new" className="btn btn-primary mt-3">
            Создать первое объявление
          </Link>
        </div>
      ) : (
        <div
          className="properties-list"
          style={{ maxHeight: '600px', overflowY: 'auto', padding: '10px 5px' }}
        >
          {properties.map((property) => {
            const badge = getStatusBadge(property.status);
            return (
              <div key={property.id} className="property-item card mb-3">
                <div className="row g-0">
                  <div className="col-md-3">
                    <img
                      src={getMainImageUrl(property.images)}
                      className="img-fluid rounded-start property-img"
                      alt={property.title}
                      style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                    />
                  </div>
                  <div className="col-md-9">
                    <div className="card-body py-2 px-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title mb-1">{property.title}</h5>
                        <span className={`badge ${badge.className}`}>{badge.label}</span>
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
                          onClick={() => handleDelete(property.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ProfileLayout>
  );
};

export default ProfilePropertiesPage;
