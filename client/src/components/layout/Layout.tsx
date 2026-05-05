'use client';

import React from 'react';
import { Header } from './Header/Header';
import { AiAssistantWidget } from '../AiAssistant/AiAssistantWidget';
import { AiAssistantProvider } from '../../context/AiAssistantContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AiAssistantProvider>
      <div className="min-h-screen">
        <Header />
        {children}
        <AiAssistantWidget />
      </div>
    </AiAssistantProvider>
  );
};
