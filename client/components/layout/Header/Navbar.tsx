import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const closeMobileMenu = () => {
    const mobileMenu = document.querySelector('.navbar-mobile');
    if (mobileMenu) {
      mobileMenu.classList.remove('visible');
      document.body.style.overflow = ''; // Restore scrolling when menu is closed
    }
  };

  // Функция для навигации с закрытием меню
  const navigateTo = (path: string) => {
    closeMobileMenu();
    router.push(path);
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
        <Link href="/category/buy" className="menu-item-link" onClick={closeMobileMenu}>
          <div className="menu-item">Купить</div>
        </Link>
        
        <Link href="/category/rent" className="menu-item-link" onClick={closeMobileMenu}>
          <div className="menu-item">Снять</div>
        </Link>
        
        <Link href="/property/create" className="menu-item-link" onClick={closeMobileMenu}>
          <div className="menu-item">Продать</div>
        </Link>
        
        <Link href="/property/create" className="menu-item-link" onClick={closeMobileMenu}>
          <div className="menu-item">Сдать</div>
        </Link>
        
        <Link href="/category/new-buildings" className="menu-item-link" onClick={closeMobileMenu}>
          <div className="menu-item">Новостройки</div>
        </Link>
        
        <Link href="/category/country" className="menu-item-link" onClick={closeMobileMenu}>
          <div className="menu-item">Загородная</div>
        </Link>
        
        <Link href="/category/commercial" className="menu-item-link" onClick={closeMobileMenu}>
          <div className="menu-item">Коммерческая</div>
        </Link>
        
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