import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="footer mt-auto py-4 bg-dark text-white">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Property Market</h5>
            <p className="text-muted">
              Сервис поиска и продажи недвижимости
            </p>
          </div>
          
          <div className="col-md-3 mb-4 mb-md-0">
            <h6>Информация</h6>
            <ul className="list-unstyled">
              <li><Link href="/about" className="text-decoration-none text-muted">О нас</Link></li>
              <li><Link href="/contact" className="text-decoration-none text-muted">Контакты</Link></li>
              <li><Link href="/terms" className="text-decoration-none text-muted">Условия использования</Link></li>
              <li><Link href="/privacy" className="text-decoration-none text-muted">Политика конфиденциальности</Link></li>
            </ul>
          </div>
          
          <div className="col-md-3 mb-4 mb-md-0">
            <h6>Сервисы</h6>
            <ul className="list-unstyled">
              <li><Link href="/search" className="text-decoration-none text-muted">Поиск недвижимости</Link></li>
              <li><Link href="/add-property" className="text-decoration-none text-muted">Разместить объявление</Link></li>
              <li><Link href="/services" className="text-decoration-none text-muted">Дополнительные услуги</Link></li>
            </ul>
          </div>
          
          <div className="col-md-2">
            <h6>Соцсети</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        
        <hr className="my-3" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="mb-3 mb-md-0">© 2023 Property Market. Все права защищены.</p>
          <div>
            <Link href="/terms" className="text-decoration-none text-muted me-3">Условия</Link>
            <Link href="/privacy" className="text-decoration-none text-muted">Конфиденциальность</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}; 