import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, getMessages, sendMessage, markAsRead } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

interface MessageViewProps {
  conversation: Conversation;
  onConversationUpdate: (conversation: Conversation) => void;
}

const MessageView: React.FC<MessageViewProps> = ({ conversation, onConversationUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Create a unique ID for the conversation to track changes
  const getConversationId = (conv: Conversation) => {
    return `${conv.user.id}-${conv.property?.id || 'direct'}`;
  };

  // Fetch messages when conversation truly changes (not on every render)
  useEffect(() => {
    const currentConversationId = getConversationId(conversation);
    
    // Only fetch messages if this is a new conversation
    if (currentConversationId !== activeConversationId) {
      setActiveConversationId(currentConversationId);
      
      const fetchMessages = async () => {
        if (!user) {
          setLoading(false);
          setError('Необходима авторизация');
          return;
        }
        
        // Check if this is a self-conversation
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
            console.log('Fetching messages for property ID:', conversation.property.id);
            
            const data = await getMessages(
              conversation.user.id,
              conversation.property.id
            );
            
            console.log('Messages loaded:', data);
            setMessages(data);
            
            // If no messages found
            if (data.length === 0) {
              setError(null); // Clear error, this is normal for new conversations
            }
          } else {
            // Если нет property_id, это прямой чат между пользователями
            console.log('Fetching direct messages with user ID:', conversation.user.id);
            setMessages([]); // В текущей реализации нет прямых сообщений
            setError('Прямые сообщения не поддерживаются');
          }
          
          // Handle unread messages if needed
          onConversationUpdate({
            ...conversation,
            unreadCount: 0
          });
        } catch (err: any) {
          console.error('Error loading messages:', err);
          setError(err.message || 'Не удалось загрузить сообщения');
        } finally {
          setLoading(false);
        }
      };

      fetchMessages();
    }
  }, [conversation, user, onConversationUpdate, activeConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !conversation.user.id) {
      return;
    }
    
    try {
      setSending(true);
      setError(null);
      
      if (!conversation.property?.id) {
        throw new Error('Нельзя отправить сообщение без привязки к объекту недвижимости');
      }
      
      // Prevent sending messages to oneself
      if (conversation.user.id === user.id) {
        throw new Error('Нельзя отправить сообщение самому себе');
      }
      
      console.log('Sending message to:', conversation.user.id, 'for property:', conversation.property.id);
      const sentMessage = await sendMessage(
        conversation.user.id,
        newMessage,
        conversation.property.id
      );
      
      console.log('Message sent:', sentMessage);
      
      // Add message to list and clear input
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update conversation with latest message
      onConversationUpdate({
        ...conversation,
        lastMessage: sentMessage
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  // Get first name safely
  const getFirstName = (user: any) => {
    return user?.firstName || user?.first_name || '';
  };

  // Get last name safely
  const getLastName = (user: any) => {
    return user?.lastName || user?.last_name || '';
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

  return (
    <div className="message-view d-flex flex-column h-100">
      {/* Conversation header */}
      <div className="chat-header p-3 border-bottom">
        <h5 className="mb-0">
          {conversation.user.id === user?.id 
            ? 'Нет получателя (ошибка адресации)' 
            : `${getFirstName(conversation.user)} ${getLastName(conversation.user)}`.trim() || 'Неизвестный пользователь'}
        </h5>
        {conversation.property && (
          <small className="text-muted">
            Объект: {conversation.property.title || `ID: ${conversation.property.id}`}
          </small>
        )}
      </div>
      
      {/* Messages area */}
      <div className="messages-container p-3 flex-grow-1" style={{ 
        overflowY: 'auto', 
        height: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        {messages.length === 0 ? (
          <div className="text-center text-muted my-5">
            <p>Начните общение прямо сейчас</p>
          </div>
        ) : (
          messages.map((message) => {
            const isFromCurrentUser = message.sender_id === user?.id;
            
            // Debug message data during render
            console.log(`Rendering message ${message.id}:`, {
              sender: message.sender,
              recipient: message.recipient,
              isFromCurrentUser,
              sender_id: message.sender_id,
              current_user_id: user?.id
            });
            
            return (
              <div 
                key={message.id} 
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
                    overflow: 'hidden'
                  }}
                >
                  {!isFromCurrentUser && (
                    <div className="mb-1 small fw-bold">
                      {getFirstName(message.sender)} {getLastName(message.sender)}
                    </div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    {message.message}
                  </div>
                  <div className="text-end mt-2">
                    <small className={`${isFromCurrentUser ? 'text-white-50' : 'text-muted'}`}>
                      {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </small>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
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
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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