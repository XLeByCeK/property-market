import React from 'react';
import { PropertyCard } from '../card/PropertyCard';
import Link from 'next/link';

interface Property {
  id: string;
  image: string;
  price: number;
  propertyType: string;
  rooms: string;
  floors: string;
  address: string;
  metro: string;
}

interface PropertyCategoryProps {
  title: string;
  properties: Property[];
  link: string;
}

export const PropertyCategory: React.FC<PropertyCategoryProps> = ({
  title,
  properties,
  link
}) => {
  return (
    <section className="property-category">
      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        <Link href={link} className="category-link">
          <span>Смотреть все</span>
          <svg className="arrow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
      
      <div className="property-grid">
        {properties.map(property => (
          <PropertyCard
            key={property.id}
            id={property.id}
            image={property.image}
            price={property.price}
            propertyType={property.propertyType}
            rooms={property.rooms}
            floors={property.floors}
            address={property.address}
            metro={property.metro}
          />
        ))}
      </div>
    </section>
  );
}; 