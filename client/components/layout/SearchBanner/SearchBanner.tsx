import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCity } from '../../../context/CityContext';
import { getPropertyTypes, getTransactionTypes, getCities, getDistrictsByCityId, getMetroStationsByCityId } from '../../../services/propertyService';

interface SearchBannerProps {
  backgroundImage?: string;
}

type SearchMode = 'buy' | 'rent' | 'daily';

interface PropertyType {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

interface MetroStation {
  id: number;
  name: string;
  color?: string;
}

export const SearchBanner: React.FC<SearchBannerProps> = ({ 
  backgroundImage = '/images/banner-bg.jpg'
}) => {
  const router = useRouter();
  const { selectedCity } = useCity();
  
  // Form state
  const [searchMode, setSearchMode] = useState<SearchMode>('buy');
  const [propertyType, setPropertyType] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [rooms, setRooms] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [areaFrom, setAreaFrom] = useState('');
  const [areaTo, setAreaTo] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [districtId, setDistrictId] = useState<string>('');
  const [metroId, setMetroId] = useState<string>('');
  const [metroDistance, setMetroDistance] = useState<string>('');
  const [isNewBuilding, setIsNewBuilding] = useState<boolean>(false);
  const [isCommercial, setIsCommercial] = useState<boolean>(false);
  const [isCountry, setIsCountry] = useState<boolean>(false);
  const [floor, setFloor] = useState<string>('');
  const [totalFloors, setTotalFloors] = useState<string>('');
  
  // Additional fields for daily rental
  const [guests, setGuests] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  
  // UI state
  const [isMobile, setIsMobile] = useState(false);
  
  // Data for dropdowns
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<PropertyType[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [metroStations, setMetroStations] = useState<MetroStation[]>([]);

  // Load data for dropdowns
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [propTypes, transTypes, citiesData] = await Promise.all([
          getPropertyTypes(),
          getTransactionTypes(),
          getCities(),
        ]);
        
        setPropertyTypes(propTypes as PropertyType[] || []);
        setTransactionTypes(transTypes as PropertyType[] || []);
        setCities(citiesData as City[] || []);
        
        // Set default transaction type based on search mode
        if (transTypes && Array.isArray(transTypes) && transTypes.length > 0) {
          const defaultType = (transTypes as PropertyType[]).find(t => 
            (searchMode === 'buy' && t.name.toLowerCase().includes('покупка')) || 
            ((searchMode === 'rent' || searchMode === 'daily') && t.name.toLowerCase().includes('аренда'))
          );
          
          if (defaultType) {
            setTransactionType(defaultType.id.toString());
          }
        }
        
        // Set default city if available from context
        if (selectedCity && citiesData && Array.isArray(citiesData)) {
          const cityObj = (citiesData as City[]).find(c => c.name === selectedCity);
          if (cityObj) {
            setSelectedCityId(cityObj.id.toString());
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    
    loadFormData();
  }, [selectedCity, searchMode]);
  
  // Load districts and metro stations when city changes
  useEffect(() => {
    const loadCityData = async () => {
      if (!selectedCityId) {
        setDistricts([]);
        setMetroStations([]);
        return;
      }
      
      try {
        const cityId = parseInt(selectedCityId, 10);
        const [districtsData, metroData] = await Promise.all([
          getDistrictsByCityId(cityId),
          getMetroStationsByCityId(cityId),
        ]);
        
        setDistricts(districtsData as District[] || []);
        setMetroStations(metroData as MetroStation[] || []);
      } catch (error) {
        console.error('Error loading city data:', error);
      }
    };
    
    loadCityData();
  }, [selectedCityId]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 991.98);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Reset form when search mode changes
  useEffect(() => {
    // Reset form fields specific to each mode
    setPriceFrom('');
    setPriceTo('');
    setGuests('');
    setCheckIn('');
    setCheckOut('');
    
    // Set appropriate transaction type
    if (transactionTypes.length > 0) {
      const defaultType = transactionTypes.find(t => 
        (searchMode === 'buy' && t.name.toLowerCase().includes('покупка')) || 
        ((searchMode === 'rent' || searchMode === 'daily') && t.name.toLowerCase().includes('аренда'))
      );
      
      if (defaultType) {
        setTransactionType(defaultType.id.toString());
      }
    }
  }, [searchMode, transactionTypes]);

  // Статические опции для выбора типа недвижимости
  const propertyTypeOptions = [
    { value: '4', label: 'Квартира', type: 'apartment' },
    { value: '2', label: 'Дом', type: 'house' },
    { value: '1', label: 'Таунхаус', type: 'townhouse' },
    { value: '3', label: 'Вилла', type: 'villa' },
    { value: '5', label: 'Коммерческая', type: 'commercial' },
  ];

  const roomOptions = [
    { value: 'studio', label: 'Студия' },
    { value: '1', label: '1 комната' },
    { value: '2', label: '2 комнаты' },
    { value: '3', label: '3 комнаты' },
    { value: '4+', label: '4+ комнаты' },
  ];

  const guestOptions = [
    { value: '1', label: '1 гость' },
    { value: '2', label: '2 гостя' },
    { value: '3', label: '3 гостя' },
    { value: '4', label: '4 гостя' },
    { value: '5+', label: '5+ гостей' },
  ];

  const handleSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Собираем параметры для поиска
    const searchParams: Record<string, string | boolean> = {
      mode: searchMode
    };

    // Добавляем только непустые параметры
    if (propertyType) {
      // Найдем соответствующий тип из опций
      const selectedType = propertyTypeOptions.find(opt => opt.value === propertyType);
      if (selectedType) {
        searchParams.type = selectedType.type; // Передаем строковый тип (apartment, house и т.д.)
      }
    }
    
    if (transactionType) searchParams.transactionTypeId = transactionType;
    if (rooms) searchParams.rooms = rooms;
    if (priceFrom) searchParams.priceFrom = priceFrom;
    if (priceTo) searchParams.priceTo = priceTo;
    if (areaFrom) searchParams.areaFrom = areaFrom;
    if (areaTo) searchParams.areaTo = areaTo;
    if (address) searchParams.address = address;
    if (selectedCityId) searchParams.cityId = selectedCityId;
    if (districtId) searchParams.districtId = districtId;
    if (metroId) searchParams.metroId = metroId;
    if (metroDistance) searchParams.metroDistance = metroDistance;
    if (floor) searchParams.floor = floor;
    if (totalFloors) searchParams.totalFloors = totalFloors;
    
    // Boolean parameters
    if (isNewBuilding) searchParams.isNewBuilding = isNewBuilding;
    // Если тип уже передан как commercial, не нужно дублировать параметр isCommercial
    if (propertyType !== 'commercial' && isCommercial) searchParams.isCommercial = isCommercial;
    if (isCountry) searchParams.isCountry = isCountry;

    // Для посуточного режима добавляем дополнительные параметры
    if (searchMode === 'daily') {
      if (guests) searchParams.guests = guests;
      if (checkIn) searchParams.checkIn = checkIn;
      if (checkOut) searchParams.checkOut = checkOut;
    }
    
    // Для отладки - подробно логируем параметры поиска
    console.log('%c 🔍 SEARCH PARAMETERS', 'background: #007bff; color: white; padding: 2px 6px; border-radius: 2px;');
    console.log('Type:', propertyType);
    console.log('Search params:', searchParams);
    
    // Перенаправляем на страницу с результатами поиска
    router.push({
      pathname: '/search',
      query: searchParams
    });
  };

  const renderSearchInputs = () => {
    switch (searchMode) {
      case 'daily':
        return (
          <>
            <div className="search-inputs-row daily-row">
              <select 
                className="search-input"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">Вид недвижимости</option>
                {propertyTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                className="search-input"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="">Количество гостей</option>
                {guestOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
               
              <input
                type="date"
                className="search-input"
                placeholder="Дата заезда"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />

              <input
                type="date"
                className="search-input"
                placeholder="Дата выезда"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
              
              <input
                type="text"
                className="search-input price-input"
                placeholder="Цена от"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
              />
              
              <input
                type="text"
                className="search-input price-input"
                placeholder="Цена до"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
              />
              
              <input
                type="text"
                className="search-input address-input"
                placeholder="Адрес"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="search-inputs-row">
              <select
                className="search-input"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">Вид недвижимости</option>
                {propertyTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                className="search-input"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
              >
                <option value="">Количество комнат</option>
                {roomOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              
              <input
                type="text"
                className="search-input address-input"
                placeholder="Адрес"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="search-inputs-row">
              <div className="price-inputs">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Цена от"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Цена до"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="search-banner">
      <div className="search-banner-background">
        <Image
          src={backgroundImage}
          alt="Banner background"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="search-banner-overlay"></div>
      <div className="search-banner-content">
        <h1 className="search-banner-title">Недвижимость в городе {selectedCity}</h1>
        
        <div className="search-banner-actions">
          <div className="action-buttons-row">
            <button
              className={`action-button ${searchMode === 'buy' ? 'active' : ''}`}
              onClick={() => setSearchMode('buy')}
            >
              Купить
            </button>
            <button
              className={`action-button ${searchMode === 'rent' ? 'active' : ''}`}
              onClick={() => setSearchMode('rent')}
            >
              Снять
            </button>
            <button
              className={`action-button ${searchMode === 'daily' ? 'active' : ''}`}
              onClick={() => setSearchMode('daily')}
            >
              Посуточно
            </button>
          </div>
          <div className="action-buttons-row">
            <button className="action-button">Оценить</button>
            <button className="action-button">Ипотека</button>
            <button className="action-button">Подбор риелтора</button>
            <button className="action-button primary">Выставить объявление</button>
          </div>
          <div className="search-banner-form">
            <div className="search-inputs">
              {renderSearchInputs()}
            </div>

            <div className="search-buttons">
              <button className="search-button">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Показать на карте
              </button>
              <button className="search-button primary" onClick={handleSearch}>
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Найти
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .search-inputs-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          width: 100%;
        }
        
        .daily-row {
          flex-wrap: nowrap;
          width: 100%;
          justify-content: space-between;
        }
        
        .daily-row .search-input {
          flex: 1;
          min-width: 0;
          font-size: 12px;
        }
        
        .daily-row .price-input {
          flex: 0.2; /* Радикально уменьшаем поля цены */
          font-size: 10px;
          padding: 5px;
          min-width: 60px;
        }
        
        .daily-row select {
          flex: 0.7;
          font-size: 12px;
          padding: 5px;
        }
        
        .daily-row input[type="date"] {
          flex: 0.5;
          font-size: 10px;
          padding: 5px;
          min-width: 85px;
        }
        
        .daily-row .address-input {
          flex: 1.5;
          min-width: 120px;
        }
        
        .price-inputs, .area-inputs, .floor-inputs, .date-inputs {
          display: flex;
          gap: 5px;
          flex: 1;
        }
        
        .price-inputs input, .area-inputs input, .floor-inputs input, .date-inputs input {
          flex: 1;
        }
        
        .date-inputs {
          flex: 1.5;
        }
        
        .price-inputs {
          flex: 1.2;
        }
        
        .date-input, .price-input {
          min-width: 0;
          font-size: 13px;
        }
        
        .advanced-search-options {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .advanced-options-toggle {
          text-align: center;
          margin-top: 10px;
        }
        
        .toggle-button {
          background: none;
          border: none;
          color: #fff;
          text-decoration: underline;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }
        
        .toggle-button:hover {
          opacity: 1;
        }
        
        .checkbox-group {
          display: flex;
          gap: 15px;
          width: 100%;
          flex-wrap: wrap;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        
        .checkbox-group label:hover {
          opacity: 0.8;
        }
        
        .checkbox-group input[type="checkbox"] {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }
        
        .search-input {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          padding: 10px 12px;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #fff;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
        
        .search-input:disabled {
          background: rgba(255, 255, 255, 0.5);
          cursor: not-allowed;
        }
        
        /* Mobile responsive styles */
        @media (max-width: 991.98px) {
          .search-inputs-row {
            flex-direction: column;
            gap: 8px;
          }
          
          /* Исключение для первой строки с основными параметрами */
          .search-banner-form .search-inputs-row:first-child {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 5px;
          }
          
          .search-banner-form .search-inputs-row:first-child .search-input {
            flex: 1 1 auto;
            min-width: 30%;
          }
          
          /* Специальные стили для строки в режиме посуточной аренды */
          .daily-row {
            flex-wrap: wrap;
          }
          
          .daily-row .search-input {
            flex: 1 1 30%;
            min-width: 100px;
            margin-bottom: 5px;
          }
          
          .daily-row .price-input {
            flex: 1 1 20%;
            min-width: 80px;
          }
          
          .daily-row .address-input {
            flex: 1 1 45%;
            min-width: 150px;
          }
          
          .checkbox-group {
            justify-content: center;
          }
          
          .search-button {
            width: 100%;
            margin-bottom: 5px;
          }
          
          .search-inputs {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}; 