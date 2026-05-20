import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

/**
 * Перенаправляет неавторизованного пользователя на `redirectTo`.
 * Раньше эти 5 строк копировались в каждой странице профиля и листинга.
 */
export const useRequireAuth = (redirectTo: string = '/') => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [auth.isAuthenticated, auth.isLoading, redirectTo, router]);

  return auth;
};
