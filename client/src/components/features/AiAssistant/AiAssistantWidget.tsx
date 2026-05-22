'use client';

import Link from 'next/link';

import { useState } from 'react';
import { AiProperty, useAiAssistant } from '../../../context/AiAssistantContext';
import { aiSearch } from '../../../services/ai.service';
import { getImageUrl } from '../../../utils/imageUrl';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

const formatPrice = (value: number) =>
  Math.round(value).toLocaleString('ru-RU');

const RenovationBadge = ({ hasRenovation }: { hasRenovation?: boolean }) => (
  <span
    className={`ai-renovation-badge ${
      hasRenovation ? 'ai-renovation-yes' : 'ai-renovation-no'
    }`}
  >
    {hasRenovation ? 'С отделкой' : 'Без отделки'}
  </span>
);

const PropertyCard = ({
  p,
  highlight = false,
}: {
  p: AiProperty;
  highlight?: boolean;
}) => {
  const hasRenovation = Boolean(p.has_renovation);
  const showEffective =
    typeof p.effective_price === 'number' && !hasRenovation && p.effective_price > p.price;

  return (
    <div className={`ai-property-card ${highlight ? 'ai-property-card-best' : ''}`}>
      {highlight && (
        <div className="ai-best-banner">⭐ Лучший вариант по цене</div>
      )}

      <div
        className="ai-property-image-container"
        style={{ height: '200px', overflow: 'hidden' }}
      >
        {p.image ? (
          <img
            src={getImageUrl(p.image)}
            alt={p.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="ai-no-image">Нет фото</div>
        )}
      </div>

      <div className="ai-property-info">
        <div className="ai-property-header">
          <strong>{p.title}</strong>
          <RenovationBadge hasRenovation={hasRenovation} />
        </div>

        <div className="ai-property-price">{formatPrice(p.price)} ₽</div>

        {showEffective && (
          <div className="ai-property-effective">
            ≈ {formatPrice(p.effective_price as number)} ₽ с учётом ремонта (+30%)
          </div>
        )}

        <Link href={`/property/${p.id}`} className="ai-property-link">
          Перейти →
        </Link>
      </div>
    </div>
  );
};

export const AiAssistantWidget = () => {
  const {
    isOpen,
    close,
    properties,
    setProperties,
    recommended,
    setRecommended,
    reasoning,
    setReasoning,
  } = useAiAssistant();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: '👋 Опишите, какую недвижимость вы ищете — я подберу подходящие варианты и предложу самый выгодный.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

    try {
      const data = await aiSearch(userMessage);

      console.log('Данные от AI:', data);

      setProperties(data.properties || []);
      setRecommended(data.recommended ?? null);
      setReasoning(data.reasoning ?? '');

      const count = data.properties?.length ?? 0;
      const botText =
        count === 0
          ? 'К сожалению, подходящих объектов не найдено 😔 Попробуйте уточнить запрос.'
          : data.recommended
          ? `Я нашёл ${count} подходящих ${
              count === 1 ? 'вариант' : 'варианта/ов'
            }. Лучшее предложение я выделил отдельно 👇`
          : `Я нашёл ${count} подходящих вариантов 👇`;

      setMessages(prev => [...prev, { role: 'bot', text: botText }]);

      if (data.reasoning) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reasoning }]);
      }
    } catch (e) {
      console.error('AI SEARCH ERROR:', e);

      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Произошла ошибка. Попробуйте ещё раз 🙏' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Чтобы не дублировать рекомендованный объект в общем списке.
  const otherProperties = recommended
    ? properties.filter(p => p.id !== recommended.id)
    : properties;

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

        <div className="ai-content">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`ai-message ${m.role === 'bot' ? 'ai-bot' : 'ai-user'}`}
            >
              {m.text}
            </div>
          ))}

          {recommended && (
            <div className="ai-properties ai-properties-best">
              <PropertyCard p={recommended} highlight />
            </div>
          )}

          {otherProperties.length > 0 && (
            <>
              {recommended && (
                <div className="ai-section-title">Другие подходящие варианты</div>
              )}
              <div className="ai-properties">
                {otherProperties.map(p => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
            </>
          )}

          {loading && <div className="ai-message ai-bot">⏳ Думаю…</div>}
        </div>

        <div className="ai-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Например: 2-комнатная в центре или «подбери самое выгодное»"
          />
          <button className="ai-send" onClick={handleSend} aria-label="Отправить">
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
