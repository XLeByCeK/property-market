'use client';

import Link from 'next/link';

import { useState } from 'react';
import { useAiAssistant } from '../../context/AiAssistantContext';
import { aiSearch } from '../../services/ai.service';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

// 👉 тип недвижимости (подстрой под свой backend при необходимости)
type Property = {
  id: number; // В консоли у вас число (2), а не string
  title: string;
  price: number;
  city_id: number; // Соответствует вашему объекту из консоли
  image?: string;  // Это поле мы добавили в маппинге выше
};

// 👉 карточка недвижимости
const PropertyCard = ({ p }: { p: Property }) => (
  <div className="ai-property-card">
    <div className="ai-property-image-container" style={{ height: '200px', overflow: 'hidden' }}>
      {p.image ? (
        <img 
          src={p.image} 
          alt={p.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      ) : (
        <div className="ai-no-image">Нет фото</div>
      )}
    </div>

    <div className="ai-property-info">
      <strong>{p.title}</strong>{/* Или p.city.name, если сделаете include city */}
      <div>{p.price.toLocaleString()} ₽</div>

      <Link href={`/property/${p.id}`} className="ai-property-link">
        Перейти →
      </Link>
    </div>
  </div>
);

export const AiAssistantWidget = () => {

  
  // ⬇️ ВАЖНО: теперь берём properties
  const { isOpen, close, setProperties, properties } = useAiAssistant();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: '👋 Опишите, какую недвижимость вы ищете',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    
    setMessages(prev => [
      ...prev,
      { role: 'user', text: userMessage },
    ]);

    try {
      const data = await aiSearch(userMessage);

      console.log('Данные от AI:', data.properties);

      // сохраняем объекты
      setProperties(data.properties);

      

      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text:
            data.properties.length > 0
              ? `Я нашёл ${data.properties.length} подходящих вариантов 👇`
              : 'К сожалению, подходящих объектов не найдено 😔',
        },
      ]);
    } catch (e) {
      console.error('AI SEARCH ERROR:', e);

      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: 'Произошла ошибка. Попробуйте ещё раз 🙏',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && <div className="ai-overlay" onClick={close} />}

      <aside className={`ai-widget ${isOpen ? 'open' : ''}`}>
        <div className="ai-header">
          <span>ИИ-помощник</span>
          <button className="ai-close" onClick={close} aria-label="Закрыть">
            ✕
          </button>
        </div>

        {/* Чат */}
        <div className="ai-content">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`ai-message ${m.role === 'bot' ? 'ai-bot' : 'ai-user'}`}
            >
              {m.text}
            </div>
          ))}

          {/* 👉 КАРТОЧКИ НЕДВИЖИМОСТИ */}
          {properties.length > 0 && (
            <div className="ai-properties">
              {properties.map(p => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          )}

          {loading && (
            <div className="ai-message ai-bot">⏳ Думаю…</div>
          )}
        </div>

        {/* Input */}
        <div className="ai-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Например: 2-комнатная в центре…"
          />
          <button
            className="ai-send"
            onClick={handleSend}
            aria-label="Отправить"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};
