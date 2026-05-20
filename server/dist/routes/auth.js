"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../config/prisma"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../repositories/auth");
const router = express_1.default.Router();
const authRepository = new auth_2.AuthRepository(prisma_1.default);
const authController = new auth_1.AuthController(authRepository);
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', (req, res) => authController.validateSession(req, res));
exports.default = router;
