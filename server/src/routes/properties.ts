import express from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';
import { Prisma } from '@prisma/client';

const router = express.Router();

type CreatePropertyRequest = {
  title: string;
  description: string;
  price: number;
  area: number;
  rooms: number;
  floor?: number;
  total_floors?: number;
  address: string;
  year_built?: number;
  property_type_id: number;
  transaction_type_id: number;
  city_id: number;
  district_id?: number;
  metro_id?: number;
  metro_distance?: number;
  is_new_building?: boolean;
  is_commercial?: boolean;
  is_country?: boolean;
  images: string[];
};

type UpdatePropertyRequest = Partial<CreatePropertyRequest> & {
  status?: 'active' | 'sold' | 'inactive';
};

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'active',
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        property_type: true,
        transaction_type: true,
        city: true,
        district: true,
        metro_station: true,
        images: true,
      },
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        property_type: true,
        transaction_type: true,
        city: true,
        district: true,
        metro_station: true,
        images: true,
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Create new property
router.post('/', authenticateToken, async (req: express.Request<{}, {}, CreatePropertyRequest>, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      area, 
      rooms, 
      floor, 
      total_floors, 
      address, 
      year_built,
      property_type_id,
      transaction_type_id,
      city_id,
      district_id,
      metro_id,
      metro_distance,
      is_new_building,
      is_commercial,
      is_country,
      images 
    } = req.body;

    // Validate input
    if (!title || !description || !price || !area || !rooms || !address || !property_type_id || !transaction_type_id || !city_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        price,
        area,
        rooms,
        floor,
        total_floors,
        address,
        year_built,
        property_type_id,
        transaction_type_id,
        city_id,
        district_id,
        metro_id,
        metro_distance,
        is_new_building: is_new_building || false,
        is_commercial: is_commercial || false,
        is_country: is_country || false,
        user_id: req.user.id,
        images: {
          create: images.map((url, index) => ({
            image_url: url,
            is_main: index === 0,
            order: index,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        property_type: true,
        transaction_type: true,
        city: true,
        district: true,
        metro_station: true,
        images: true,
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// Update property
router.put('/:id', authenticateToken, async (req: express.Request<{ id: string }, {}, UpdatePropertyRequest>, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if property exists and belongs to the user
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { images, ...updateData } = req.body;

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: {
        ...updateData,
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url, index) => ({
              image_url: url,
              is_main: index === 0,
              order: index,
            })),
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
        property_type: true,
        transaction_type: true,
        city: true,
        district: true,
        metro_station: true,
        images: true,
      },
    });

    res.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Delete property
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if property exists and belongs to the user
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router; 