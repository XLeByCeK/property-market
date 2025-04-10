import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { ChatComponent } from '../components/chat';
import Link from 'next/link';

const MessagesPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
      <div className="container mt-4">
        <h1 className="mb-4">Сообщения</h1>
        
        {isAuthenticated ? (
          <ChatComponent />
        ) : (
          <div className="alert alert-info">
            <p>Для доступа к сообщениям необходимо войти в аккаунт.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                // Store the intended destination to redirect back after login
                localStorage.setItem('redirectAfterLogin', '/messages');
                router.push('/');
              }}
            >
              Войти
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MessagesPage; 