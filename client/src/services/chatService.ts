import api from './api';
import { normalizeUser } from '../utils/user';

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  property_id?: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: ChatUser;
  recipient?: ChatUser;
  property?: ChatProperty;
}

export interface ChatUser {
  id: number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
}

export interface ChatProperty {
  id: number;
  title: string;
  price: number;
}

export interface Conversation {
  user: ChatUser;
  property?: ChatProperty;
  lastMessage: Message;
  unreadCount: number;
}

const DEFAULT_USER: ChatUser = { id: 0, first_name: 'Unknown', last_name: 'User' };

const getCurrentUserId = (): number | null => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.id ?? null;
  } catch {
    return null;
  }
};

const transformConversations = (data: any[]): Conversation[] => {
  const currentUserId = getCurrentUserId();

  return data.map((conv) => {
    const property = conv.property
      ? { id: conv.property.id, title: conv.property.title, price: conv.property.price }
      : undefined;

    // «Собеседник» — это тот, кто не является текущим пользователем.
    const otherUser =
      conv.sender_id === currentUserId
        ? normalizeUser(conv.recipient)
        : normalizeUser(conv.sender);

    const lastMessage: Message = {
      id: conv.id,
      sender_id: conv.sender_id,
      recipient_id: conv.recipient_id,
      property_id: conv.property_id,
      message: conv.message || '',
      is_read: conv.is_read || false,
      created_at: conv.created_at || new Date().toISOString(),
      sender: conv.sender ? normalizeUser(conv.sender) : undefined,
      recipient: conv.recipient ? normalizeUser(conv.recipient) : undefined,
      property,
    };

    return {
      user: otherUser || DEFAULT_USER,
      property,
      lastMessage,
      unreadCount: 0,
    };
  });
};

export const getConversations = async (): Promise<Conversation[]> => {
  const data = (await api.chat.getConversations()) as any[];
  return transformConversations(data);
};

export const getMessages = async (
  userId: number,
  propertyId?: number
): Promise<Message[]> => {
  if (!propertyId) throw new Error('Property ID is required');

  try {
    const data = (await api.chat.getPropertyMessages(propertyId, userId)) as Message[];
    return data.map((message) => ({
      ...message,
      sender: message.sender ? normalizeUser(message.sender) : undefined,
      recipient: message.recipient ? normalizeUser(message.recipient) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendMessage = async (
  recipientId: number,
  content: string,
  propertyId?: number
): Promise<Message> => {
  const data = (await api.chat.sendMessage({
    content,
    recipient_id: recipientId,
    property_id: propertyId,
  })) as Message;

  return {
    ...data,
    sender: data.sender ? normalizeUser(data.sender) : undefined,
    recipient: data.recipient ? normalizeUser(data.recipient) : undefined,
  };
};

// Эндпойнт пока без серверной поддержки; функция оставлена в API для совместимости.
export const markAsRead = async (_messageIds: number[]): Promise<void> => {
  return;
};
