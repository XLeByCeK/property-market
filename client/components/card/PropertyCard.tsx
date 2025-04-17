import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import axios from 'axios';

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
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Check if the property is favorited on initial load
  useEffect(() => {
    if (isAuthenticated) {
      setIsFavorite(isFavorited);
    }
  }, [isAuthenticated, isFavorited]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    console.log('Toggling favorite for property ID:', id);
    e.preventDefault();
    e.stopPropagation(); // Prevent the link from being followed

    if (!isAuthenticated) {
      console.log('User is not authenticated. Opening auth modal.');
      setIsAuthModalOpen(true);
      return;
    }

    if (isToggling) {
      console.log('Already toggling favorite status. Ignoring request.');
      return; // Prevent multiple clicks
    }

    console.log('Starting favorite toggle process. Current state:', isFavorite ? 'favorited' : 'not favorited');
    
    try {
      setIsToggling(true);
      const numericId = parseInt(id, 10);
      
      // Ensure we have a valid number
      if (isNaN(numericId)) {
        console.error('Invalid property ID:', id);
        return;
      }
      
      console.log('Making API call to toggle favorite for ID:', numericId);
      console.log('Current auth token:', localStorage.getItem('token') ? 'Token exists' : 'No token');
      
      // Use direct axios call to bypass any potential API wrapper issues
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setIsAuthModalOpen(true);
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/properties/favorites/${numericId}`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Toggle favorite API call successful. Result:', response.data);
      
      // Update local state
      setIsFavorite(!isFavorite);
      console.log('Updated favorite state to:', !isFavorite ? 'favorited' : 'not favorited');
    } catch (error: any) {
      console.error('Error toggling favorite status. Full error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // If unauthorized, open auth modal
        if (error.response.status === 401) {
          setIsAuthModalOpen(true);
        }
      }
    } finally {
      setIsToggling(false);
      console.log('Favorite toggle process completed.');
    }
  };

  // Форматирование цены: 1000000 -> 1 000 000
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg className="heart-icon" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}; 