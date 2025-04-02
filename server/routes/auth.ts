import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { AuthRepository } from '../repositories/auth';
import pool from '../config/database';

const router = Router();
const authRepository = new AuthRepository(pool);
const authController = new AuthController(authRepository);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/validate', (req, res) => authController.validateSession(req, res));

export default router; 