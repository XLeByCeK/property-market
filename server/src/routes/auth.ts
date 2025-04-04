import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { AuthRepository } from '../repositories/auth';
import pool from '../config/database';

const authRepository = new AuthRepository(pool);
const authController = new AuthController(authRepository);

export function authRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/logout', (req, res) => authController.logout(req, res));
  router.get('/validate', (req, res) => authController.validateSession(req, res));

  return router;
}

export default authRoutes(authController); 