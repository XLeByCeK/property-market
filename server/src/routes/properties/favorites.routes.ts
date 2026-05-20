import express from 'express';
import { authenticateToken } from '../../middleware/auth';
import { requireUser } from '../../middleware/require-user';
import {
  isFavorited,
  listFavoriteProperties,
  propertyExists,
  toggleFavorite,
} from '../../services/property.service';
import { asyncHandler } from '../../utils/async-handler';
import { notFound } from '../../utils/http-errors';
import { parseIdParam } from '../../utils/parse-id';

const router = express.Router();

const getFavoritesHandler = asyncHandler(async (req, res) => {
  const user = requireUser(req);
  res.json(await listFavoriteProperties(user.id));
});

router.get('/favorites', authenticateToken, getFavoritesHandler);
// Сохранена для обратной совместимости с клиентом, который использует /user-favorites.
router.get('/user-favorites', authenticateToken, getFavoritesHandler);

router.get(
  '/favorites/check/:propertyId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const propertyId = parseIdParam(req.params.propertyId, 'property ID');
    res.json({ favorited: await isFavorited(user.id, propertyId) });
  })
);

router.post(
  '/favorites/:propertyId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const propertyId = parseIdParam(req.params.propertyId, 'property ID');

    if (!(await propertyExists(propertyId))) {
      throw notFound('Property not found');
    }

    const result = await toggleFavorite(user.id, propertyId);
    res.json({
      ...result,
      message: result.favorited
        ? 'Property added to favorites'
        : 'Property removed from favorites',
    });
  })
);

export default router;
