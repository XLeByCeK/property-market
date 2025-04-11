import express from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';
import { Prisma } from '@prisma/client';

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

    // Get all unique property IDs from messages where user is either sender or recipient
    const properties = await prisma.user_message.findMany({
      where: {
        OR: [
          { sender_id: req.user.id },
          { recipient_id: req.user.id }
        ]
      },
      select: {
        property_id: true,
        property: true
      },
      distinct: ['property_id']
    });

    // For each property, get the latest message
    const conversations = await Promise.all(
      properties.map(async (p) => {
        const latestMessage = await prisma.user_message.findFirst({
          where: {
            property_id: p.property_id,
            OR: [
              { sender_id: req.user!.id },
              { recipient_id: req.user!.id }
            ]
          },
          orderBy: {
            created_at: 'desc'
          },
          include: {
            sender: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        });

        return {
          property: p.property,
          latest_message: latestMessage
        };
      })
    );

    res.json(conversations);
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
        property: true
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
        property: true
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router; 