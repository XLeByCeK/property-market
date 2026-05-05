import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RentRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/category/rent');
  }, [router]);
  
  return (
    <div className="container mt-5 text-center">
      <p>Перенаправление...</p>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Загрузка...</span>
      </div>
    </div>
  );
} 