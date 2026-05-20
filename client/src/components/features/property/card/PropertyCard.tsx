import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthModal } from '../../auth/AuthModal';
import { useFavoriteToggle } from '../../../../hooks/useFavoriteToggle';
import { formatPrice } from '../../../../utils/formatters';

interface PropertyCardProps {
  id: string;
  image: string;
  price: number;
  propertyType: string;
  rooms: string;
  floors: string;
  address: string;
  metro: string;
  isFavorited?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  image,
  price,
  propertyType,
  rooms,
  floors,
  address,
  metro,
  isFavorited = false,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isFavorite, isToggling, toggle } = useFavoriteToggle({
    propertyId: id,
    initialFavorited: isFavorited,
    onUnauthorized: () => setIsAuthModalOpen(true),
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  return (
    <>
      <Link href={`/property/${id}`} className="property-card-link">
        <div className="property-card">
          <div className="property-card-image">
            <Image
              src={image}
              alt={`${propertyType} ${rooms}`}
              width={300}
              height={200}
              priority
              className="property-image object-cover"
            />
            <button
              className={`favorite-button ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              disabled={isToggling}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className="heart-icon"
                fill={isFavorite ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
          <div className="property-card-content">
            <div className="property-price">{formatPrice(price)} ₽</div>
            <div className="property-details">
              <div className="property-type">{propertyType}</div>
              <div className="property-rooms">{rooms}</div>
              <div className="property-floors">{floors}</div>
            </div>
            <div className="property-address">{address}</div>
            <div className="property-metro">
              <svg className="metro-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 12l3 7h10l3-7z" />
              </svg>
              <span>{metro}</span>
            </div>
          </div>
        </div>
      </Link>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
