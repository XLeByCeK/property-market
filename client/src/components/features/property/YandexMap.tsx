import React, { useEffect, useRef, useState } from 'react';

interface YandexMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export const YandexMap: React.FC<YandexMapProps> = ({ latitude, longitude, address }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Используем плейсхолдер в режиме разработки, чтобы избежать реальных вызовов API
  const useDevelopmentPlaceholder = process.env.NODE_ENV === 'development';
  
  // Загрузка API Яндекс.Карт
  useEffect(() => {
    // В режиме разработки просто показываем плейсхолдер без реальной загрузки API
    if (useDevelopmentPlaceholder) {
      setIsLoading(false);
      return;
    }
    
    // Установка таймаута для предотвращения бесконечной загрузки
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setError('Время ожидания загрузки карты истекло');
        setIsLoading(false);
      }
    }, 10000); // 10 секунд на загрузку

    // Не загружаем скрипт повторно, если он уже загружен
    if (window.ymaps || scriptLoaded) {
      initMap();
      return;
    }

    // Получаем API ключ из переменных окружения
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    
    // Вывод предупреждения, если API ключ не указан в production
    if (!apiKey && process.env.NODE_ENV === 'production') {
      console.warn('Yandex Maps API key is not provided. Map might not work correctly in production. Please add NEXT_PUBLIC_YANDEX_MAPS_API_KEY to your .env.local file.');
    }
    
    // Формируем URL для загрузки API
    const apiUrl = apiKey 
      ? `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU&load=Map,Placemark`
      : 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=Map,Placemark';
    
    // Ищем существующий скрипт
    const existingScript = document.querySelector(`script[src="${apiUrl}"]`);
    
    if (existingScript) {
      // Если скрипт уже существует, просто ждем его загрузки
      if (window.ymaps) {
        initMap();
      } else {
        existingScript.addEventListener('load', () => {
          setScriptLoaded(true);
          initMap();
        });
        
        existingScript.addEventListener('error', () => {
          setError('Не удалось загрузить API Яндекс.Карт');
          setIsLoading(false);
        });
      }
    } else {
      // Создаем новый скрипт
      const script = document.createElement('script');
      script.src = apiUrl;
      script.async = true;
      
      script.onload = () => {
        setScriptLoaded(true);
        initMap();
      };
      
      script.onerror = () => {
        setError('Не удалось загрузить API Яндекс.Карт');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    }

    return () => {
      // Очистка таймаута при размонтировании компонента
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, useDevelopmentPlaceholder]);

  // Инициализация карты
  function initMap() {
    if (!window.ymaps) {
      console.log('YMaps API not available yet');
      setTimeout(initMap, 500);
      return;
    }
    
    try {
      window.ymaps.ready(() => {
        if (!mapRef.current) return;
        
        try {
          // Создаем экземпляр карты
          const map = new window.ymaps.Map(mapRef.current, {
            center: [latitude, longitude],
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl']
          });
          
          // Добавляем метку на карту
          const placemark = new window.ymaps.Placemark([latitude, longitude], {
            balloonContent: address
          }, {
            preset: 'islands#redDotIcon'
          });
          
          map.geoObjects.add(placemark);
          
          // Очищаем таймаут, так как карта успешно загружена
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          setIsLoading(false);
        } catch (err) {
          console.error('Error creating map instance:', err);
          setError('Ошибка при создании карты');
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Error in ymaps.ready():', err);
      setError('Ошибка инициализации карты');
      setIsLoading(false);
    }
  }
  
  if (error) {
    return (
      <div className="property-map">
        <div className="yandex-map-error">
          <p>{error}</p>
          <p>Адрес объекта: {address}</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="property-map">
        <div className="yandex-map-loading">
          <p>Загрузка карты...</p>
        </div>
      </div>
    );
  }
  
  // В режиме разработки показываем плейсхолдер
  if (useDevelopmentPlaceholder) {
    return (
      <div className="property-map">
        <div className="yandex-map-placeholder">
          <h3>Яндекс Карта</h3>
          <p>Здесь будет отображена карта с адресом:</p>
          <p><strong>{address}</strong></p>
          <p className="placeholder-coordinates">
            Координаты: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
          <p className="placeholder-info">
            Режим разработки: Карта не загружается для экономии запросов
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="property-map">
      <div ref={mapRef} className="yandex-map" />
    </div>
  );
}; 