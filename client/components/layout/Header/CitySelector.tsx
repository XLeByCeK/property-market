import React, { useState } from 'react';

export const CitySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Москва');

  const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'];

  return (
    <div className="dropdown">
      <button 
        className="about-house-button d-flex align-items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCity}
        <svg 
          className="icon ms-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s'
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="dropdown-content position-absolute bg-white shadow-sm rounded-3 mt-2">
          {cities.map((city) => (
            <button
              key={city}
              className="dropdown-item"
              onClick={() => {
                setSelectedCity(city);
                setIsOpen(false);
              }}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 