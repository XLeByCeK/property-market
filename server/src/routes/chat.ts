import express from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

type CreateMessageRequest = {
  content: string;
  property_id?: number;
  recipient_id: number;
};

// Get all conversations for a user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`Fetching conversations for user: ${req.user.id}`);

    // Get all unique conversations from user messages
    const conversations = await prisma.user_message.findMany({
      where: {
        OR: [
          { sender_id: req.user.id },
          { recipient_id: req.user.id }
        ]
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              where: { is_main: true },
              take: 1
            }
          }
        },
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        },
        recipient: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Group by property_id and get latest message for each
    const groupedByProperty = conversations.reduce((acc, message) => {
      const propertyId = message.property_id || 'direct';
      const key = `${propertyId}`;
      
      if (!acc[key] || new Date(message.created_at) > new Date(acc[key].created_at)) {
        acc[key] = message;
      }
      return acc;
    }, {} as Record<string, any>);

    const conversationsList = Object.values(groupedByProperty);

    console.log(`Found ${conversationsList.length} conversations`);
    res.json(conversationsList);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a property
router.get('/properties/:propertyId/messages', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const propertyId = parseInt(req.params.propertyId);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    console.log(`Fetching messages for property: ${propertyId}, user: ${req.user.id}`);

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const messages = await prisma.user_message.findMany({
      where: {
        property_id: propertyId,
        OR: [
          { sender_id: req.user.id },
          { recipient_id: req.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    console.log(`Found ${messages.length} messages for property: ${propertyId}`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/messages', authenticateToken, async (req: express.Request<{}, {}, CreateMessageRequest>, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { content, property_id, recipient_id } = req.body;

    if (!content || !recipient_id) {
      return res.status(400).json({ error: 'Message content and recipient ID are required' });
    }

    console.log(`Sending message from ${req.user.id} to ${recipient_id} about property: ${property_id || 'direct'}`);

    // Check if recipient exists
    const recipient = await prisma.users.findUnique({
      where: { id: recipient_id },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // If property_id is provided, check if property exists
    if (property_id) {
      const property = await prisma.property.findUnique({
        where: { id: property_id },
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
    }

    const message = await prisma.user_message.create({
      data: {
        message: content,
        sender_id: req.user.id,
        recipient_id,
        property_id,
      },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      },
    });

    console.log(`Message sent successfully, id: ${message.id}`);
    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read endpoint (placeholder)
router.post('/messages/read', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Message IDs are required' });
    }

    console.log(`Marking messages as read: ${messageIds.join(', ')}`);

    // Update messages to mark them as read
    await prisma.user_message.updateMany({
      where: {
        id: { in: messageIds },
        recipient_id: req.user.id // Only mark as read if user is the recipient
      },
      data: {
        is_read: true
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router; 