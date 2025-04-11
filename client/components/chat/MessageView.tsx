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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getMessages(
          conversation.user.id,
          conversation.property?.id
        );
        setMessages(data);
        
        // Mark unread messages as read
        const unreadMessageIds = data
          .filter(msg => !msg.is_read && msg.sender_id === conversation.user.id)
          .map(msg => msg.id);
          
        if (unreadMessageIds.length > 0) {
          await markAsRead(unreadMessageIds);
          
          // Update conversation to show 0 unread
          onConversationUpdate({
            ...conversation,
            unreadCount: 0
          });
        }
      } catch (err) {
        setError('Не удалось загрузить сообщения');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation, user, onConversationUpdate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    try {
      setSending(true);
      
      const sentMessage = await sendMessage(
        conversation.user.id,
        newMessage,
        conversation.property?.id
      );
      
      // Add message to list and clear input
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update conversation with latest message
      onConversationUpdate({
        ...conversation,
        lastMessage: sentMessage
      });
    } catch (err) {
      setError('Не удалось отправить сообщение');
      console.error(err);
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

  return (
    <div className="message-view d-flex flex-column h-100">
      {/* Conversation header */}
      <div className="chat-header p-3 border-bottom">
        <h5 className="mb-0">
          {conversation.user.first_name} {conversation.user.last_name}
        </h5>
        {conversation.property && (
          <small className="text-muted">
            Объект: {conversation.property.title}
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