import express from 'express';
import {
  cities,
  districtsByCity,
  metroByCity,
  propertyTypes,
  transactionTypes,
} from '../../services/property.service';
import { asyncHandler } from '../../utils/async-handler';
import { parseIdParam } from '../../utils/parse-id';

const router = express.Router();

router.get(
  '/property-types',
  asyncHandler(async (_req, res) => {
    res.json(await propertyTypes());
  })
);

router.get(
  '/transaction-types',
  asyncHandler(async (_req, res) => {
    res.json(await transactionTypes());
  })
);

router.get(
  '/cities',
  asyncHandler(async (_req, res) => {
    res.json(await cities());
  })
);

router.get(
  '/cities/:cityId/districts',
  asyncHandler(async (req, res) => {
    const cityId = parseIdParam(req.params.cityId, 'city ID');
    res.json(await districtsByCity(cityId));
  })
);

router.get(
  '/cities/:cityId/metro',
  asyncHandler(async (req, res) => {
    const cityId = parseIdParam(req.params.cityId, 'city ID');
    res.json(await metroByCity(cityId));
  })
);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
