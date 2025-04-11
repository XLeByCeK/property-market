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

  useEffect(() => {
    // Prevent errors in development mode
    if (process.env.NODE_ENV === 'development') {
      const initMapWithTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(initMapWithTimeout);
    }
    
    // Load Yandex Maps API if it's not already loaded
    try {
      if (!window.ymaps) {
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=YOUR_YANDEX_MAPS_API_KEY&lang=ru_RU';
        script.async = true;
        
        script.onload = initMap;
        script.onerror = () => {
          setError('Не удалось загрузить API Яндекс.Карт');
          setIsLoading(false);
        };
        
        document.body.appendChild(script);
      } else {
        initMap();
      }
    } catch (err) {
      console.error('Error setting up Yandex Maps:', err);
      setError('Произошла ошибка при инициализации карты');
      setIsLoading(false);
    }
    
    function initMap() {
      try {
        window.ymaps.ready(() => {
          if (mapRef.current) {
            const map = new window.ymaps.Map(mapRef.current, {
              center: [latitude, longitude],
              zoom: 14,
              controls: ['zoomControl', 'fullscreenControl']
            });
            
            const placemark = new window.ymaps.Placemark([latitude, longitude], {
              balloonContent: address
            }, {
              preset: 'islands#redDotIcon'
            });
            
            map.geoObjects.add(placemark);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Произошла ошибка при инициализации карты');
        setIsLoading(false);
      }
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [latitude, longitude, address]);
  
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
  
  if (isLoading && process.env.NODE_ENV !== 'development') {
    return (
      <div className="property-map">
        <div className="yandex-map-loading">
          <p>Загрузка карты...</p>
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