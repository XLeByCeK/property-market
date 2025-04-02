import React from 'react';
import Image from 'next/image';

export const UserMenu = () => {
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

  return (
    <div className="user-menu">
      {/* Desktop version */}
      <button className="user-avatar d-none d-lg-block">
        <Image
          src="/placeholder-avatar.png"
          alt="User Avatar"
          width={32}
          height={32}
          className="object-cover"
        />
      </button>
      <div className="user-menu-desktop">
        <button className="menu-item">Профиль</button>
        <button className="menu-item">Настройки</button>
        <button className="menu-item">Вход</button>
      </div>

      {/* Mobile version */}
      <button className="user-avatar d-lg-none" onClick={handleUserMenuClick}>
        <Image
          src="/placeholder-avatar.png"
          alt="User Avatar"
          width={32}
          height={32}
          className="object-cover"
        />
      </button>
      <div className="user-menu-mobile">
        <div className="mobile-menu-header">
          <h5>Профиль</h5>
          <button className="close-button" onClick={closeUserMenu}>
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mobile-menu-content">
          <button className="menu-item" onClick={closeUserMenu}>Профиль</button>
          <button className="menu-item" onClick={closeUserMenu}>Настройки</button>
          <button className="menu-item" onClick={closeUserMenu}>Вход</button>
        </div>
      </div>
    </div>
  );
}; 