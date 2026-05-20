import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { ProfileLayout } from '../../components/layout/ProfileLayout';
import { PropertyCard } from '../../components/features/property/card/PropertyCard';
import { getFavoriteProperties } from '../../services/propertyService';
import { Property } from '../../types/property';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const ProfileFavoritesPage: NextPage = () => {
  const { user, isLoading } = useRequireAuth('/');
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await getFavoriteProperties();
        if (!cancelled) setFavorites(response);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        if (!cancelled) setError('Не удалось загрузить избранные объекты. Пожалуйста, попробуйте позже.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  if (!user) return null;

  return (
    <ProfileLayout title="Избранное" description="Избранные объявления пользователя">
      <h2 className="card-title mb-4 border-bottom pb-2">Избранные объекты</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {favorites.length === 0 && !error ? (
        <div className="text-center my-5">
          <p className="fs-5 text-muted">У вас пока нет избранных объектов</p>
          <Link href="/" className="btn btn-primary mt-3">
            Перейти к поиску объектов
          </Link>
        </div>
      ) : (
        <div className="property-grid">
          {favorites.map((property) => (
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
    </ProfileLayout>
  );
};

export default ProfileFavoritesPage;
