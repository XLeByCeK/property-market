import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, getMessages, sendMessage } from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';
import { getFirstName, getLastName, getFullName } from '../../../utils/user';

interface MessageViewProps {
  conversation: Conversation;
  onConversationUpdate: (conversation: Conversation) => void;
}

const getConversationId = (conv: Conversation) =>
  `${conv.user.id}-${conv.property?.id || 'direct'}`;

const MessageBubble: React.FC<{
  message: Message;
  isFromCurrentUser: boolean;
}> = ({ message, isFromCurrentUser }) => (
  <div
    className={`message mb-3 ${isFromCurrentUser ? 'text-end' : ''}`}
    style={{ maxWidth: '100%' }}
  >
    <div
      className={`message-bubble p-3 rounded ${
        isFromCurrentUser ? 'bg-primary text-white ms-auto' : 'bg-light'
      }`}
      style={{
        maxWidth: '75%',
        display: 'inline-block',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        wordWrap: 'break-word',
        overflow: 'hidden',
      }}
    >
      {!isFromCurrentUser && (
        <div className="mb-1 small fw-bold">
          {getFirstName(message.sender)} {getLastName(message.sender)}
        </div>
      )}
      <div style={{ overflow: 'hidden' }}>{message.message}</div>
      <div className="text-end mt-2">
        <small className={isFromCurrentUser ? 'text-white-50' : 'text-muted'}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </small>
      </div>
    </div>
  </div>
);

const MessageView: React.FC<MessageViewProps> = ({ conversation, onConversationUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Перезагружаем сообщения только когда смена переписки реально произошла —
  // одинаковый объект conversation может прийти при перерендере.
  useEffect(() => {
    const currentId = getConversationId(conversation);
    if (currentId === activeConversationId) return;

    setActiveConversationId(currentId);

    const fetchMessages = async () => {
      if (!user) {
        setLoading(false);
        setError('Необходима авторизация');
        return;
      }

      if (conversation.user.id === user.id) {
        setLoading(false);
        setError('Невозможно вести чат с самим собой');
        setMessages([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (conversation.property?.id) {
          const data = await getMessages(conversation.user.id, conversation.property.id);
          setMessages(data);
        } else {
          setMessages([]);
          setError('Прямые сообщения не поддерживаются');
        }

        onConversationUpdate({ ...conversation, unreadCount: 0 });
      } catch (err: any) {
        setError(err?.message || 'Не удалось загрузить сообщения');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation, user, onConversationUpdate, activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversation.user.id) return;

    try {
      setSending(true);
      setError(null);

      if (!conversation.property?.id) {
        throw new Error('Нельзя отправить сообщение без привязки к объекту недвижимости');
      }
      if (conversation.user.id === user.id) {
        throw new Error('Нельзя отправить сообщение самому себе');
      }

      const sentMessage = await sendMessage(
        conversation.user.id,
        newMessage,
        conversation.property.id
      );

      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
      onConversationUpdate({ ...conversation, lastMessage: sentMessage });
    } catch (err: any) {
      setError(err?.message || 'Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  const conversationTitle =
    conversation.user.id === user?.id
      ? 'Нет получателя (ошибка адресации)'
      : getFullName(conversation.user) || 'Неизвестный пользователь';

  return (
    <div className="message-view d-flex flex-column h-100">
      <div className="chat-header p-3 border-bottom">
        <h5 className="mb-0">{conversationTitle}</h5>
        {conversation.property && (
          <small className="text-muted">
            Объект: {conversation.property.title || `ID: ${conversation.property.id}`}
          </small>
        )}
      </div>

      <div
        className="messages-container p-3 flex-grow-1"
        style={{ overflowY: 'auto', height: '400px', display: 'flex', flexDirection: 'column' }}
      >
        {error && <div className="alert alert-danger">{error}</div>}

        {messages.length === 0 ? (
          <div className="text-center text-muted my-5">
            <p>Начните общение прямо сейчас</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFromCurrentUser={message.sender_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input p-3 border-top">
        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                'Отправить'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageView;
