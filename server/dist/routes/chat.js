"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all conversations for a user
router.get('/conversations', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log(`Fetching conversations for user: ${req.user.id}`);
        // Get all unique conversations from user messages
        const conversations = yield prisma_1.default.user_message.findMany({
            where: {
                OR: [
                    { sender_id: req.user.id },
                    { recipient_id: req.user.id }
                ],
                // Filter out self-messages
                NOT: {
                    AND: [
                        { sender_id: req.user.id },
                        { recipient_id: req.user.id }
                    ]
                }
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
        }, {});
        const conversationsList = Object.values(groupedByProperty);
        console.log(`Found ${conversationsList.length} conversations`);
        res.json(conversationsList);
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
}));
// Get messages for a property
router.get('/properties/:propertyId/messages', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const propertyId = parseInt(req.params.propertyId);
        if (isNaN(propertyId)) {
            return res.status(400).json({ error: 'Invalid property ID' });
        }
        // Получаем userId из запроса (если указан) или используем идентификатор текущего пользователя
        const otherUserId = req.query.userId ? parseInt(req.query.userId) : null;
        console.log(`Fetching messages for property: ${propertyId}, user: ${req.user.id}, otherUser: ${otherUserId || 'all'}`);
        // Check if property exists
        const property = yield prisma_1.default.property.findUnique({
            where: { id: propertyId },
        });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        // Если указан конкретный пользователь, ищем сообщения только для этого разговора
        let messagesWhere = {
            property_id: propertyId,
            // Filter out self-messages
            NOT: {
                AND: [
                    { sender_id: req.user.id },
                    { recipient_id: req.user.id }
                ]
            }
        };
        if (otherUserId) {
            messagesWhere.OR = [
                // Сообщения от текущего пользователя другому пользователю
                {
                    sender_id: req.user.id,
                    recipient_id: otherUserId
                },
                // Сообщения от другого пользователя текущему пользователю
                {
                    sender_id: otherUserId,
                    recipient_id: req.user.id
                }
            ];
        }
        else {
            // Если пользователь не указан, ищем все сообщения пользователя по этому объекту
            messagesWhere.OR = [
                { sender_id: req.user.id },
                { recipient_id: req.user.id }
            ];
        }
        const messages = yield prisma_1.default.user_message.findMany({
            where: messagesWhere,
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
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
}));
// Send a message
router.post('/messages', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { content, property_id, recipient_id } = req.body;
        if (!content || !recipient_id) {
            return res.status(400).json({ error: 'Message content and recipient ID are required' });
        }
        // Prevent sending messages to oneself
        if (recipient_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot send a message to yourself' });
        }
        console.log(`Sending message from ${req.user.id} to ${recipient_id} about property: ${property_id || 'direct'}`);
        // Check if recipient exists
        const recipient = yield prisma_1.default.users.findUnique({
            where: { id: recipient_id },
        });
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        // If property_id is provided, check if property exists
        if (property_id) {
            const property = yield prisma_1.default.property.findUnique({
                where: { id: property_id },
            });
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
        }
        const message = yield prisma_1.default.user_message.create({
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
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}));
// Mark messages as read endpoint (placeholder)
router.post('/messages/read', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield prisma_1.default.user_message.updateMany({
            where: {
                id: { in: messageIds },
                recipient_id: req.user.id // Only mark as read if user is the recipient
            },
            data: {
                is_read: true
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
}));
exports.default = router;
