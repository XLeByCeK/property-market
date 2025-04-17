import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { CitySelector } from './CitySelector';
import { UserMenu } from './UserMenu';
import { useAuth } from '../../../context/AuthContext';

export const Header = () => {
  const { isAuthenticated } = useAuth();
  
  const handleHamburgerClick = () => {
    const mobileMenu = document.querySelector('.navbar-mobile');
    if (mobileMenu) {
      mobileMenu.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Left section */}
          <div className="nav-left">
            {/* Hamburger Menu */}
            <div className="dropdown">
              <button 
                className="hamburger-button"
                onClick={handleHamburgerClick}
              >
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="navbar-desktop">
                <div className="menu-items">
                  <button className="menu-item">Купить</button>
                  <button className="menu-item">Снять</button>
                  <button className="menu-item">Продать</button>
                  <button className="menu-item">Сдать</button>
                  <button className="menu-item">Новостройки</button>
                  <button className="menu-item">Загородная</button>
                  <button className="menu-item">Коммерческая</button>
                </div>
              </div>
            </div>

            {/* Logo */}
            <Link href="/" className="logo-container">
              <div className="logo">
                <Image
                  src="/placeholder-logo.png"
                  alt="Company Logo"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            </Link>

            {/* Company Name */}
            <Link href="/">
              <span className="company-name">Property Market</span>
            </Link>
          </div>

          {/* Center section */}
          <div className="nav-center d-none d-lg-flex">
            <CitySelector />
          </div>

          {/* Right section */}
          <div className="nav-right">
            {/* Favorites */}
            {isAuthenticated && (
              <Link href="/favorites" className="icon-button d-none d-md-block">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
            )}

            {/* Messages */}
            <Link href="/messages" className="icon-button d-none d-md-block">
              <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </Link>

            {/* Post Ad Button */}
            <button className="post-ad-button d-none d-sm-block">
              Разместить объявление
            </button>

            {/* About House */}
            <button className="about-house-button d-none d-lg-block">
              Про дом
            </button>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
      <Navbar />
    </header>
  );
}; 