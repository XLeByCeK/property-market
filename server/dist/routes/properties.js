"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../public/uploads/properties');
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `property-${uniqueSuffix}${ext}`);
    }
});
// File filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
// Upload property images
router.post('/upload-images', auth_1.authenticateToken, upload.array('images', 10), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const files = req.files;
        const imageUrls = files.map(file => {
            // Convert Windows path separators to URL format
            const relativePath = path_1.default.relative(path_1.default.join(__dirname, '../../public'), file.path).replace(/\\/g, '/');
            return `/${relativePath}`;
        });
        res.status(200).json({ imageUrls });
    }
    catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
}));
// Get all properties
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const properties = yield prisma_1.default.property.findMany({
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
    }
    catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
}));
// Get new buildings (is_new_building = true, status = active, is_commercial = false)
router.get('/new-buildings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const properties = yield prisma_1.default.property.findMany({
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
    }
    catch (error) {
        console.error('Error fetching new buildings:', error);
        res.status(500).json({ error: 'Failed to fetch new buildings' });
    }
}));
// Get properties for sale (status = active, transaction_type.name = 'Продажа')
router.get('/for-sale', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const properties = yield prisma_1.default.property.findMany({
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
    }
    catch (error) {
        console.error('Error fetching properties for sale:', error);
        res.status(500).json({ error: 'Failed to fetch properties for sale' });
    }
}));
// Get properties for rent (status = active, transaction_type.name содержит 'Аренда')
router.get('/for-rent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const properties = yield prisma_1.default.property.findMany({
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
            const propertiesByDescription = yield prisma_1.default.property.findMany({
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
    }
    catch (error) {
        console.error('Error fetching properties for rent:', error);
        res.status(500).json({ error: 'Failed to fetch properties for rent' });
    }
}));
// Get property by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyId = parseInt(req.params.id);
        if (isNaN(propertyId)) {
            return res.status(400).json({ error: 'Invalid property ID' });
        }
        const property = yield prisma_1.default.property.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ error: 'Failed to fetch property' });
    }
}));
// Create new property
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, price, area, rooms, floor, total_floors, address, year_built, property_type_id, transaction_type_id, city_id, district_id, metro_id, metro_distance, is_new_building, is_commercial, is_country, images } = req.body;
        // Validate input
        if (!title || !description || !price || !area || !rooms || !address || !property_type_id || !transaction_type_id || !city_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const property = yield prisma_1.default.property.create({
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
    }
    catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ error: 'Failed to create property' });
    }
}));
// Update property
router.put('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyId = parseInt(req.params.id);
        if (isNaN(propertyId)) {
            return res.status(400).json({ error: 'Invalid property ID' });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Check if property exists and belongs to the user
        const existingProperty = yield prisma_1.default.property.findUnique({
            where: { id: propertyId },
        });
        if (!existingProperty) {
            return res.status(404).json({ error: 'Property not found' });
        }
        if (existingProperty.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const _a = req.body, { images } = _a, updateData = __rest(_a, ["images"]);
        const property = yield prisma_1.default.property.update({
            where: { id: propertyId },
            data: Object.assign(Object.assign({}, updateData), (images && {
                images: {
                    deleteMany: {},
                    create: images.map((url, index) => ({
                        image_url: url,
                        is_main: index === 0,
                        order: index,
                    })),
                },
            })),
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
    }
    catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
}));
// Delete property
router.delete('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyId = parseInt(req.params.id);
        if (isNaN(propertyId)) {
            return res.status(400).json({ error: 'Invalid property ID' });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Check if property exists and belongs to the user
        const existingProperty = yield prisma_1.default.property.findUnique({
            where: { id: propertyId },
        });
        if (!existingProperty) {
            return res.status(404).json({ error: 'Property not found' });
        }
        if (existingProperty.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        yield prisma_1.default.property.delete({
            where: { id: propertyId },
        });
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
}));
// Get properties for the current user
router.get('/user', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const properties = yield prisma_1.default.property.findMany({
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
    }
    catch (error) {
        console.error('Error fetching user properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
}));
// Route for reference data endpoints
router.get('/property-types', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyTypes = yield prisma_1.default.property_type.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.json(propertyTypes);
    }
    catch (error) {
        console.error('Error fetching property types:', error);
        res.status(500).json({ error: 'Failed to fetch property types' });
    }
}));
// Toggle favorite status for a property
router.post('/favorites/:propertyId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const propertyId = parseInt(req.params.propertyId);
        if (isNaN(propertyId)) {
            return res.status(400).json({ error: 'Invalid property ID' });
        }
        // Check if property exists
        const property = yield prisma_1.default.property.findUnique({
            where: { id: propertyId },
        });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        // Check if the property is already in favorites
        const existingFavorite = yield prisma_1.default.favorite.findUnique({
            where: {
                user_id_property_id: {
                    user_id: req.user.id,
                    property_id: propertyId,
                },
            },
        });
        if (existingFavorite) {
            // Remove from favorites
            yield prisma_1.default.favorite.delete({
                where: {
                    user_id_property_id: {
                        user_id: req.user.id,
                        property_id: propertyId,
                    },
                },
            });
            res.json({ message: 'Property removed from favorites', favorited: false });
        }
        else {
            // Add to favorites
            yield prisma_1.default.favorite.create({
                data: {
                    user_id: req.user.id,
                    property_id: propertyId,
                },
            });
            res.json({ message: 'Property added to favorites', favorited: true });
        }
    }
    catch (error) {
        console.error('Error toggling favorite status:', error);
        res.status(500).json({ error: 'Failed to update favorite status' });
    }
}));
// Get favorite properties for the current user
router.get('/favorites', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Get favorite properties for the user
        const favoriteProperties = yield prisma_1.default.favorite.findMany({
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
        // Extract just the property data
        const properties = favoriteProperties.map(fav => fav.property);
        res.json(properties);
    }
    catch (error) {
        console.error('Error fetching favorite properties:', error);
        res.status(500).json({ error: 'Failed to fetch favorite properties' });
    }
}));
router.get('/transaction-types', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionTypes = yield prisma_1.default.transaction_type.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.json(transactionTypes);
    }
    catch (error) {
        console.error('Error fetching transaction types:', error);
        res.status(500).json({ error: 'Failed to fetch transaction types' });
    }
}));
router.get('/cities', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cities = yield prisma_1.default.city.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.json(cities);
    }
    catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
}));
router.get('/cities/:cityId/districts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cityId = parseInt(req.params.cityId);
        if (isNaN(cityId)) {
            return res.status(400).json({ error: 'Invalid city ID' });
        }
        const districts = yield prisma_1.default.district.findMany({
            where: {
                city_id: cityId,
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.json(districts);
    }
    catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
}));
router.get('/cities/:cityId/metro', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cityId = parseInt(req.params.cityId);
        if (isNaN(cityId)) {
            return res.status(400).json({ error: 'Invalid city ID' });
        }
        const metroStations = yield prisma_1.default.metro_station.findMany({
            where: {
                city_id: cityId,
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.json(metroStations);
    }
    catch (error) {
        console.error('Error fetching metro stations:', error);
        res.status(500).json({ error: 'Failed to fetch metro stations' });
    }
}));
exports.default = router;
