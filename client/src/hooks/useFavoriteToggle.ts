import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isPropertyFavorited, toggleFavorite } from '../services/propertyService';

interface UseFavoriteToggleOptions {
  propertyId: string | number | undefined;
  initialFavorited?: boolean;
  /** Открыть модал авторизации, если пользователь не залогинен. */
  onUnauthorized?: () => void;
}

/**
 * Инкапсулирует логику работы с «избранным» для карточки/детальной страницы:
 *  - подгружает текущий статус из API при появлении user;
 *  - возвращает обработчик toggle, защищённый от двойного клика;
 *  - открывает модал авторизации, если пользователь не залогинен.
 *
 * До этого один и тот же код жил в PropertyCard и PropertyContactCard.
 */
export const useFavoriteToggle = ({
  propertyId,
  initialFavorited = false,
  onUnauthorized,
}: UseFavoriteToggleOptions) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialFavorited);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || propertyId === undefined || propertyId === null) return;

    let cancelled = false;
    (async () => {
      const favorited = await isPropertyFavorited(propertyId).catch(() => false);
      if (!cancelled) setIsFavorite(favorited);
    })();

    return () => {
      cancelled = true;
    };
  }, [propertyId, isAuthenticated]);

  const toggle = useCallback(async () => {
    if (!isAuthenticated) {
      onUnauthorized?.();
      return;
    }
    if (isToggling || propertyId === undefined || propertyId === null) return;

    const numericId =
      typeof propertyId === 'string' ? parseInt(propertyId, 10) : propertyId;
    if (!Number.isFinite(numericId)) return;

    try {
      setIsToggling(true);
      const result = await toggleFavorite(numericId);
      setIsFavorite(result.favorited);
    } catch (error: any) {
      if (error?.response?.status === 401) onUnauthorized?.();
    } finally {
      setIsToggling(false);
    }
  }, [propertyId, isAuthenticated, isToggling, onUnauthorized]);

  return { isFavorite, isToggling, toggle };
};
