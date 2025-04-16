import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Conversation, getConversations, Message, sendMessage, getMessages } from '../../services/chatService';
import { ConversationsList } from './';
import { MessageView } from './';
import { useAuth } from '../../context/AuthContext';

interface UserForConversation {
  id: number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
}

const ChatComponent: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [directConversationLoading, setDirectConversationLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { userId, propertyId } = router.query;

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        console.log('Fetching conversations...');
        const data = await getConversations();
        console.log('Conversations loaded:', data);
        
        // Filter out self-conversations where user.id matches current user id
        const filtered = data.filter(conv => conv.user.id !== user?.id);
        console.log('After filtering out self-conversations:', filtered);
        
        setConversations(filtered);
        
        // Check if we need to auto-select a conversation from URL params
        if (userId) {
          const targetUserId = Number(userId);
          
          // Try to find an existing conversation with this user
          const existingConv = filtered.find(conv => 
            conv.user.id === targetUserId && 
            (!propertyId || conv.property?.id === Number(propertyId))
          );
          
          if (existingConv) {
            // We found an existing conversation, select it
            setSelectedConversation(existingConv);
          } else if (propertyId) {
            // We need to create a new conversation
            await handleDirectConversation(targetUserId, Number(propertyId));
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load conversations:', err);
        setError(err.message || 'Не удалось загрузить чаты. Попробуйте позже.');
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [user, userId, propertyId]);

  // Handle direct conversation creation for URL params
  const handleDirectConversation = async (targetUserId: number, propertyId: number) => {
    if (user?.id === targetUserId) {
      setError('Невозможно начать чат с самим собой');
      return;
    }
    
    try {
      setDirectConversationLoading(true);
      
      // First check if we can get messages (conversation exists but wasn't in the list)
      let messages: Message[] = [];
      try {
        messages = await getMessages(targetUserId, propertyId);
      } catch (err) {
        console.log('No existing messages found, will create a new conversation');
      }
      
      // If no existing messages, create the conversation with an initial message
      if (messages.length === 0) {
        await sendMessage(
          targetUserId,
          `Здравствуйте! Меня интересует ваше объявление с ID ${propertyId}`,
          propertyId
        );
        
        // Fetch messages again to get the newly created conversation
        messages = await getMessages(targetUserId, propertyId);
      }
      
      if (messages.length > 0) {
        // Create a new conversation object
        const message = messages[0];
        const otherUser = message.sender_id === user?.id ? message.recipient : message.sender;
        
        const newConversation: Conversation = {
          user: otherUser as UserForConversation,
          property: message.property,
          lastMessage: message,
          unreadCount: 0
        };
        
        // Add this conversation to the list
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
      }
    } catch (err) {
      console.error('Failed to create direct conversation:', err);
      setError('Не удалось создать чат. Пожалуйста, попробуйте позже.');
    } finally {
      setDirectConversationLoading(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Update the URL to reflect the selected conversation
    const query: { userId: string; propertyId?: string } = { 
      userId: conversation.user.id.toString() 
    };
    
    if (conversation.property) {
      query.propertyId = conversation.property.id.toString();
    }
    
    router.push({
      pathname: '/messages',
      query
    }, undefined, { shallow: true });
  };

  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.user.id === updatedConversation.user.id && 
        (conv.property?.id === updatedConversation.property?.id || 
         (!conv.property && !updatedConversation.property))
          ? updatedConversation : conv
      )
    );
  };

  const isLoading = loading || directConversationLoading;

  return (
    <div className="chat-container row">
      <div className="col-md-4 border-end">
        <div className="conversations-container p-3">
          <h5 className="mb-3">Ваши чаты</h5>
          {isLoading ? (
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
              {isLoading ? (
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Загрузка чата...</span>
                </div>
              ) : (
                <p>Выберите чат, чтобы начать общение</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent; 