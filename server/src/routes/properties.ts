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
    console.log('Received image upload request');
    
    if (!req.user) {
      console.log('Upload error: User not authenticated');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      console.log('Upload error: No files were uploaded');
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    console.log(`Processing ${Array.isArray(req.files) ? req.files.length : 0} uploaded files`);
    
    const files = req.files as Express.Multer.File[];
    const basePath = path.join(__dirname, '../../public');
    
    console.log('Base path for images:', basePath);
    
    const imageUrls = files.map(file => {
      console.log('Original file path:', file.path);
      // Convert Windows path separators to URL format
      const relativePath = path.relative(basePath, file.path).replace(/\\/g, '/');
      const finalUrl = `/${relativePath}`;
      console.log('Converted image URL:', finalUrl);
      return finalUrl;
    });
    
    console.log('Final image URLs to be returned:', imageUrls);
    
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

// Toggle favorite status for a property
router.post('/favorites/:propertyId', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const propertyId = parseInt(req.params.propertyId);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if the property is already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        user_id_property_id: {
          user_id: req.user.id,
          property_id: propertyId,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          user_id_property_id: {
            user_id: req.user.id,
            property_id: propertyId,
          },
        },
      });
      res.json({ message: 'Property removed from favorites', favorited: false });
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          user_id: req.user.id,
          property_id: propertyId,
        },
      });
      res.json({ message: 'Property added to favorites', favorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    res.status(500).json({ error: 'Failed to update favorite status' });
  }
});

// Check if property is favorited by the current user
router.get('/favorites/check/:propertyId', authenticateToken, async (req, res) => {
  try {
    console.log(`GET /properties/favorites/check/${req.params.propertyId} - начало обработки запроса`);
    
    if (!req.user) {
      console.log('GET /properties/favorites/check - ошибка: пользователь не аутентифицирован');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const propertyId = parseInt(req.params.propertyId);
    if (isNaN(propertyId)) {
      console.log(`GET /properties/favorites/check - ошибка: недопустимый ID объекта (${req.params.propertyId})`);
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    console.log(`GET /properties/favorites/check - проверка избранного для пользователя: ${req.user.id}, объект: ${propertyId}`);
    
    // Check if property is in favorites
    const favorite = await prisma.favorite.findUnique({
      where: {
        user_id_property_id: {
          user_id: req.user.id,
          property_id: propertyId,
        },
      },
    });

    const isFavorited = !!favorite;
    console.log(`GET /properties/favorites/check - результат: объект ${isFavorited ? 'В избранном' : 'НЕ в избранном'}`);

    res.json({ favorited: isFavorited });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

// Get favorite properties for the current user
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    console.log('GET /properties/favorites - начало обработки запроса');
    console.log('Пользователь:', req.user ? `ID: ${req.user.id}` : 'не аутентифицирован');
    
    if (!req.user) {
      console.log('GET /properties/favorites - ошибка: пользователь не аутентифицирован');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`GET /properties/favorites - поиск избранного для пользователя ID: ${req.user.id}`);
    
    // Get favorite properties for the user
    const favoriteProperties = await prisma.favorite.findMany({
      where: {
        user_id: req.user.id,
      },
      include: {
        property: {
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
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log(`GET /properties/favorites - найдено ${favoriteProperties.length} избранных объектов`);
    
    // Extract just the property data
    const properties = favoriteProperties.map(fav => fav.property);
    console.log(`GET /properties/favorites - отправка ${properties.length} объектов в ответе`);
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching favorite properties:', error);
    res.status(500).json({ error: 'Failed to fetch favorite properties' });
  }
});

// Alternative route for getting favorite properties - used as a workaround for routing conflicts
router.get('/user-favorites', authenticateToken, async (req, res) => {
  try {
    console.log('GET /properties/user-favorites - начало обработки запроса');
    console.log('Пользователь:', req.user ? `ID: ${req.user.id}` : 'не аутентифицирован');
    
    if (!req.user) {
      console.log('GET /properties/user-favorites - ошибка: пользователь не аутентифицирован');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`GET /properties/user-favorites - поиск избранного для пользователя ID: ${req.user.id}`);
    
    // Get favorite properties for the user
    const favoriteProperties = await prisma.favorite.findMany({
      where: {
        user_id: req.user.id,
      },
      include: {
        property: {
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
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log(`GET /properties/user-favorites - найдено ${favoriteProperties.length} избранных объектов`);
    
    // Extract just the property data
    const properties = favoriteProperties.map(fav => fav.property);
    console.log(`GET /properties/user-favorites - отправка ${properties.length} объектов в ответе`);
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching favorite properties:', error);
    res.status(500).json({ error: 'Failed to fetch favorite properties' });
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

// Добавляем маршрут для проверки здоровья API
router.get('/health', (req, res) => {
  try {
    res.json({ status: 'ok', time: new Date().toISOString() });
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Endpoint для поиска недвижимости по параметрам
router.get('/search', async (req, res) => {
  try {
    console.log('Search request received with query:', req.query);
    
    // Отладочный вывод всех типов недвижимости
    try {
      const allPropertyTypes = await prisma.property_type.findMany();
      console.log('Available property types:');
      allPropertyTypes.forEach(type => {
        console.log(`- ID: ${type.id}, Name: ${type.name}`);
      });
    } catch (error) {
      console.error('Error fetching property types for debug:', error);
    }
    
    // Извлекаем все возможные параметры поиска
    const { 
      mode, 
      type, 
      rooms, 
      priceFrom, 
      priceTo, 
      address,
      city,
      property_type_id
    } = req.query;

    // Проверка общего количества объектов
    const totalCount = await prisma.property.count({
      where: { status: 'active' }
    });
    console.log(`Total active properties count: ${totalCount}`);

    // Базовое условие - только активные объявления
    let whereConditions: any = {
      status: 'active'
    };

    // Режим поиска (покупка/аренда)
    if (mode === 'buy') {
      whereConditions = {
        ...whereConditions,
        transaction_type: {
          name: {
            contains: 'прода',
            mode: 'insensitive'
          }
        }
      };
    } else if (mode === 'rent') {
      whereConditions = {
        ...whereConditions,
        transaction_type: {
          name: {
            contains: 'аренд',
            mode: 'insensitive'
          }
        }
      };
    }

    // Тип недвижимости
    if (type === 'apartment') {
      // Для квартир используем property_type_id=4 или имя "квартира"
      whereConditions = {
        ...whereConditions,
        OR: [
          { property_type_id: 4 },
          { property_type: {
              name: {
                contains: 'квартир',
                mode: 'insensitive'
              }
            }
          }
        ]
      };
    } else if (type === 'house') {
      // Для домов используем property_type_id=2 или имя "дом"
      whereConditions = {
        ...whereConditions,
        OR: [
          { property_type_id: 2 },
          { property_type: {
              name: {
                contains: 'дом',
                mode: 'insensitive'
              }
            }
          }
        ]
      };
    } else if (type === 'townhouse') {
      // Для таунхаусов используем property_type_id=1 или имя "таунхаус"
      whereConditions = {
        ...whereConditions,
        OR: [
          { property_type_id: 1 },
          { property_type: {
              name: {
                contains: 'таунхаус',
                mode: 'insensitive'
              }
            }
          }
        ]
      };
    } else if (type === 'villa') {
      // Для вилл используем property_type_id=3 или имя "вилла"
      whereConditions = {
        ...whereConditions,
        OR: [
          { property_type_id: 3 },
          { property_type: {
              name: {
                contains: 'вилл',
                mode: 'insensitive'
              }
            }
          }
        ]
      };
    } else if (type === 'commercial') {
      whereConditions = {
        ...whereConditions,
        is_commercial: true
      };
    } else if (type === 'land') {
      whereConditions = {
        ...whereConditions,
        property_type: {
          name: {
            contains: 'участ',
            mode: 'insensitive'
          }
        }
      };
    }

    // Количество комнат
    if (rooms) {
      if (rooms === 'studio') {
        whereConditions = {
          ...whereConditions,
          rooms: 0
        };
      } else if (rooms === '4+') {
        whereConditions = {
          ...whereConditions,
          rooms: { gte: 4 }
        };
      } else {
        whereConditions = {
          ...whereConditions,
          rooms: parseInt(rooms as string, 10)
        };
      }
    }

    // Диапазон цены
    if (priceFrom || priceTo) {
      const priceCondition: any = {};
      
      if (priceFrom) {
        priceCondition.gte = parseFloat(priceFrom as string);
      }
      
      if (priceTo) {
        priceCondition.lte = parseFloat(priceTo as string);
      }
      
      whereConditions = {
        ...whereConditions,
        price: priceCondition
      };
    }

    // Адрес (простой поиск)
    if (address) {
      whereConditions = {
        ...whereConditions,
        address: {
          contains: address as string,
          mode: 'insensitive'
        }
      };
    }

    // Город
    if (city) {
      whereConditions = {
        ...whereConditions,
        city: {
          name: {
            contains: city as string,
            mode: 'insensitive'
          }
        }
      };
    }

    // После обработки всех прочих условий проверяем property_type_id
    if (property_type_id) {
      const typeId = parseInt(property_type_id as string, 10);
      if (!isNaN(typeId)) {
        whereConditions = {
          ...whereConditions,
          property_type_id: typeId
        };
      }
    }

    // Выводим для отладки
    console.log('Final search conditions:', JSON.stringify(whereConditions, null, 2));

    // Выполняем поиск
    const properties = await prisma.property.findMany({
      where: whereConditions,
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
      orderBy: {
        created_at: 'desc'
      },
      take: 100, // Ограничиваем количество результатов
    });

    console.log(`Search found ${properties.length} properties`);
    
    if (properties.length === 0) {
      console.log("No properties found, showing debug info:");
      console.log("Query parameters:", req.query);
      console.log("Where conditions:", JSON.stringify(whereConditions, null, 2));
      
      // Для отладки: попробуем найти все активные объекты
      const allActive = await prisma.property.findMany({
        where: { status: 'active' },
        select: { id: true, title: true, property_type: { select: { name: true } }, transaction_type: { select: { name: true } } },
        take: 5
      });
      
      console.log(`First 5 active properties for reference:`, JSON.stringify(allActive, null, 2));
    }
    
    res.json(properties);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

// Get property by ID - ВАЖНО: этот маршрут должен быть последним, чтобы не перехватывать другие маршруты!
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
    console.log('Received create property request. Request body:', req.body);
    
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
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!price) missingFields.push('price');
    if (!area) missingFields.push('area');
    if (!rooms) missingFields.push('rooms');
    if (!address) missingFields.push('address');
    if (!property_type_id) missingFields.push('property_type_id');
    if (!transaction_type_id) missingFields.push('transaction_type_id');
    if (!city_id) missingFields.push('city_id');
    if (!images || !Array.isArray(images) || images.length === 0) missingFields.push('images');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    if (!req.user) {
      console.error('User not authenticated');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Creating new property with data:', {
      title,
      description,
      price,
      area,
      rooms,
      user_id: req.user.id,
      images: images.length
    });

    try {
      const property = await prisma.property.create({
        data: {
          title,
          description,
          price: typeof price === 'string' ? parseFloat(price) : price,
          area: typeof area === 'string' ? parseFloat(area) : area,
          rooms: typeof rooms === 'string' ? parseInt(rooms, 10) : rooms,
          floor,
          total_floors,
          address,
          year_built,
          property_type_id: typeof property_type_id === 'string' ? parseInt(property_type_id, 10) : property_type_id,
          transaction_type_id: typeof transaction_type_id === 'string' ? parseInt(transaction_type_id, 10) : transaction_type_id,
          city_id: typeof city_id === 'string' ? parseInt(city_id, 10) : city_id,
          district_id: district_id ? (typeof district_id === 'string' ? parseInt(district_id, 10) : district_id) : undefined,
          metro_id: metro_id ? (typeof metro_id === 'string' ? parseInt(metro_id, 10) : metro_id) : undefined,
          metro_distance: metro_distance ? (typeof metro_distance === 'string' ? parseFloat(metro_distance) : metro_distance) : undefined,
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

      console.log('Property created successfully. ID:', property.id);
      res.status(201).json(property);
    } catch (prismaError: any) {
      console.error('Prisma error creating property:', prismaError);
      
      // Подробный лог ошибки Prisma
      if (prismaError.code) {
        console.error('Prisma error code:', prismaError.code);
      }
      
      if (prismaError.meta) {
        console.error('Prisma error meta:', prismaError.meta);
      }
      
      res.status(500).json({ error: 'Database error creating property', details: prismaError.message });
    }
  } catch (error: any) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property', details: error.message });
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