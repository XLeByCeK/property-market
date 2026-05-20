import React from 'react';
import { NextPage } from 'next';
import { ProfileLayout } from '../../components/layout/ProfileLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const ROLE_LABELS: Record<string, string> = {
  BUYER: 'Покупатель',
  SELLER: 'Продавец',
  ADMIN: 'Администратор',
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="row mb-4 p-2 bg-light rounded">
    <div className="col-sm-3">
      <p className="text-muted mb-0 fw-bold">{label}</p>
    </div>
    <div className="col-sm-9">
      <p className="mb-0">{value || 'Не указано'}</p>
    </div>
  </div>
);

const Spinner = () => (
  <div className="container mt-5 text-center">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Загрузка...</span>
    </div>
  </div>
);

const ProfilePage: NextPage = () => {
  const { user, isLoading } = useRequireAuth('/');

  if (isLoading) return <Spinner />;
  if (!user) return null;

  return (
    <ProfileLayout title="Личный кабинет" description="Личный кабинет пользователя">
      <h2 className="card-title mb-4 border-bottom pb-2">Личные данные</h2>

      <InfoRow label="Имя:" value={user.firstName} />
      <InfoRow label="Фамилия:" value={user.lastName} />
      <InfoRow label="Email:" value={user.email} />
      <InfoRow label="Роль:" value={ROLE_LABELS[user.role] ?? user.role} />

      <div className="mt-5">
        <button className="btn btn-primary me-2 px-4 py-2 mb-2 mb-md-0">
          Редактировать профиль
        </button>
        <button className="btn btn-outline-secondary px-4 py-2">Изменить пароль</button>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
