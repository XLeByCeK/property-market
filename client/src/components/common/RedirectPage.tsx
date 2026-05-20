import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface RedirectPageProps {
  to: string;
}

/**
 * Простая страница-редирект. Используется в pages/listings/*, которые
 * раньше представляли собой 7 одинаковых файлов по 19 строк каждый.
 */
export const RedirectPage = ({ to }: RedirectPageProps) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <div className="container mt-5 text-center">
      <p>Перенаправление...</p>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Загрузка...</span>
      </div>
    </div>
  );
};
