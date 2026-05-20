"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favorites_routes_1 = __importDefault(require("./favorites.routes"));
const listings_routes_1 = __importDefault(require("./listings.routes"));
const mutations_routes_1 = __importDefault(require("./mutations.routes"));
const references_routes_1 = __importDefault(require("./references.routes"));
const uploads_routes_1 = __importDefault(require("./uploads.routes"));
const view_history_routes_1 = __importDefault(require("./view-history.routes"));
const router = express_1.default.Router();
/**
 * Порядок монтирования важен: маршруты со специальными префиксами (favorites,
 * view-history, references, search и т.п.) должны быть зарегистрированы ДО
 * мутаций, потому что `mutations.routes.ts` содержит wildcard `GET /:id`.
 */
router.use(references_routes_1.default);
router.use(favorites_routes_1.default);
router.use(view_history_routes_1.default);
router.use(uploads_routes_1.default);
router.use(listings_routes_1.default);
router.use(mutations_routes_1.default);
exports.default = router;
