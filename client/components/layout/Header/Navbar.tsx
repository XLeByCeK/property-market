import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  
  const closeMobileMenu = () => {
    const mobileMenu = document.querySelector('.navbar-mobile');
    if (mobileMenu) {
      mobileMenu.classList.remove('visible');
      document.body.style.overflow = ''; // Restore scrolling when menu is closed
    }
  };

  return (
    <div className="navbar-mobile">
      <div className="mobile-menu-header">
        <h5>Меню</h5>
        <button className="close-button" onClick={closeMobileMenu}>
          <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mobile-menu-content">
        <button className="menu-item" onClick={closeMobileMenu}>Купить</button>
        <button className="menu-item" onClick={closeMobileMenu}>Снять</button>
        <button className="menu-item" onClick={closeMobileMenu}>Продать</button>
        <button className="menu-item" onClick={closeMobileMenu}>Сдать</button>
        <button className="menu-item" onClick={closeMobileMenu}>Новостройки</button>
        <button className="menu-item" onClick={closeMobileMenu}>Загородная</button>
        <button className="menu-item" onClick={closeMobileMenu}>Коммерческая</button>
        
        {isAuthenticated && (
          <Link href="/favorites" className="menu-item-link" onClick={closeMobileMenu}>
            <div className="menu-item">
              <svg className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Избранное
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}; 