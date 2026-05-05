import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Layout } from '../components/layout/Layout';
import { getPropertyById, getPropertiesForSale, PropertyFromAPI, mapPropertyFromAPI, Property } from '../services/propertyService';

interface EvaluationResults {
  status: 'loading' | 'success' | 'error';
  price: number;
  lowPrice: number;
  marketPrice: number;
  highPrice: number;
  priceStatus: 'low' | 'market' | 'high' | null;
  similarListings: number;
}

const PropertyEvaluationPage: React.FC = () => {
  const router = useRouter();
  
  // Вспомогательные функции для статистических расчетов
  const getMedian = (values: number[]): number => {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
    }
    
    return sorted[middle];
  };
  
  const getPercentile = (values: number[], percentile: number): number => {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.max(0, Math.min(sorted.length - 1, 
      Math.floor(sorted.length * percentile / 100)));
    
    return sorted[index];
  };
  
  // Form state
  const [propertyType, setPropertyType] = useState('');
  const [rooms, setRooms] = useState('');
  const [area, setArea] = useState('');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  
  // Evaluation results
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResults | null>(null);

  // Handle form submission
  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading state
    setEvaluationResults({
      status: 'loading',
      price: 0,
      lowPrice: 0,
      marketPrice: 0,
      highPrice: 0,
      priceStatus: null,
      similarListings: 0
    });
    
    try {
      // Fetch properties for sale - запрашиваем максимальное количество объявлений
      const properties = await getPropertiesForSale(500);
      
      // Важная проверка на наличие данных
      if (!properties || properties.length === 0) {
        console.error('No properties found in database for evaluation');
        setEvaluationResults({
          status: 'error',
          price: 0,
          lowPrice: 0,
          marketPrice: 0,
          highPrice: 0,
          priceStatus: null,
          similarListings: 0
        });
        return;
      }
      
      // Детальный анализ полученных данных
      console.log(`Total properties received: ${properties.length}`);
      
      // Проанализируем имеющиеся данные
      const roomsDistribution: Record<string, number> = {};
      const typesDistribution: Record<string, number> = {};
      
      properties.forEach(p => {
        roomsDistribution[p.rooms] = (roomsDistribution[p.rooms] || 0) + 1;
        typesDistribution[p.propertyType] = (typesDistribution[p.propertyType] || 0) + 1;
      });
      
      console.log('Rooms distribution:', roomsDistribution);
      console.log('Property types distribution:', typesDistribution);
      
      // Функция для нормализации строк типа жилья
      const normalizePropertyType = (type: string): string => {
        type = type.toLowerCase();
        if (type.includes('квартир')) return 'квартира';
        if (type.includes('дом')) return 'дом';
        if (type.includes('таун')) return 'таунхаус';
        if (type.includes('вилл')) return 'вилла';
        return type;
      };
      
      // Нормализуем тип жилья для поиска
      const normalizedPropertyType = propertyType ? normalizePropertyType(propertyType) : '';
      const numRooms = rooms === 'studio' ? 0 : Number(rooms);
      
      console.log('Normalized search criteria:', { 
        propertyType, 
        normalizedPropertyType,
        rooms, 
        numRooms
      });
      
      // Уровень 1: Точное совпадение типа и комнат
      let similarProperties = properties.filter(p => {
        // Проверка комнат
        let roomsMatch = false;
        if (rooms) {
          if (numRooms === 0) {
            roomsMatch = p.rooms.toLowerCase().includes('студ');
          } else {
            const roomDigits = p.rooms.match(/\d+/);
            if (roomDigits) {
              const pRooms = parseInt(roomDigits[0]);
              roomsMatch = numRooms === pRooms;
            }
          }
        } else {
          roomsMatch = true;
        }
        
        // Проверка типа недвижимости
        let typeMatch = true;
        if (normalizedPropertyType) {
          typeMatch = normalizePropertyType(p.propertyType).includes(normalizedPropertyType);
        }
        
        return roomsMatch && typeMatch;
      });
      
      console.log(`Level 1 (exact match): Found ${similarProperties.length} properties`);
      
      // Уровень 2: Если не найдено достаточно объявлений, расширяем поиск комнат (±1)
      if (similarProperties.length < 5 && rooms) {
        similarProperties = properties.filter(p => {
          // Проверка комнат с допуском ±1
          let roomsMatch = false;
          if (numRooms === 0) {
            // Для студий ищем и 1-комнатные
            roomsMatch = p.rooms.toLowerCase().includes('студ') || p.rooms.includes('1 ');
          } else {
            const roomDigits = p.rooms.match(/\d+/);
            if (roomDigits) {
              const pRooms = parseInt(roomDigits[0]);
              roomsMatch = Math.abs(numRooms - pRooms) <= 1;
            }
          }
          
          // Проверка типа недвижимости
          let typeMatch = true;
          if (normalizedPropertyType) {
            typeMatch = normalizePropertyType(p.propertyType).includes(normalizedPropertyType);
          }
          
          return roomsMatch && typeMatch;
        });
        
        console.log(`Level 2 (±1 room): Found ${similarProperties.length} properties`);
      }
      
      // Уровень 3: Если по-прежнему мало объявлений, ищем только по типу
      if (similarProperties.length < 5 && normalizedPropertyType) {
        similarProperties = properties.filter(p => 
          normalizePropertyType(p.propertyType).includes(normalizedPropertyType)
        );
        
        console.log(`Level 3 (only type): Found ${similarProperties.length} properties`);
      }
      
      // Уровень 4: Используем все объявления, но не случайно, а отсортированные по релевантности
      if (similarProperties.length < 5) {
        // Сортируем все объявления по релевантности
        similarProperties = properties
          .filter(p => p.price > 0) // Берем только с ценой
          .sort((a, b) => {
            let aScore = 0;
            let bScore = 0;
            
            // Начисляем баллы за совпадение типа
            if (normalizedPropertyType) {
              if (normalizePropertyType(a.propertyType).includes(normalizedPropertyType)) aScore += 10;
              if (normalizePropertyType(b.propertyType).includes(normalizedPropertyType)) bScore += 10;
            }
            
            // Начисляем баллы за близость по комнатам
            if (rooms) {
              const aRoomMatch = a.rooms.match(/\d+/);
              const bRoomMatch = b.rooms.match(/\d+/);
              
              const aRooms = aRoomMatch ? parseInt(aRoomMatch[0]) : (a.rooms.toLowerCase().includes('студ') ? 0 : 999);
              const bRooms = bRoomMatch ? parseInt(bRoomMatch[0]) : (b.rooms.toLowerCase().includes('студ') ? 0 : 999);
              
              // Чем ближе по комнатам, тем больше баллов
              aScore += Math.max(0, 10 - Math.abs(numRooms - aRooms) * 2);
              bScore += Math.max(0, 10 - Math.abs(numRooms - bRooms) * 2);
            }
            
            return bScore - aScore; // Сортируем по убыванию баллов
          })
          .slice(0, 20); // Берем топ-20 похожих
        
        console.log(`Level 4 (sorted by relevance): Using ${similarProperties.length} most relevant properties`);
      }
      
      // Обязательно берем только объявления с ценой
      similarProperties = similarProperties.filter(p => p.price > 0);
      
      // Логирование важной информации
      console.log(`Final selection: ${similarProperties.length} properties`);
      console.log('Sample properties:', similarProperties.slice(0, 2).map(p => ({
        id: p.id,
        price: p.price,
        rooms: p.rooms,
        type: p.propertyType
      })));
      
      // Убеждаемся, что у нас есть хотя бы несколько объявлений для оценки
      if (similarProperties.length === 0) {
        setEvaluationResults({
          status: 'error',
          price: 0,
          lowPrice: 0,
          marketPrice: 0,
          highPrice: 0,
          priceStatus: null,
          similarListings: 0
        });
        console.error('No valid properties found for evaluation after all filters');
        return;
      }
      
      // Извлекаем цены
      const prices = similarProperties.map(p => p.price);
      prices.sort((a, b) => a - b);
      
      // Рассчитываем медиану для рыночной цены
      const marketPrice = getMedian(prices);
      
      // Нижняя граница цены (15-й перцентиль)
      const lowPrice = getPercentile(prices, 15);
      
      // Верхняя граница цены (85-й перцентиль)
      const highPrice = getPercentile(prices, 85);
      
      // Определяем статус цены пользователя
      const userPrice = parseInt(price);
      let priceStatus: 'low' | 'market' | 'high' = 'market';
      
      if (userPrice < lowPrice) {
        priceStatus = 'low';
      } else if (userPrice > highPrice) {
        priceStatus = 'high';
      }
      
      console.log('Calculated prices:', {
        marketPrice,
        lowPrice,
        highPrice,
        userPrice,
        priceStatus
      });
      
      setEvaluationResults({
        status: 'success',
        price: userPrice,
        lowPrice,
        marketPrice,
        highPrice,
        priceStatus,
        similarListings: similarProperties.length
      });
    } catch (error) {
      console.error('Error evaluating property:', error);
      setEvaluationResults({
        status: 'error',
        price: 0,
        lowPrice: 0,
        marketPrice: 0,
        highPrice: 0,
        priceStatus: null,
        similarListings: 0
      });
    }
  };

  const renderEvaluationResults = () => {
    if (!evaluationResults) {
      return null;
    }
    
    if (evaluationResults.status === 'loading') {
      return (
        <div className="evaluation-loading">
          <div className="spinner"></div>
          <p>Анализируем данные рынка...</p>
        </div>
      );
    }
    
    if (evaluationResults.status === 'error') {
      return (
        <div className="evaluation-error">
          <p>Произошла ошибка при оценке недвижимости. Пожалуйста, попробуйте снова или измените параметры поиска.</p>
        </div>
      );
    }
    
    return (
      <div className="evaluation-results">
        <h2>Оценка стоимости</h2>
        <p className="evaluation-note">
          Оценка была сделана на основе {evaluationResults.similarListings} похожих объявлений
        </p>
        
        <div className="price-ranges">
          <div className="price-range low">
            <div className="price-label">Заниженная цена</div>
            <div className="price-value">
              {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(evaluationResults.lowPrice)}
            </div>
            {evaluationResults.priceStatus === 'low' && (
              <div className="your-price-marker">Ваша цена</div>
            )}
          </div>
          
          <div className="price-range market">
            <div className="price-label">Рыночная цена</div>
            <div className="price-value">
              {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(evaluationResults.marketPrice)}
            </div>
            {evaluationResults.priceStatus === 'market' && (
              <div className="your-price-marker">Ваша цена</div>
            )}
          </div>
          
          <div className="price-range high">
            <div className="price-label">Высокая цена</div>
            <div className="price-value">
              {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(evaluationResults.highPrice)}
            </div>
            {evaluationResults.priceStatus === 'high' && (
              <div className="your-price-marker">Ваша цена</div>
            )}
          </div>
        </div>
        
        <ul className="benefits-list">
          <li>
            <span className="checkmark">✓</span>
            Рыночная цена поможет продать недвижимость выгодно и уменьшить срок поиска покупателя
          </li>
          <li>
            <span className="checkmark">✓</span>
            Если укажете стоимость в пределах рыночной, в объявлении появится отметка <span className="market-badge">Рыночная цена</span>
          </li>
        </ul>
        
        <button className="list-property-button" onClick={() => router.push('/sell')}>
          Разместить объявление
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="property-evaluation-page">
        <div className="container">
          <div className="evaluation-banner">
            <div className="evaluation-banner-content">
              <div className="image-container">
                <Image
                  src="/images/banner-bg.jpg"
                  alt="Property evaluation"
                  width={700}
                  height={600}
                  priority
                  className="evaluation-image"
                />
              </div>
              
              <div className="evaluation-form-container">
                <h1>Оценка стоимости недвижимости</h1>
                <p>Заполните параметры объекта для точной оценки</p>
                
                <form className="evaluation-form" onSubmit={handleEvaluate}>
                  <div className="form-row">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      required
                    >
                      <option value="">Тип недвижимости</option>
                      <option value="квартира">Квартира</option>
                      <option value="дом">Дом</option>
                      <option value="таунхаус">Таунхаус</option>
                      <option value="вилла">Вилла</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <select
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      required
                    >
                      <option value="">Количество комнат</option>
                      <option value="studio">Студия</option>
                      <option value="1">1 комната</option>
                      <option value="2">2 комнаты</option>
                      <option value="3">3 комнаты</option>
                      <option value="4+">4+ комнаты</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Площадь, м²"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-row double">
                    <input
                      type="number"
                      placeholder="Этаж"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Этажей в доме"
                      value={totalFloors}
                      onChange={(e) => setTotalFloors(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Адрес"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Ваша цена, ₽"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <button type="submit" className="evaluate-button">
                      Рассчитать цену
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {evaluationResults && (
            <>
              <div className="separator"></div>
              {renderEvaluationResults()}
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .property-evaluation-page {
          padding: 80px 0 50px;
        }
        
        .evaluation-banner {
          background-color: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .evaluation-banner-content {
          display: flex;
          width: 100%;
        }
        
        .image-container {
          flex: 1;
          max-width: 50%;
          position: relative;
          overflow: hidden;
        }
        
        .evaluation-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .evaluation-form-container {
          flex: 1;
          max-width: 50%;
          padding: 30px;
          background-color: #fff;
        }
        
        .evaluation-form-container h1 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #333;
        }
        
        .evaluation-form-container p {
          color: #666;
          margin-bottom: 20px;
          font-size: 15px;
        }
        
        .evaluation-form {
          width: 100%;
        }
        
        .form-row {
          margin-bottom: 12px;
        }
        
        .form-row.double {
          display: flex;
          gap: 10px;
        }
        
        .form-row input,
        .form-row select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .form-row input:focus,
        .form-row select:focus {
          outline: none;
          border-color: #4a76a8;
          box-shadow: 0 0 0 2px rgba(74, 118, 168, 0.2);
        }
        
        .evaluate-button {
          width: 100%;
          padding: 12px;
          background-color: #4a76a8;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .evaluate-button:hover {
          background-color: #3d6293;
        }
        
        .evaluation-results {
          max-width: 1200px;
          margin: 30px auto 0;
          padding: 25px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .evaluation-results h2 {
          font-size: 22px;
          margin-bottom: 10px;
          color: #333;
        }
        
        .evaluation-note {
          color: #666;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .price-ranges {
          display: flex;
          gap: 15px;
          margin: 25px 0;
        }
        
        .price-range {
          flex: 1;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          position: relative;
        }
        
        .price-range.low {
          background-color: #ffefd5;
        }
        
        .price-range.market {
          background-color: #e6f7e6;
        }
        
        .price-range.high {
          background-color: #ffe6e6;
        }
        
        .price-label {
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .price-range.low .price-label {
          color: #ff8c00;
        }
        
        .price-range.market .price-label {
          color: #2e8b57;
        }
        
        .price-range.high .price-label {
          color: #dc3545;
        }
        
        .price-value {
          font-size: 20px;
          font-weight: 700;
          color: #333;
        }
        
        .your-price-marker {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #4a76a8;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .benefits-list {
          margin: 25px 0;
          padding: 0;
          list-style: none;
        }
        
        .benefits-list li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          line-height: 1.5;
          font-size: 14px;
        }
        
        .checkmark {
          color: #2e8b57;
          font-weight: bold;
          margin-right: 10px;
          font-size: 16px;
        }
        
        .market-badge {
          display: inline-block;
          background-color: #e6f7e6;
          color: #2e8b57;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .list-property-button {
          display: block;
          width: 100%;
          padding: 12px;
          background-color: #4a76a8;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          text-align: center;
        }
        
        .list-property-button:hover {
          background-color: #3d6293;
        }
        
        .evaluation-loading {
          text-align: center;
          padding: 30px;
        }
        
        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(74, 118, 168, 0.2);
          border-radius: 50%;
          border-top-color: #4a76a8;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        
        .evaluation-error {
          padding: 20px;
          background-color: #fff3f3;
          border-left: 4px solid #dc3545;
          color: #dc3545;
          border-radius: 4px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive styles */
        @media (max-width: 991.98px) {
          .evaluation-banner-content {
            flex-direction: column;
          }
          
          .image-container {
            max-width: 100%;
            height: 250px;
          }
          
          .evaluation-form-container {
            max-width: 100%;
            padding: 20px;
          }
          
          .price-ranges {
            flex-direction: column;
            gap: 30px;
          }
          
          .your-price-marker {
            top: -10px;
          }
        }
        
        .separator {
          height: 1px;
          background: linear-gradient(to right, rgba(74, 118, 168, 0.1), rgba(74, 118, 168, 0.5), rgba(74, 118, 168, 0.1));
          margin: 30px 0;
        }
      `}</style>
    </Layout>
  );
};

export default PropertyEvaluationPage; 