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

export default router; 