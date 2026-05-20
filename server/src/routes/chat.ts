import express from 'express';
import prisma from '../config/prisma';
import { authenticateToken } from '../middleware/auth';
import { requireUser } from '../middleware/require-user';
import { asyncHandler } from '../utils/async-handler';
import { badRequest, notFound } from '../utils/http-errors';
import { parseIdParam, toOptionalInt } from '../utils/parse-id';

const router = express.Router();

interface CreateMessageRequest {
  content: string;
  property_id?: number;
  recipient_id: number;
}

const userMini = {
  select: { id: true, first_name: true, last_name: true },
} as const;

const propertyMini = {
  select: { id: true, title: true, price: true },
} as const;

const messageInclude = {
  sender: userMini,
  recipient: userMini,
  property: propertyMini,
} as const;

const conversationsInclude = {
  sender: userMini,
  recipient: userMini,
  property: {
    select: {
      id: true,
      title: true,
      price: true,
      images: { where: { is_main: true }, take: 1 },
    },
  },
} as const;

router.get(
  '/conversations',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);

    const messages = await prisma.user_message.findMany({
      where: {
        OR: [{ sender_id: user.id }, { recipient_id: user.id }],
        NOT: { AND: [{ sender_id: user.id }, { recipient_id: user.id }] },
      },
      include: conversationsInclude,
      orderBy: { created_at: 'desc' },
    });

    // Группируем по property_id и оставляем только последнее сообщение в каждой переписке.
    const latestByProperty = new Map<string, (typeof messages)[number]>();
    for (const message of messages) {
      const key = `${message.property_id ?? 'direct'}`;
      const existing = latestByProperty.get(key);
      if (!existing || message.created_at > existing.created_at) {
        latestByProperty.set(key, message);
      }
    }

    res.json(Array.from(latestByProperty.values()));
  })
);

router.get(
  '/properties/:propertyId/messages',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const propertyId = parseIdParam(req.params.propertyId, 'property ID');
    const otherUserId = toOptionalInt(req.query.userId);

    const propertyExists = await prisma.property.count({ where: { id: propertyId } });
    if (!propertyExists) throw notFound('Property not found');

    const where = otherUserId
      ? {
          property_id: propertyId,
          OR: [
            { sender_id: user.id, recipient_id: otherUserId },
            { sender_id: otherUserId, recipient_id: user.id },
          ],
        }
      : {
          property_id: propertyId,
          NOT: { AND: [{ sender_id: user.id }, { recipient_id: user.id }] },
          OR: [{ sender_id: user.id }, { recipient_id: user.id }],
        };

    const messages = await prisma.user_message.findMany({
      where,
      include: messageInclude,
      orderBy: { created_at: 'asc' },
    });

    res.json(messages);
  })
);

router.post(
  '/messages',
  authenticateToken,
  asyncHandler(async (req: express.Request<{}, {}, CreateMessageRequest>, res) => {
    const user = requireUser(req);
    const { content, property_id, recipient_id } = req.body;

    if (!content || !recipient_id) {
      throw badRequest('Message content and recipient ID are required');
    }
    if (recipient_id === user.id) {
      throw badRequest('Cannot send a message to yourself');
    }

    const recipient = await prisma.users.findUnique({ where: { id: recipient_id } });
    if (!recipient) throw notFound('Recipient not found');

    if (property_id) {
      const property = await prisma.property.findUnique({ where: { id: property_id } });
      if (!property) throw notFound('Property not found');
    }

    const message = await prisma.user_message.create({
      data: { message: content, sender_id: user.id, recipient_id, property_id },
      include: messageInclude,
    });

    res.json(message);
  })
);

router.post(
  '/messages/read',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const { messageIds } = req.body as { messageIds?: number[] };

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      throw badRequest('Message IDs are required');
    }

    await prisma.user_message.updateMany({
      where: { id: { in: messageIds }, recipient_id: user.id },
      data: { is_read: true },
    });

    res.json({ success: true });
  })
);

export default router;
