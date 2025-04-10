import express from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';
import { Prisma } from '@prisma/client';

const router = express.Router();

type CreatePropertyRequest = {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  type: 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL';
  images: string[];
};

type UpdatePropertyRequest = Partial<CreatePropertyRequest> & {
  status?: 'ACTIVE' | 'SOLD' | 'INACTIVE';
};

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await prisma.properties.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
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

    const property = await prisma.properties.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
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
    const { title, description, price, address, city, type, images } = req.body;

    // Validate input
    if (!title || !description || !price || !address || !city || !type || !images) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL'].includes(type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const property = await prisma.properties.create({
      data: {
        title,
        description,
        price,
        address,
        city,
        type,
        images,
        owner_id: req.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
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
    const existingProperty = await prisma.properties.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const property = await prisma.properties.update({
      where: { id: propertyId },
      data: req.body,
      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
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
    const existingProperty = await prisma.properties.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (existingProperty.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.properties.delete({
      where: { id: propertyId },
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router; 