import React from 'react';
import { PropertyDetails } from '../../services/propertyService';

interface PropertyInfoProps {
  property: PropertyDetails;
}

export const PropertyInfo: React.FC<PropertyInfoProps> = ({ property }) => {
  // Format price like 1000000 -> 1 000 000
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  
  return (
    <div className="property-info">
      <h1 className="property-title">
        {property.is_new_building && property.title ? property.title : 
         `${property.property_type.name}, ${property.rooms}-комн., ${property.floor || ''} этаж`}
      </h1>
      
      <div className="property-address-info">
        {property.address}
      </div>
      
      {property.metro_station && (
        <div className="property-metro-info">
          <svg className="metro-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 12l3 7h10l3-7z" />
          </svg>
          <span>{property.metro_station.name}</span>
          {property.metro_distance && (
            <span className="metro-distance">
              {property.metro_distance} мин. пешком
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 