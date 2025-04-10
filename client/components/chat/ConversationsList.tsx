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
                {conversation.user.first_name.charAt(0) + conversation.user.last_name.charAt(0)}
              </div>
            </div>
            <div className="conversation-info flex-grow-1">
              <div className="d-flex justify-content-between">
                <h6 className="mb-0">
                  {conversation.user.first_name} {conversation.user.last_name}
                </h6>
                <small className="text-muted">
                  {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                </small>
              </div>
              {conversation.property && (
                <small className="text-muted d-block">
                  Объект: {conversation.property.title}
                </small>
              )}
              <p className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                {conversation.lastMessage.message}
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