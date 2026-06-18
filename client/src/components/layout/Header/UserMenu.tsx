import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AuthModal } from '../../features/auth/AuthModal';
import { useAuth } from '../../../context/AuthContext';
import { PLACEHOLDER_AVATAR } from '../../../utils/imageUrl';

export const UserMenu = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isMobileMenuOpen || isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen, isAuthModalOpen]);

  const toggleUserMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeUserMenu = () => setIsMobileMenuOpen(false);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
    closeUserMenu();
  };

  const handleProfileClick = () => {
    closeUserMenu();
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      handleAuthClick();
    }
  };

  const handleAvatarClick = () => {
    // Проверяем ширину экрана программно
    if (window.innerWidth < 992) {
      toggleUserMenu();
    } else {
      handleProfileClick();
    }
  };

  // Выносим аватарку в отдельную переменную, чтобы не дублировать логику URL
  const userAvatarSrc = user?.avatarUrl || PLACEHOLDER_AVATAR;

  return (
    <>
      <div className="user-menu-container">
        {/* Desktop Avatar */}
        <button 
          className="user-avatar d-none d-lg-block"
          onClick={handleProfileClick}
          key="desktop-avatar" // Уникальный ключ
        >
          <Image
            src={userAvatarSrc}
            alt="User"
            width={32}
            height={32}
            className="object-cover rounded-circle"
          />
        </button>
        
        {/* Mobile Avatar Button */}
        <button 
          className="user-avatar d-lg-none" 
          onClick={toggleUserMenu}
          key="mobile-avatar-btn" // Уникальный ключ
        >
          <Image
            src={userAvatarSrc}
            alt="User"
            width={32}
            height={32}
            className="object-cover rounded-circle"
          />
        </button>

        {/* Mobile Slide-out Menu */}
        <div className={`user-menu-mobile ${isMobileMenuOpen ? 'visible' : ''}`}>
          <div className="mobile-menu-header">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <Image
                  src={userAvatarSrc}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover rounded-circle"
                  key="menu-header-avatar" // Еще один уникальный ключ
                />
              </div>
              <h5 className="mb-0 text-truncate">
                {isAuthenticated ? `${user?.firstName || ''} ${user?.lastName || ''}` : 'Личный кабинет'}
              </h5>
            </div>
            <button className="close-button" onClick={closeUserMenu} aria-label="Закрыть меню">
              <svg className="icon" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mobile-menu-content">
            <button className="menu-item" onClick={handleProfileClick}>
              {isAuthenticated ? 'Профиль' : 'Войти в профиль'}
            </button>
            <button className="menu-item" onClick={() => { router.push('/profile/messages'); closeUserMenu(); }}>
              Сообщения
              {isAuthenticated && user?.unreadCount > 0 && (
                <span className="badge bg-primary rounded-pill ms-2">Новые</span>
              )}
            </button>
            {isAuthenticated && (
              <button className="menu-item" onClick={closeUserMenu}>Настройки</button>
            )}
            {isAuthenticated ? (
              <button className="menu-item logout-btn" onClick={() => { logout(); closeUserMenu(); router.push('/'); }}>
                Выход
              </button>
            ) : (
              <button className="menu-item login-btn" onClick={handleAuthClick}>Вход / Регистрация</button>
            )}
          </div>
        </div>
        
        {/* Overlay */}
        {isMobileMenuOpen && (
          <div className="menu-overlay d-lg-none" onClick={closeUserMenu} />
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};