import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Conversation,
  Message,
  getConversations,
  getMessages,
  sendMessage,
} from '../../../services/chatService';
import { ConversationsList, MessageView } from './';
import { useAuth } from '../../../context/AuthContext';

interface UserForConversation {
  id: number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Сравниваем разговоры так, как делает сервер: по собеседнику и опционально
 * по объявлению. Раньше эта логика дублировалась в трёх местах внутри
 * `ChatComponent` (и поэтому регулярно расходилась с действительностью).
 */
const sameConversation = (a: Conversation, b: Conversation) =>
  a.user.id === b.user.id &&
  (a.property?.id === b.property?.id || (!a.property && !b.property));

const ChatComponent: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { userId, propertyId } = router.query;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [directConversationLoading, setDirectConversationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDirectConversation = async (targetUserId: number, targetPropertyId: number) => {
    if (user?.id === targetUserId) {
      setError('Невозможно начать чат с самим собой');
      return;
    }

    try {
      setDirectConversationLoading(true);

      let messages: Message[] = [];
      try {
        messages = await getMessages(targetUserId, targetPropertyId);
      } catch {
        // Существующий диалог найти не удалось — ничего страшного, создадим новый.
      }

      if (messages.length === 0) {
        await sendMessage(
          targetUserId,
          `Здравствуйте! Меня интересует ваше объявление с ID ${targetPropertyId}`,
          targetPropertyId
        );
        messages = await getMessages(targetUserId, targetPropertyId);
      }

      if (messages.length === 0) return;

      const firstMessage = messages[0];
      const otherUser =
        firstMessage.sender_id === user?.id ? firstMessage.recipient : firstMessage.sender;

      const newConversation: Conversation = {
        user: otherUser as UserForConversation,
        property: firstMessage.property,
        lastMessage: firstMessage,
        unreadCount: 0,
      };

      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
    } catch (err) {
      console.error('Failed to create direct conversation:', err);
      setError('Не удалось создать чат. Пожалуйста, попробуйте позже.');
    } finally {
      setDirectConversationLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getConversations();
        const filtered = data.filter((conv) => conv.user.id !== user.id);
        if (cancelled) return;
        setConversations(filtered);

        if (userId) {
          const targetUserId = Number(userId);
          const existing = filtered.find(
            (conv) =>
              conv.user.id === targetUserId &&
              (!propertyId || conv.property?.id === Number(propertyId))
          );

          if (existing) {
            setSelectedConversation(existing);
          } else if (propertyId) {
            await handleDirectConversation(targetUserId, Number(propertyId));
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load conversations:', err);
          setError(err?.message || 'Не удалось загрузить чаты. Попробуйте позже.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId, propertyId]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const query: { userId: string; propertyId?: string } = {
      userId: conversation.user.id.toString(),
    };
    if (conversation.property) {
      query.propertyId = conversation.property.id.toString();
    }
    router.push({ pathname: '/profile/messages', query }, undefined, { shallow: true });
  };

  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setConversations((prev) =>
      prev.map((conv) => (sameConversation(conv, updatedConversation) ? updatedConversation : conv))
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
