"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../config/prisma"));
const auth_1 = require("../middleware/auth");
const require_user_1 = require("../middleware/require-user");
const async_handler_1 = require("../utils/async-handler");
const http_errors_1 = require("../utils/http-errors");
const parse_id_1 = require("../utils/parse-id");
const router = express_1.default.Router();
const userMini = {
    select: { id: true, first_name: true, last_name: true },
};
const propertyMini = {
    select: { id: true, title: true, price: true },
};
const messageInclude = {
    sender: userMini,
    recipient: userMini,
    property: propertyMini,
};
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
};
router.get('/conversations', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const messages = await prisma_1.default.user_message.findMany({
        where: {
            OR: [{ sender_id: user.id }, { recipient_id: user.id }],
            NOT: { AND: [{ sender_id: user.id }, { recipient_id: user.id }] },
        },
        include: conversationsInclude,
        orderBy: { created_at: 'desc' },
    });
    // Группируем по property_id и оставляем только последнее сообщение в каждой переписке.
    const latestByProperty = new Map();
    for (const message of messages) {
        const key = `${message.property_id ?? 'direct'}`;
        const existing = latestByProperty.get(key);
        if (!existing || message.created_at > existing.created_at) {
            latestByProperty.set(key, message);
        }
    }
    res.json(Array.from(latestByProperty.values()));
}));
router.get('/properties/:propertyId/messages', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const propertyId = (0, parse_id_1.parseIdParam)(req.params.propertyId, 'property ID');
    const otherUserId = (0, parse_id_1.toOptionalInt)(req.query.userId);
    const propertyExists = await prisma_1.default.property.count({ where: { id: propertyId } });
    if (!propertyExists)
        throw (0, http_errors_1.notFound)('Property not found');
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
    const messages = await prisma_1.default.user_message.findMany({
        where,
        include: messageInclude,
        orderBy: { created_at: 'asc' },
    });
    res.json(messages);
}));
router.post('/messages', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const { content, property_id, recipient_id } = req.body;
    if (!content || !recipient_id) {
        throw (0, http_errors_1.badRequest)('Message content and recipient ID are required');
    }
    if (recipient_id === user.id) {
        throw (0, http_errors_1.badRequest)('Cannot send a message to yourself');
    }
    const recipient = await prisma_1.default.users.findUnique({ where: { id: recipient_id } });
    if (!recipient)
        throw (0, http_errors_1.notFound)('Recipient not found');
    if (property_id) {
        const property = await prisma_1.default.property.findUnique({ where: { id: property_id } });
        if (!property)
            throw (0, http_errors_1.notFound)('Property not found');
    }
    const message = await prisma_1.default.user_message.create({
        data: { message: content, sender_id: user.id, recipient_id, property_id },
        include: messageInclude,
    });
    res.json(message);
}));
router.post('/messages/read', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const { messageIds } = req.body;
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        throw (0, http_errors_1.badRequest)('Message IDs are required');
    }
    await prisma_1.default.user_message.updateMany({
        where: { id: { in: messageIds }, recipient_id: user.id },
        data: { is_read: true },
    });
    res.json({ success: true });
}));
exports.default = router;
