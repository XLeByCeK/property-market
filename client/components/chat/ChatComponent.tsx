import React, { useState, useEffect } from 'react';
import { Conversation, getConversations } from '../../services/chatService';
import { ConversationsList } from './';
import { MessageView } from './';
import { useAuth } from '../../context/AuthContext';

const ChatComponent: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить чаты. Попробуйте позже.');
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.user.id === updatedConversation.user.id ? updatedConversation : conv
      )
    );
  };

  return (
    <div className="chat-container row">
      <div className="col-md-4 border-end">
        <div className="conversations-container p-3">
          <h5 className="mb-3">Ваши чаты</h5>
          {loading ? (
            <div className="text-center mt-4">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : conversations.length === 0 ? (
            <p className="text-muted">У вас пока нет сообщений</p>
          ) : (
            <ConversationsList 
              conversations={conversations}
              onSelectConversation={handleConversationSelect}
              selectedConversation={selectedConversation}
            />
          )}
        </div>
      </div>
      <div className="col-md-8">
        {selectedConversation ? (
          <MessageView 
            conversation={selectedConversation}
            onConversationUpdate={handleConversationUpdate}
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center text-muted p-5">
              <p>Выберите чат, чтобы начать общение</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent; 