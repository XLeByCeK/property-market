"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const property_service_1 = require("../../services/property.service");
const async_handler_1 = require("../../utils/async-handler");
const parse_id_1 = require("../../utils/parse-id");
const router = express_1.default.Router();
router.get('/property-types', (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json(await (0, property_service_1.propertyTypes)());
}));
router.get('/transaction-types', (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json(await (0, property_service_1.transactionTypes)());
}));
router.get('/cities', (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json(await (0, property_service_1.cities)());
}));
router.get('/cities/:cityId/districts', (0, async_handler_1.asyncHandler)(async (req, res) => {
    const cityId = (0, parse_id_1.parseIdParam)(req.params.cityId, 'city ID');
    res.json(await (0, property_service_1.districtsByCity)(cityId));
}));
router.get('/cities/:cityId/metro', (0, async_handler_1.asyncHandler)(async (req, res) => {
    const cityId = (0, parse_id_1.parseIdParam)(req.params.cityId, 'city ID');
    res.json(await (0, property_service_1.metroByCity)(cityId));
}));
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
exports.default = router;
