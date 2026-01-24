'use client';

import { useState } from 'react';
import { useAiAssistant } from '../../context/AiAssistantContext';
import { aiSearch } from '../../services/ai.service';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

export const AiAssistantWidget = () => {
  const { isOpen, close, setProperties } = useAiAssistant();

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

    // 1. Добавляем сообщение пользователя
    setMessages(prev => [
      ...prev,
      { role: 'user', text: userMessage },
    ]);

    try {
      // 2. Запрос к backend
      const data = await aiSearch(userMessage);

      // 3. Сохраняем найденные объекты
      setProperties(data.properties);

      // 4. Ответ ИИ
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
      {/* Overlay */}
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
