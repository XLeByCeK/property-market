import express from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';
import { Prisma } from '@prisma/client';

const router = express.Router();

type CreateMessageRequest = {
  content: string;
};

// Get all conversations for a user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await prisma.conversations.findMany({
      where: {
        user_id: req.user.id,
      },
      include: {
        property: true,
        messages: {
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
      },
    });
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    // Check if user has access to the conversation
    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = await prisma.messages.findMany({
      where: {
        conversation_id: conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    // Check if property exists
    const property = await prisma.properties.findUnique({
      where: { id: property_id },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversations.findFirst({
      where: {
        property_id,
        user_id: req.user.id,
      },
    });

    if (existingConversation) {
      return res.status(400).json({ error: 'Conversation already exists' });
    }

    const conversation = await prisma.conversations.create({
      data: {
        property_id,
        user_id: req.user.id,
      },
      include: {
        property: true,
      },
    });
    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticateToken, async (req: express.Request<{ conversationId: string }, {}, CreateMessageRequest>, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if conversation exists and user has access
    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const message = await prisma.messages.create({
      data: {
        content,
        conversation_id: conversationId,
        sender_id: req.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router; 