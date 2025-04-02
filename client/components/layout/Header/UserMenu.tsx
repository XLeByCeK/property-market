import React, { useState } from 'react';
import Image from 'next/image';
import { AuthModal } from '../../auth/AuthModal';

export const UserMenu = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <div className="user-menu">
        <button className="user-avatar" onClick={handleAuthClick}>
          <Image
            src="/placeholder-avatar.png"
            alt="User Avatar"
            width={32}
            height={32}
            className="object-cover"
          />
        </button>
        <div className="user-menu-desktop">
          <button className="dropdown-item" onClick={handleAuthClick}>
            Войти
          </button>
          <button className="dropdown-item">
            Регистрация
          </button>
        </div>
      </div>

      <div className="user-menu-mobile">
        <div className="mobile-menu-header">
          <h5>Меню пользователя</h5>
          <button className="close-button">
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mobile-menu-content">
          <button className="dropdown-item" onClick={handleAuthClick}>
            Войти
          </button>
          <button className="dropdown-item">
            Регистрация
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
}; 