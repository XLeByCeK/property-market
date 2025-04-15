import api from './api';

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
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
  };
  recipient?: {
    id: number;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
  };
  property?: {
    id: number;
    title: string;
    price: number;
  };
}

// Interface for conversation data
export interface Conversation {
  user: {
    id: number;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
  };
  property?: {
    id: number;
    title: string;
    price: number;
  };
  lastMessage: Message;
  unreadCount: number;
}

// Helper function to normalize user data with both naming conventions
const normalizeUser = (user: any) => {
  if (!user) return { id: 0, first_name: 'Unknown', last_name: 'User' };
  
  // Copy the user object
  const normalizedUser = { ...user };
  
  // Make sure both versions of names are available
  if (user.firstName && !user.first_name) {
    normalizedUser.first_name = user.firstName;
  }
  if (user.lastName && !user.last_name) {
    normalizedUser.last_name = user.lastName;
  }
  if (user.first_name && !user.firstName) {
    normalizedUser.firstName = user.first_name;
  }
  if (user.last_name && !user.lastName) {
    normalizedUser.lastName = user.last_name;
  }
  
  return normalizedUser;
};

// Transform API data into Conversation objects
const transformConversations = (data: any[]): Conversation[] => {
  console.log('Transforming conversations data:', data);
  
  return data.map(conv => {
    // Extract property if available
    const property = conv.property ? {
      id: conv.property.id,
      title: conv.property.title,
      price: conv.property.price
    } : undefined;
    
    // Get the current user ID from localStorage
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
    
    // Determine the other user in the conversation (not the current user)
    let otherUser;
    if (conv.sender_id === currentUserId) {
      otherUser = normalizeUser(conv.recipient);
    } else {
      otherUser = normalizeUser(conv.sender);
    }
    
    // Create a message object from the conversation
    const message: Message = {
      id: conv.id,
      sender_id: conv.sender_id,
      recipient_id: conv.recipient_id,
      property_id: conv.property_id,
      message: conv.message || '',
      is_read: conv.is_read || false,
      created_at: conv.created_at || new Date().toISOString(),
      sender: conv.sender ? normalizeUser(conv.sender) : undefined,
      recipient: conv.recipient ? normalizeUser(conv.recipient) : undefined,
      property: property
    };
    
    return {
      user: otherUser,
      property,
      lastMessage: message,
      unreadCount: 0 // This would need to be calculated from the API response
    };
  });
};

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const data = await api.chat.getConversations() as any[];
    console.log('Fetched conversations data:', data);
    return transformConversations(data);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get all messages for a specific property
export const getMessages = async (userId: number, propertyId?: number): Promise<Message[]> => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    
    console.log('Fetching messages for property ID', propertyId, 'with user ID', userId);
    
    const data = await api.chat.getPropertyMessages(propertyId, userId) as Message[];
    console.log('Fetched messages data for property ID', propertyId, ':', data);
    
    // Debug user data before normalization
    data.forEach((message, index) => {
      console.log(`Message ${index}:`, {
        id: message.id,
        sender: message.sender,
        recipient: message.recipient,
        message: message.message.substring(0, 20) + (message.message.length > 20 ? '...' : '')
      });
    });
    
    // Normalize user data in messages
    const normalizedMessages = data.map(message => {
      const normalizedMessage = {
        ...message,
        sender: message.sender ? normalizeUser(message.sender) : undefined,
        recipient: message.recipient ? normalizeUser(message.recipient) : undefined
      };
      
      // Debug after normalization
      console.log(`Normalized message ${message.id}:`, {
        sender: normalizedMessage.sender,
        recipient: normalizedMessage.recipient
      });
      
      return normalizedMessage;
    });
    
    return normalizedMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    // В случае ошибки возвращаем пустой массив
    return [];
  }
};

// Send a new message
export const sendMessage = async (
  recipientId: number, 
  content: string, 
  propertyId?: number
): Promise<Message> => {
  try {
    console.log('Sending message:', { content, recipientId, propertyId });
    const data = await api.chat.sendMessage({
      content,
      recipient_id: recipientId,
      property_id: propertyId
    }) as Message;
    
    console.log('Message sent successfully:', data);
    
    // Normalize user data in response
    return {
      ...data,
      sender: data.sender ? normalizeUser(data.sender) : undefined,
      recipient: data.recipient ? normalizeUser(data.recipient) : undefined
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages as read (placeholder, actual implementation depends on API)
export const markAsRead = async (messageIds: number[]): Promise<void> => {
  try {
    // This endpoint would need to be implemented on the server
    console.log('Marking messages as read:', messageIds);
    // For now, just return without making an API call
    return;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}; 