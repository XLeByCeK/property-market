import React from 'react';
import { Conversation } from '../../../services/chatService';
import { getFirstName, getLastName, getFullName, getInitials } from '../../../utils/user';
import { formatShortDate } from '../../../utils/formatters';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const getChatTitle = (conversation: Conversation): string => {
  if (conversation.property?.title) return conversation.property.title;
  if (conversation.property?.id) return `Объект №${conversation.property.id}`;

  const userName = getFullName(conversation.user);
  return userName ? `Чат с ${userName}` : `Чат №${conversation.user.id}`;
};

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  return (
    <div className="conversation-list">
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.user.id === conversation.user.id;
        return (
          <div
            key={`${conversation.user.id}-${conversation.property?.id || 'direct'}`}
            className={`conversation-item p-3 mb-2 rounded ${isSelected ? 'bg-light' : ''}`}
            onClick={() => onSelectConversation(conversation)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center">
              <div className="avatar-container me-3">
                <div
                  className="avatar rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  {getInitials(conversation.user)}
                </div>
              </div>
              <div className="conversation-info flex-grow-1">
                <div className="d-flex justify-content-between">
                  <h6 className="mb-0">
                    {getFirstName(conversation.user)} {getLastName(conversation.user)}
                  </h6>
                  <small className="text-muted">
                    {formatShortDate(conversation.lastMessage?.created_at)}
                  </small>
                </div>
                {conversation.property && (
                  <small className="text-muted d-block">{getChatTitle(conversation)}</small>
                )}
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <p className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                    {conversation.lastMessage?.message || 'Нет сообщений'}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="badge bg-primary rounded-pill ms-2">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationsList;
