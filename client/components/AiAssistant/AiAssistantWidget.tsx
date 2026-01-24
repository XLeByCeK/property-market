'use client';

import { useAiAssistant } from '../../context/AiAssistantContext';

export const AiAssistantWidget = () => {
  const { isOpen, close } = useAiAssistant();

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

        <div className="ai-content">
          {/* чат */}
          <div className="ai-message ai-bot">
            👋 Опишите, какую недвижимость вы ищете
          </div>
        </div>

        <div className="ai-input">
          <input placeholder="Например: 2-комнатная в центре…" />
          <button className="ai-send" aria-label="Отправить">
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
