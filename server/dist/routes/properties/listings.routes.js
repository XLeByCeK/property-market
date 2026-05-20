"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const require_user_1 = require("../../middleware/require-user");
const property_service_1 = require("../../services/property.service");
const async_handler_1 = require("../../utils/async-handler");
const parse_id_1 = require("../../utils/parse-id");
const router = express_1.default.Router();
router.get('/', (0, async_handler_1.asyncHandler)(async (req, res) => {
    const limit = (0, parse_id_1.toOptionalInt)(req.query.limit);
    res.json(await (0, property_service_1.findProperties)({ take: limit }));
}));
router.get('/new-buildings', (0, async_handler_1.asyncHandler)(async (req, res) => {
    const limit = (0, parse_id_1.toOptionalInt)(req.query.limit);
    res.json(await (0, property_service_1.findProperties)({
        where: { is_new_building: true, is_commercial: false },
        take: limit,
    }));
}));
router.get('/for-sale', (0, async_handler_1.asyncHandler)(async (req, res) => {
    const limit = (0, parse_id_1.toOptionalInt)(req.query.limit);
    res.json(await (0, property_service_1.findPropertiesByTransaction)('buy', limit));
}));
router.get('/for-rent', (0, async_handler_1.asyncHandler)(async (req, res) => {
    const limit = (0, parse_id_1.toOptionalInt)(req.query.limit);
    res.json(await (0, property_service_1.findPropertiesByTransaction)('rent', limit, ['аренд', 'снять', 'сдать', 'rent']));
}));
router.get('/user', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    res.json(await (0, property_service_1.getUserProperties)(user.id));
}));
router.get('/search', (0, async_handler_1.asyncHandler)(async (req, res) => {
    const where = (0, property_service_1.buildSearchWhere)(req.query);
    res.json(await (0, property_service_1.findProperties)({ where, orderBy: { created_at: 'desc' }, take: 100 }));
}));
exports.default = router;
