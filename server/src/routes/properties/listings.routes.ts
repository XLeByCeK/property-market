import express from 'express';
import { authenticateToken } from '../../middleware/auth';
import { requireUser } from '../../middleware/require-user';
import {
  buildSearchWhere,
  findProperties,
  findPropertiesByTransaction,
  getUserProperties,
  SearchFilters,
} from '../../services/property.service';
import { asyncHandler } from '../../utils/async-handler';
import { toOptionalInt } from '../../utils/parse-id';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = toOptionalInt(req.query.limit);
    res.json(await findProperties({ take: limit }));
  })
);

router.get(
  '/new-buildings',
  asyncHandler(async (req, res) => {
    const limit = toOptionalInt(req.query.limit);
    res.json(
      await findProperties({
        where: { is_new_building: true, is_commercial: false },
        take: limit,
      })
    );
  })
);

router.get(
  '/for-sale',
  asyncHandler(async (req, res) => {
    const limit = toOptionalInt(req.query.limit);
    res.json(await findPropertiesByTransaction('buy', limit));
  })
);

router.get(
  '/for-rent',
  asyncHandler(async (req, res) => {
    const limit = toOptionalInt(req.query.limit);
    res.json(
      await findPropertiesByTransaction('rent', limit, ['аренд', 'снять', 'сдать', 'rent'])
    );
  })
);

router.get(
  '/user',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    res.json(await getUserProperties(user.id));
  })
);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const where = buildSearchWhere(req.query as SearchFilters);
    res.json(await findProperties({ where, orderBy: { created_at: 'desc' }, take: 100 }));
  })
);

export default router;
