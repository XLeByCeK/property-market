import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { ChatComponent } from '../components/chat';
import { AuthModal } from '../components/auth/AuthModal';
import Link from 'next/link';

const MessagesPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = '';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mt-5 pt-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-5 pt-5">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4 p-3 bg-light rounded shadow-sm">Сообщения</h1>
          </div>
        </div>
        
        {isAuthenticated ? (
          <ChatComponent />
        ) : (
          <div className="alert alert-info">
            <p>Для доступа к сообщениям необходимо войти в аккаунт.</p>
            <button 
              className="btn btn-primary"
              onClick={handleAuthClick}
            >
              Войти
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </Layout>
  );
};

export default MessagesPage; 