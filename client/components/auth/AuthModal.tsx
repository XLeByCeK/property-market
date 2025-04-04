import React, { useState } from 'react';
import { useAuth, RegisterData } from '../../context/AuthContext';
import { useRouter } from 'next/router';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    first_name: '',
    last_name: '',
    birth_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { login, register, error } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
        router.push('/profile');
      } else {
        const registerData: RegisterData = {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || undefined,
          birth_date: formData.birth_date || undefined
        };
        
        await register(registerData);
        onClose();
        router.push('/profile');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setFormError(error || 'Произошла ошибка при обработке запроса');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="auth-modal-title">
          {mode === 'login' ? 'Авторизация' : 'Регистрация'}
        </h2>

        {formError && (
          <div className="auth-form-error">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="auth-form-group">
                <label className="auth-form-label">Имя</label>
                <input
                  type="text"
                  name="first_name"
                  className="auth-form-input"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-form-label">Фамилия</label>
                <input
                  type="text"
                  name="last_name"
                  className="auth-form-input"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <div className="auth-form-group">
            <label className="auth-form-label">Email</label>
            <input
              type="email"
              name="email"
              className="auth-form-input"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="auth-form-group">
              <label className="auth-form-label">Номер телефона</label>
              <input
                type="tel"
                name="phone"
                className="auth-form-input"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="auth-form-group">
            <label className="auth-form-label">Пароль</label>
            <input
              type="password"
              name="password"
              className="auth-form-input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="auth-form-group">
              <label className="auth-form-label">Дата рождения</label>
              <input
                type="date"
                name="birth_date"
                className="auth-form-input"
                value={formData.birth_date}
                onChange={handleInputChange}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-form-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Загрузка...'
              : mode === 'login' 
                ? 'Войти' 
                : 'Зарегистрироваться'
            }
          </button>

          <button
            type="button"
            className="auth-form-toggle"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            disabled={isSubmitting}
          >
            {mode === 'login' ? 'Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}; 