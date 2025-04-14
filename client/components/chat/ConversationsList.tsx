import React from 'react';
import { Conversation } from '../../services/chatService';
import Image from 'next/image';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Invalid date:', dateString);
      return '';
    }
  };

  // Get first name safely
  const getFirstName = (user: any) => {
    return user.firstName || user.first_name || '';
  };

  // Get last name safely
  const getLastName = (user: any) => {
    return user.lastName || user.last_name || '';
  };

  // Get user initials
  const getUserInitials = (user: any) => {
    const firstName = getFirstName(user);
    const lastName = getLastName(user);
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <div
          key={`${conversation.user.id}-${conversation.property?.id || 'direct'}`}
          className={`conversation-item p-3 mb-2 rounded ${
            selectedConversation?.user.id === conversation.user.id
              ? 'bg-light'
              : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex align-items-center">
            <div className="avatar-container me-3">
              <div className="avatar rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                {getUserInitials(conversation.user)}
              </div>
            </div>
            <div className="conversation-info flex-grow-1">
              <div className="d-flex justify-content-between">
                <h6 className="mb-0">
                  {getFirstName(conversation.user)} {getLastName(conversation.user)}
                </h6>
                <small className="text-muted">
                  {conversation.lastMessage ? formatDate(conversation.lastMessage.created_at) : ''}
                </small>
              </div>
              {conversation.property && (
                <small className="text-muted d-block">
                  Объект: {conversation.property.title}
                </small>
              )}
              <p className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                {conversation.lastMessage ? conversation.lastMessage.message : 'Нет сообщений'}
              </p>
              {conversation.unreadCount > 0 && (
                <span className="badge bg-primary rounded-pill">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationsList; 