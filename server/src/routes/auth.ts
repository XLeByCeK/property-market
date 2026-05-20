import express from 'express';
import prisma from '../config/prisma';
import { AuthController } from '../controllers/auth';
import { AuthRepository } from '../repositories/auth';

const router = express.Router();

const authRepository = new AuthRepository(prisma);
const authController = new AuthController(authRepository);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', (req, res) => authController.validateSession(req, res));

export default router;
