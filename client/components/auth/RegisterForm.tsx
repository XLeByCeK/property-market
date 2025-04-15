import React, { useState } from 'react';
import { useAuth, RegisterData } from '../../context/AuthContext';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    role: 'BUYER'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting registration form with data:', JSON.stringify(formData));
      // Преобразуем поля в формат snake_case
      const convertedData = {
        ...formData,
        // Сохраняем оригинальные поля и добавляем snake_case версии
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate
      };
      console.log('Converted data for registration:', JSON.stringify(convertedData));
      await register(convertedData);
      onSuccess();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Пароль</label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="firstName" className="form-label">Имя</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="lastName" className="form-label">Фамилия</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="phone" className="form-label">Телефон</label>
        <input
          type="tel"
          className="form-control"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="birthDate" className="form-label">Дата рождения</label>
        <input
          type="date"
          className="form-control"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="role" className="form-label">Роль</label>
        <select
          className="form-select"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="BUYER">Покупатель</option>
          <option value="SELLER">Продавец</option>
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Регистрация...
          </>
        ) : (
          'Зарегистрироваться'
        )}
      </button>
    </form>
  );
};

export default RegisterForm; 