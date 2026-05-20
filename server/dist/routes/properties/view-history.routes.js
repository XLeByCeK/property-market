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
router.get('/view-history', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    res.json(await (0, property_service_1.getViewHistory)(user.id));
}));
router.post('/view/:id', auth_1.authenticateToken, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = (0, require_user_1.requireUser)(req);
    const propertyId = (0, parse_id_1.parseIdParam)(req.params.id, 'property ID');
    if (!(await (0, property_service_1.propertyExists)(propertyId))) {
        throw (0, http_errors_1.notFound)('Property not found');
    }
    const { updated, record } = await (0, property_service_1.recordPropertyView)(user.id, propertyId);
    res.status(updated ? 200 : 201).json({
        success: true,
        message: updated ? 'View record updated' : 'View recorded successfully',
        updated,
        record,
    });
}));
exports.default = router;
