import express from 'express';
import { authenticateToken } from '../../middleware/auth';
import { requireUser } from '../../middleware/require-user';
import {
  checkPropertyOwnership,
  createProperty,
  CreatePropertyInput,
  deleteProperty,
  getPropertyById,
  updateProperty,
  UpdatePropertyInput,
} from '../../services/property.service';
import { asyncHandler } from '../../utils/async-handler';
import { badRequest, forbidden, notFound } from '../../utils/http-errors';
import { parseIdParam } from '../../utils/parse-id';

const router = express.Router();

const REQUIRED_FIELDS: Array<keyof CreatePropertyInput> = [
  'title',
  'description',
  'price',
  'area',
  'rooms',
  'address',
  'property_type_id',
  'transaction_type_id',
  'city_id',
];

const validateCreateInput = (body: Partial<CreatePropertyInput>): string[] => {
  const missing = REQUIRED_FIELDS.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });
  if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
    missing.push('images');
  }
  return missing;
};

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseIdParam(req.params.id, 'property ID');
    const property = await getPropertyById(id);
    if (!property) throw notFound('Property not found');
    res.json(property);
  })
);

router.post(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const body = req.body as Partial<CreatePropertyInput>;

    const missing = validateCreateInput(body);
    if (missing.length > 0) {
      throw badRequest(`Missing required fields: ${missing.join(', ')}`);
    }

    const property = await createProperty(user.id, body as CreatePropertyInput);
    res.status(201).json(property);
  })
);

router.put(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const id = parseIdParam(req.params.id, 'property ID');
    const { property, owned } = await checkPropertyOwnership(id, user);

    if (!property) throw notFound('Property not found');
    if (!owned) throw forbidden();

    res.json(await updateProperty(id, req.body as UpdatePropertyInput));
  })
);

router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const id = parseIdParam(req.params.id, 'property ID');
    const { property, owned } = await checkPropertyOwnership(id, user);

    if (!property) throw notFound('Property not found');
    if (!owned) throw forbidden();

    await deleteProperty(id);
    res.json({ message: 'Property deleted successfully' });
  })
);

export default router;
