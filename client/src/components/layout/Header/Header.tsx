'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from './Navbar';
import { CitySelector } from './CitySelector';
import { UserMenu } from './UserMenu';
import { useAuth } from '../../../context/AuthContext';
import { useAiAssistant } from '../../../context/AiAssistantContext';


export const Header = () => {
  
  const { toggle } = useAiAssistant();

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const handleHamburgerClick = () => {
    const mobileMenu = document.querySelector('.navbar-mobile');
    if (mobileMenu) {
      mobileMenu.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
  };

  // Функция для навигации с закрытием меню при необходимости
  const navigateTo = (path: string) => {
    router.push(path);
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
                  <Link href="/category/buy" className="menu-item">Купить</Link>
                  <Link href="/category/rent" className="menu-item">Снять</Link>
                  <Link href="/property/create" className="menu-item">Продать</Link>
                  <Link href="/property/create" className="menu-item">Сдать</Link>
                  <Link href="/category/new-buildings" className="menu-item">Новостройки</Link>
                  <Link href="/category/country" className="menu-item">Загородная</Link>
                  <Link href="/category/commercial" className="menu-item">Коммерческая</Link>
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
            <Link href="/property/create" className="post-ad-button d-none d-sm-block">
              Разместить объявление
            </Link>

            {/* About House */}
            <button className="about-house-button d-none d-lg-block">
              Про дом
            </button>

            <button
              className="ai-assistant-button"
              onClick={toggle}
            >
              <svg
                className="ai-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Иконка "мозг + чат" */}
                <path d="M12 2a4 4 0 00-4 4v1a3 3 0 00-3 3v1a3 3 0 003 3v1a4 4 0 008 0v-1a3 3 0 003-3v-1a3 3 0 00-3-3V6a4 4 0 00-4-4z" />
                <path d="M8 10h.01M12 10h.01M16 10h.01" />  
              </svg>
              <span className="ai-text">AI</span>
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