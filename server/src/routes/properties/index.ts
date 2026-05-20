import express from 'express';
import favoritesRoutes from './favorites.routes';
import listingsRoutes from './listings.routes';
import mutationsRoutes from './mutations.routes';
import referencesRoutes from './references.routes';
import uploadsRoutes from './uploads.routes';
import viewHistoryRoutes from './view-history.routes';

const router = express.Router();

/**
 * Порядок монтирования важен: маршруты со специальными префиксами (favorites,
 * view-history, references, search и т.п.) должны быть зарегистрированы ДО
 * мутаций, потому что `mutations.routes.ts` содержит wildcard `GET /:id`.
 */
router.use(referencesRoutes);
router.use(favoritesRoutes);
router.use(viewHistoryRoutes);
router.use(uploadsRoutes);
router.use(listingsRoutes);
router.use(mutationsRoutes);

export default router;
