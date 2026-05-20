import React from 'react';
import { Property } from '../../../../services/propertyService';
import { PropertyCard } from './PropertyCard';
import { getImageUrl, PLACEHOLDER_NULL_IMAGE } from '../../../../utils/imageUrl';

interface PropertyCardAdapterProps {
  property: Property;
}

export const PropertyCardAdapter: React.FC<PropertyCardAdapterProps> = ({ property }) => {
  // property.image уже мог быть приведён через getImageUrl (mapPropertyFromAPI),
  // но прогон через хелпер ещё раз идемпотентен и защищает от устаревших данных.
  const image = getImageUrl(property.image, PLACEHOLDER_NULL_IMAGE);

  return (
    <PropertyCard
      id={property.id}
      image={image}
      price={property.price}
      propertyType={property.propertyType}
      rooms={property.rooms}
      floors={property.floors}
      address={property.address}
      metro={property.metro || ''}
    />
  );
}; 