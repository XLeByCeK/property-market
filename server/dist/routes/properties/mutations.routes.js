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
const REQUIRED_FIELDS = [
    'title',
    'description',
    'price',
    'area',
    'rooms',
    'address',
    'property_type_id',
    'transaction_type_id',
    'city_id',
];
const validateCreateInput = (body) => {
    const missing = REQUIRED_FIELDS.filter((field) => {
        const value = body[field];
        return value === undefined || value === null || value === '';
    });
    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
        missing.push('images');
    }
    return missing;
};
router.get('/:id', (0, async_handler_1.asyncHandler)(async (req, res) => {
    const id = (0, parse_id_1.parseIdParam)(req.params.id, 'property ID');
    const property = await (0, property_service_1.getPropertyById)(id);
    if (!property)
        throw (0, http_errors_1.notFound)('Property not found');
    res.json(property);
}));
router.post('/', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const body = req.body;
    const missing = validateCreateInput(body);
    if (missing.length > 0) {
        throw (0, http_errors_1.badRequest)(`Missing required fields: ${missing.join(', ')}`);
    }
    const property = await (0, property_service_1.createProperty)(user.id, body);
    res.status(201).json(property);
}));
router.put('/:id', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const id = (0, parse_id_1.parseIdParam)(req.params.id, 'property ID');
    const { property, owned } = await (0, property_service_1.checkPropertyOwnership)(id, user);
    if (!property)
        throw (0, http_errors_1.notFound)('Property not found');
    if (!owned)
        throw (0, http_errors_1.forbidden)();
    res.json(await (0, property_service_1.updateProperty)(id, req.body));
}));
router.delete('/:id', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const id = (0, parse_id_1.parseIdParam)(req.params.id, 'property ID');
    const { property, owned } = await (0, property_service_1.checkPropertyOwnership)(id, user);
    if (!property)
        throw (0, http_errors_1.notFound)('Property not found');
    if (!owned)
        throw (0, http_errors_1.forbidden)();
    await (0, property_service_1.deleteProperty)(id);
    res.json({ message: 'Property deleted successfully' });
}));
exports.default = router;
