import React from 'react';

export const Navbar = () => {
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
      </div>
    </div>
  );
}; 