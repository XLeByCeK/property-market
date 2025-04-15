import express from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/properties');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `property-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload property images
router.post('/upload-images', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const files = req.files as Express.Multer.File[];
    const imageUrls = files.map(file => {
      // Convert Windows path separators to URL format
      const relativePath = path.relative(path.join(__dirname, '../../public'), file.path).replace(/\\/g, '/');
      return `/${relativePath}`;
    });
    
    res.status(200).json({ imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
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
      take: limit,
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get new buildings (is_new_building = true, status = active, is_commercial = false)
router.get('/new-buildings', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const properties = await prisma.property.findMany({
      where: {
        status: 'active',
        is_new_building: true,
        is_commercial: false,
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
      take: limit,
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching new buildings:', error);
    res.status(500).json({ error: 'Failed to fetch new buildings' });
  }
});

// Get properties for sale (status = active, transaction_type.name = 'Продажа')
router.get('/for-sale', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const properties = await prisma.property.findMany({
      where: {
        status: 'active',
        transaction_type: {
          name: {
            contains: 'Продажа',
            mode: 'insensitive',
          },
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
      take: limit,
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties for sale:', error);
    res.status(500).json({ error: 'Failed to fetch properties for sale' });
  }
});

// Get properties for rent (status = active, transaction_type.name содержит 'Аренда')
router.get('/for-rent', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const properties = await prisma.property.findMany({
      where: {
        status: 'active',
        transaction_type: {
          name: {
            contains: 'Аренда',
            mode: 'insensitive',
          },
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
      take: limit,
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Если результаты пустые, попробуем искать по ключевым словам в описании
    if (properties.length === 0) {
      const propertiesByDescription = await prisma.property.findMany({
        where: {
          status: 'active',
          OR: [
            {
              description: {
                contains: 'аренд',
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: 'снять',
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: 'сдать',
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: 'rent',
                mode: 'insensitive'
              }
            }
          ]
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
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      });
      
      return res.json(propertiesByDescription);
    }
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties for rent:', error);
    res.status(500).json({ error: 'Failed to fetch properties for rent' });
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

// Get properties for the current user
router.get('/user', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const properties = await prisma.property.findMany({
      where: {
        user_id: req.user.id,
      },
      include: {
        property_type: true,
        transaction_type: true,
        city: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Route for reference data endpoints
router.get('/property-types', async (req, res) => {
  try {
    const propertyTypes = await prisma.property_type.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(propertyTypes);
  } catch (error) {
    console.error('Error fetching property types:', error);
    res.status(500).json({ error: 'Failed to fetch property types' });
  }
});

router.get('/transaction-types', async (req, res) => {
  try {
    const transactionTypes = await prisma.transaction_type.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(transactionTypes);
  } catch (error) {
    console.error('Error fetching transaction types:', error);
    res.status(500).json({ error: 'Failed to fetch transaction types' });
  }
});

router.get('/cities', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

router.get('/cities/:cityId/districts', async (req, res) => {
  try {
    const cityId = parseInt(req.params.cityId);
    if (isNaN(cityId)) {
      return res.status(400).json({ error: 'Invalid city ID' });
    }
    
    const districts = await prisma.district.findMany({
      where: {
        city_id: cityId,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

router.get('/cities/:cityId/metro', async (req, res) => {
  try {
    const cityId = parseInt(req.params.cityId);
    if (isNaN(cityId)) {
      return res.status(400).json({ error: 'Invalid city ID' });
    }
    
    const metroStations = await prisma.metro_station.findMany({
      where: {
        city_id: cityId,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(metroStations);
  } catch (error) {
    console.error('Error fetching metro stations:', error);
    res.status(500).json({ error: 'Failed to fetch metro stations' });
  }
});

export default router; 