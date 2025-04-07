import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthModal } from '../../auth/AuthModal';
import { useAuth } from '../../../context/AuthContext';

export const UserMenu = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleUserMenuClick = () => {
    const mobileMenu = document.querySelector('.user-menu-mobile');
    if (mobileMenu) {
      mobileMenu.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeUserMenu = () => {
    const mobileMenu = document.querySelector('.user-menu-mobile');
    if (mobileMenu) {
      mobileMenu.classList.remove('visible');
      document.body.style.overflow = '';
    }
  };

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
    document.body.style.overflow = 'hidden';
    closeUserMenu();
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = '';
  };

  const handleProfileClick = () => {
    closeUserMenu();
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      handleAuthClick();
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    closeUserMenu();
    router.push('/');
  };

  return (
    <>
      <div className="user-menu">
        {/* Desktop version */}
        <button className="user-avatar d-none d-lg-block">
          <Image
            src={isAuthenticated ? "/avatar.png" : "/placeholder-avatar.png"}
            alt="User Avatar"
            width={32}
            height={32}
            className="object-cover"
          />
        </button>
        <div className="user-menu-desktop">
          <button className="menu-item" onClick={handleProfileClick}>
            {isAuthenticated ? 'Профиль' : 'Личный кабинет'}
          </button>
          {isAuthenticated && (
            <button className="menu-item">Настройки</button>
          )}
          {isAuthenticated ? (
            <button className="menu-item" onClick={handleLogoutClick}>Выход</button>
          ) : (
            <button className="menu-item" onClick={handleAuthClick}>Вход</button>
          )}
        </div>

        {/* Mobile version */}
        <button className="user-avatar d-lg-none" onClick={handleUserMenuClick}>
          <Image
            src={isAuthenticated ? "/avatar.png" : "/placeholder-avatar.png"}
            alt="User Avatar"
            width={32}
            height={32}
            className="object-cover"
          />
        </button>
        <div className="user-menu-mobile">
          <div className="mobile-menu-header">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <Image
                  src={isAuthenticated ? "/placeholder-avatar.png" : "/placeholder-avatar.png"}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="object-cover rounded-circle"
                />
              </div>
              <h5 className="mb-0">{isAuthenticated ? `${user?.first_name || ''} ${user?.last_name || ''}` : 'Профиль'}</h5>
            </div>
            <button className="close-button" onClick={closeUserMenu}>
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mobile-menu-content">
            <button className="menu-item" onClick={handleProfileClick}>
              {isAuthenticated ? 'Профиль' : 'Личный кабинет'}
            </button>
            {isAuthenticated && (
              <button className="menu-item" onClick={closeUserMenu}>Настройки</button>
            )}
            {isAuthenticated ? (
              <button className="menu-item" onClick={handleLogoutClick}>Выход</button>
            ) : (
              <button className="menu-item" onClick={handleAuthClick}>Вход</button>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
}; 