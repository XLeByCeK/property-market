import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { AuthController } from '../controllers/auth';
import { AuthRepository } from '../repositories/auth';

const router = express.Router();

// Initialize auth repository and controller
const authRepository = new AuthRepository(prisma);
const authController = new AuthController(authRepository);

// Register
router.post('/register', (req, res) => authController.register(req, res));

// Login
router.post('/login', (req, res) => authController.login(req, res));

// Logout
router.post('/logout', (req, res) => authController.logout(req, res));

// Validate session / Get current user
router.get('/me', (req, res) => authController.validateSession(req, res));

export default router; 