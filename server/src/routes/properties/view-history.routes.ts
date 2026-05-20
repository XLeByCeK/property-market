import express from 'express';
import { authenticateToken } from '../../middleware/auth';
import { requireUser } from '../../middleware/require-user';
import {
  getViewHistory,
  propertyExists,
  recordPropertyView,
} from '../../services/property.service';
import { asyncHandler } from '../../utils/async-handler';
import { notFound } from '../../utils/http-errors';
import { parseIdParam } from '../../utils/parse-id';

const router = express.Router();

router.get(
  '/view-history',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    res.json(await getViewHistory(user.id));
  })
);

router.post(
  '/view/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const propertyId = parseIdParam(req.params.id, 'property ID');

    if (!(await propertyExists(propertyId))) {
      throw notFound('Property not found');
    }

    const { updated, record } = await recordPropertyView(user.id, propertyId);
    res.status(updated ? 200 : 201).json({
      success: true,
      message: updated ? 'View record updated' : 'View recorded successfully',
      updated,
      record,
    });
  })
);

export default router;
