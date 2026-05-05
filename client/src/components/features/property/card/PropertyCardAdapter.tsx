import React from 'react';
import { Property } from '../../services/propertyService';
import { PropertyCard } from './PropertyCard';

interface PropertyCardAdapterProps {
  property: Property;
}

export const PropertyCardAdapter: React.FC<PropertyCardAdapterProps> = ({ property }) => {
  // Выбираем главное изображение или первое доступное или заглушку
  const getMainImage = () => {
    return property.image || '/images/null-image.jpg';
  };

  return (
    <PropertyCard
      id={property.id}
      image={getMainImage()}
      price={property.price}
      propertyType={property.propertyType}
      rooms={property.rooms}
      floors={property.floors}
      address={property.address}
      metro={property.metro || ''}
    />
  );
}; 