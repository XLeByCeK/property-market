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
const http_errors_1 = require("../../utils/http-errors");
const parse_id_1 = require("../../utils/parse-id");
const router = express_1.default.Router();
const getFavoritesHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    res.json(await (0, property_service_1.listFavoriteProperties)(user.id));
});
router.get('/favorites', auth_1.authenticateToken, getFavoritesHandler);
// Сохранена для обратной совместимости с клиентом, который использует /user-favorites.
router.get('/user-favorites', auth_1.authenticateToken, getFavoritesHandler);
router.get('/favorites/check/:propertyId', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const propertyId = (0, parse_id_1.parseIdParam)(req.params.propertyId, 'property ID');
    res.json({ favorited: await (0, property_service_1.isFavorited)(user.id, propertyId) });
}));
router.post('/favorites/:propertyId', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const propertyId = (0, parse_id_1.parseIdParam)(req.params.propertyId, 'property ID');
    if (!(await (0, property_service_1.propertyExists)(propertyId))) {
        throw (0, http_errors_1.notFound)('Property not found');
    }
    const result = await (0, property_service_1.toggleFavorite)(user.id, propertyId);
    res.json({
        ...result,
        message: result.favorited
            ? 'Property added to favorites'
            : 'Property removed from favorites',
    });
}));
exports.default = router;
