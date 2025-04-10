import axios from 'axios';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Interface for message data
export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  property_id?: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

// Interface for conversation data
export interface Conversation {
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  property?: {
    id: number;
    title: string;
    price: number;
  };
  lastMessage: Message;
  unreadCount: number;
}

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await axios.get(`${API_URL}/messages/conversations`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get all messages for a specific conversation
export const getMessages = async (userId: number, propertyId?: number): Promise<Message[]> => {
  try {
    let url = `${API_URL}/messages/with/${userId}`;
    if (propertyId) {
      url += `?propertyId=${propertyId}`;
    }
    
    const response = await axios.get(url, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (
  recipientId: number, 
  message: string, 
  propertyId?: number
): Promise<Message> => {
  try {
    const response = await axios.post(
      `${API_URL}/messages/send`,
      { recipientId, message, propertyId },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages as read
export const markAsRead = async (messageIds: number[]): Promise<void> => {
  try {
    await axios.post(
      `${API_URL}/messages/read`,
      { messageIds },
      { headers: getAuthHeader() }
    );
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}; 