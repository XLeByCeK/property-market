import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCity } from '../../../context/CityContext';
import { BANNER_BG_IMAGE } from '../../../utils/imageUrl';
import { GUEST_OPTIONS, PROPERTY_TYPE_OPTIONS, ROOM_OPTIONS } from './options';
import { useSearchBannerData } from './useSearchBannerData';
import styles from './SearchBanner.module.css';

interface SearchBannerProps {
  backgroundImage?: string;
}

type SearchMode = 'buy' | 'rent' | 'daily';

const isPurchase = (name: string) => name.toLowerCase().includes('покупка');
const isRental = (name: string) => name.toLowerCase().includes('аренда');

export const SearchBanner: React.FC<SearchBannerProps> = ({
  backgroundImage = BANNER_BG_IMAGE,
}) => {
  const router = useRouter();
  const { selectedCity } = useCity();

  const [searchMode, setSearchMode] = useState<SearchMode>('buy');
  const [propertyType, setPropertyType] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [rooms, setRooms] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [guests, setGuests] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const { transactionTypes, cities } = useSearchBannerData(selectedCityId);

  // Подхватываем выбранный город из контекста, как только подгрузился справочник.
  useEffect(() => {
    if (!selectedCity || cities.length === 0) return;
    const cityObj = cities.find((c) => c.name === selectedCity);
    if (cityObj) setSelectedCityId(cityObj.id.toString());
  }, [selectedCity, cities]);

  // При смене режима / поступлении списка типов сделок — выставляем дефолтный
  // тип сделки и чистим поля, специфичные для предыдущего режима.
  useEffect(() => {
    setPriceFrom('');
    setPriceTo('');
    setGuests('');
    setCheckIn('');
    setCheckOut('');

    if (transactionTypes.length === 0) return;
    const match = transactionTypes.find((t) =>
      searchMode === 'buy' ? isPurchase(t.name) : isRental(t.name)
    );
    if (match) setTransactionType(match.id.toString());
  }, [searchMode, transactionTypes]);

  const handleSearch = (e: React.MouseEvent) => {
    e.preventDefault();

    const searchParams: Record<string, string | boolean> = { mode: searchMode };

    if (propertyType) {
      const selectedType = PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === propertyType);
      if (selectedType) searchParams.type = selectedType.type;
    }
    if (transactionType) searchParams.transactionTypeId = transactionType;
    if (rooms) searchParams.rooms = rooms;
    if (priceFrom) searchParams.priceFrom = priceFrom;
    if (priceTo) searchParams.priceTo = priceTo;
    if (address) searchParams.address = address;
    if (selectedCityId) searchParams.cityId = selectedCityId;

    if (searchMode === 'daily') {
      if (guests) searchParams.guests = guests;
      if (checkIn) searchParams.checkIn = checkIn;
      if (checkOut) searchParams.checkOut = checkOut;
    }

    router.push({ pathname: '/search', query: searchParams });
  };

  const renderDailyInputs = () => (
    <div className={`${styles.searchInputsRow} ${styles.dailyRow}`}>
      <select
        className={styles.searchInput}
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
      >
        <option value="">Вид недвижимости</option>
        {PROPERTY_TYPE_OPTIONS.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <select
        className={styles.searchInput}
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
      >
        <option value="">Количество гостей</option>
        {GUEST_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        className={styles.searchInput}
        placeholder="Дата заезда"
        value={checkIn}
        onChange={(e) => setCheckIn(e.target.value)}
      />

      <input
        type="date"
        className={styles.searchInput}
        placeholder="Дата выезда"
        value={checkOut}
        onChange={(e) => setCheckOut(e.target.value)}
      />

      <input
        type="text"
        className={`${styles.searchInput} ${styles.priceInput}`}
        placeholder="Цена от"
        value={priceFrom}
        onChange={(e) => setPriceFrom(e.target.value)}
      />

      <input
        type="text"
        className={`${styles.searchInput} ${styles.priceInput}`}
        placeholder="Цена до"
        value={priceTo}
        onChange={(e) => setPriceTo(e.target.value)}
      />

      <input
        type="text"
        className={`${styles.searchInput} ${styles.addressInput}`}
        placeholder="Адрес"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
    </div>
  );

  const renderBuyRentInputs = () => (
    <>
      <div className={styles.searchInputsRow}>
        <select
          className={styles.searchInput}
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        >
          <option value="">Вид недвижимости</option>
          {PROPERTY_TYPE_OPTIONS.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          className={styles.searchInput}
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
        >
          <option value="">Количество комнат</option>
          {ROOM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          className={`${styles.searchInput} ${styles.addressInput}`}
          placeholder="Адрес"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className={styles.searchInputsRow}>
        <div className={styles.priceInputs}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Цена от"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
          />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Цена до"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
          />
        </div>
      </div>
    </>
  );

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
            <button className="action-button" onClick={() => router.push('/evaluate')}>
              Оценить
            </button>
            <button className="action-button">Ипотека</button>
            <button className="action-button">Подбор риелтора</button>
            <button className="action-button primary">Выставить объявление</button>
          </div>
          <div className="search-banner-form">
            <div className="search-inputs">
              {searchMode === 'daily' ? renderDailyInputs() : renderBuyRentInputs()}
            </div>

            <div className="search-buttons">
              <button className="search-button">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Показать на карте
              </button>
              <button className="search-button primary" onClick={handleSearch}>
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
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
