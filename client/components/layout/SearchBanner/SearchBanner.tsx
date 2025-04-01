import React, { useState } from 'react';

interface SearchBannerProps {
  selectedCity: string;
  backgroundImage?: string;
}

type SearchMode = 'buy' | 'rent' | 'daily';

export const SearchBanner: React.FC<SearchBannerProps> = ({ 
  selectedCity,
  backgroundImage = '/images/banner-bg.jpg'
}) => {
  const [searchMode, setSearchMode] = useState<SearchMode>('buy');
  const [propertyType, setPropertyType] = useState('');
  const [rooms, setRooms] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [address, setAddress] = useState('');
  const [guests, setGuests] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const propertyTypes = [
    { value: 'apartment', label: 'Квартира' },
    { value: 'house', label: 'Дом' },
    { value: 'commercial', label: 'Коммерческая' },
    { value: 'land', label: 'Участок' },
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

  const renderSearchInputs = () => {
    switch (searchMode) {
      case 'daily':
        return (
          <>
            <select 
              className="search-input"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Вид недвижимости</option>
              {propertyTypes.map(type => (
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
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />

            <input
              type="date"
              className="search-input"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />

            <input
              type="text"
              className="search-input"
              placeholder="Адрес"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </>
        );
      default:
        return (
          <>
            <select
              className="search-input"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Вид недвижимости</option>
              {propertyTypes.map(type => (
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

            <input
              type="text"
              className="search-input"
              placeholder="Адрес"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </>
        );
    }
  };

  return (
    <div className="search-banner" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="search-banner-overlay"></div>
      <div className="search-banner-content">
        <h1 className="search-banner-title">Недвижимость в {selectedCity}</h1>
        
        <div className="search-banner-actions">
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
          <button className="action-button">Оценить</button>
          <button className="action-button">Ипотека</button>
          <button className="action-button">Подбор риелтора</button>
          <button className="action-button primary">Выставить объявление</button>
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
              <button className="search-button primary">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Найти
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 