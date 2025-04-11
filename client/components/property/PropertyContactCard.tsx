import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { PropertyDetails } from '../../services/propertyService';

interface PropertyContactCardProps {
  property: PropertyDetails;
}

export const PropertyContactCard: React.FC<PropertyContactCardProps> = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Format price like 1000000 -> 1 000 000
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  
  const toggleFavorite = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsFavorite(!isFavorite);
  };
  
  const handleShowPhone = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setPhoneVisible(true);
  };
  
  const handleContactSeller = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Navigate to messages with this property and seller
    router.push(`/messages?userId=${property.user.id}&propertyId=${property.id}`);
  };
  
  return (
    <>
      <div className="property-contact-card">
        <div className="contact-card-header">
          <h2 className="contact-card-price">{formatPrice(property.price)} ₽</h2>
          <button 
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            <svg className="heart-icon" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        <div className="contact-card-seller">
          <div className="seller-name">
            {property.user.first_name} {property.user.last_name}
          </div>
        </div>
        
        <div className="contact-card-buttons">
          <button 
            className="contact-card-button phone-button"
            onClick={handleShowPhone}
          >
            <svg className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>
              {phoneVisible ? property.user.phone : 'Показать телефон'}
            </span>
          </button>
          
          <button 
            className="contact-card-button message-button"
            onClick={handleContactSeller}
          >
            <svg className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Написать</span>
          </button>
        </div>
      </div>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}; 