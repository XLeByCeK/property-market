"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../repositories/auth");
const router = express_1.default.Router();
// Initialize auth repository and controller
const authRepository = new auth_2.AuthRepository(prisma_1.default);
const authController = new auth_1.AuthController(authRepository);
// Register
router.post('/register', (req, res) => {
    console.log('Register endpoint called with body:', req.body);
    return authController.register(req, res);
});
// Login
router.post('/login', (req, res) => {
    console.log('Login endpoint called with email:', req.body.email);
    return authController.login(req, res);
});
// Logout
router.post('/logout', (req, res) => {
    console.log('Logout endpoint called');
    return authController.logout(req, res);
});
// Validate session / Get current user
router.get('/me', (req, res) => {
    console.log('Me endpoint called');
    return authController.validateSession(req, res);
});
exports.default = router;
