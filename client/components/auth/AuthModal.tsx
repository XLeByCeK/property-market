import React, { useState } from 'react';

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
    firstName: '',
    lastName: '',
    birthDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки данных на сервер
    console.log('Form submitted:', formData);
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

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="auth-form-group">
                <label className="auth-form-label">Имя</label>
                <input
                  type="text"
                  name="firstName"
                  className="auth-form-input"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-form-label">Фамилия</label>
                <input
                  type="text"
                  name="lastName"
                  className="auth-form-input"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <div className="auth-form-group">
            <label className="auth-form-label">Email или номер телефона</label>
            <input
              type="text"
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
                required
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
                name="birthDate"
                className="auth-form-input"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-form-submit">
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>

          <button
            type="button"
            className="auth-form-toggle"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}; 