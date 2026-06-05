"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._logger = exports.propertyExists = exports.checkPropertyOwnership = exports.metroByCity = exports.districtsByCity = exports.cities = exports.transactionTypes = exports.propertyTypes = exports.getViewHistory = exports.recordPropertyView = exports.isFavorited = exports.toggleFavorite = exports.listFavoriteProperties = exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getUserProperties = exports.getPropertyById = exports.buildSearchWhere = exports.findPropertiesByTransaction = exports.findProperties = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const property_includes_1 = require("../repositories/property.includes");
const logger_1 = require("../utils/logger");
const PROPERTY_TYPE_FILTERS = {
    apartment: {
        OR: [{ property_type_id: 4 }, { property_type: { name: { contains: 'квартир', mode: 'insensitive' } } }],
    },
    house: {
        OR: [{ property_type_id: 2 }, { property_type: { name: { contains: 'дом', mode: 'insensitive' } } }],
    },
    townhouse: {
        OR: [{ property_type_id: 1 }, { property_type: { name: { contains: 'таунхаус', mode: 'insensitive' } } }],
    },
    villa: {
        OR: [{ property_type_id: 3 }, { property_type: { name: { contains: 'вилл', mode: 'insensitive' } } }],
    },
    commercial: { is_commercial: true },
    land: { property_type: { name: { contains: 'участ', mode: 'insensitive' } } },
};
const TRANSACTION_FILTERS = {
    buy: { transaction_type: { name: { contains: 'прода', mode: 'insensitive' } } },
    rent: { transaction_type: { name: { contains: 'аренд', mode: 'insensitive' } } },
};
/**
 * Единая точка получения списка объявлений с одинаковыми связанными
 * сущностями (см. propertyInclude). Используется на витрине, в поиске
 * и фильтрах по категориям.
 */
const findProperties = async ({ where, orderBy, take } = {}) => {
    return prisma_1.default.property.findMany({
        where: { status: 'active', ...where },
        include: property_includes_1.propertyInclude,
        orderBy,
        take,
    });
};
exports.findProperties = findProperties;
/**
 * Объявления с фильтром по типу транзакции (продажа/аренда), отсортированные
 * по дате создания. Если по типу транзакции ничего не нашлось — пробуем
 * фолбэк по ключевым словам в описании (для исторических данных).
 */
const findPropertiesByTransaction = async (mode, take, descriptionFallback) => {
    const primary = await (0, exports.findProperties)({
        where: TRANSACTION_FILTERS[mode],
        orderBy: { created_at: 'desc' },
        take,
    });
    if (primary.length > 0 || !descriptionFallback?.length) {
        return primary;
    }
    return (0, exports.findProperties)({
        where: {
            OR: descriptionFallback.map((keyword) => ({
                description: { contains: keyword, mode: 'insensitive' },
            })),
        },
        orderBy: { created_at: 'desc' },
        take,
    });
};
exports.findPropertiesByTransaction = findPropertiesByTransaction;
/**
 * Преобразует query-параметры из ?mode=...&type=...&rooms=... в Prisma where.
 * Возвращает уже готовый where, к которому добавлен status: 'active'.
 */
const buildSearchWhere = (filters) => {
    const where = { status: 'active' };
    const andClauses = [];
    if (filters.mode && TRANSACTION_FILTERS[filters.mode]) {
        Object.assign(where, TRANSACTION_FILTERS[filters.mode]);
    }
    if (filters.type) {
        const typeFilter = PROPERTY_TYPE_FILTERS[filters.type];
        if (typeFilter)
            andClauses.push(typeFilter);
    }
    if (filters.rooms) {
        if (filters.rooms === 'studio') {
            where.rooms = 0;
        }
        else if (filters.rooms === '4+') {
            where.rooms = { gte: 4 };
        }
        else {
            const parsed = parseInt(filters.rooms, 10);
            if (Number.isFinite(parsed))
                where.rooms = parsed;
        }
    }
    if (filters.priceFrom || filters.priceTo) {
        where.price = {
            ...(filters.priceFrom ? { gte: parseFloat(filters.priceFrom) } : {}),
            ...(filters.priceTo ? { lte: parseFloat(filters.priceTo) } : {}),
        };
    }
    if (filters.address) {
        where.address = { contains: filters.address, mode: 'insensitive' };
    }
    if (filters.city) {
        where.city = { name: { contains: filters.city, mode: 'insensitive' } };
    }
    if (filters.property_type_id) {
        const id = parseInt(filters.property_type_id, 10);
        if (Number.isFinite(id))
            where.property_type_id = id;
    }
    if (andClauses.length > 0) {
        where.AND = andClauses;
    }
    return where;
};
exports.buildSearchWhere = buildSearchWhere;
const getPropertyById = (id) => prisma_1.default.property.findUnique({
    where: { id },
    include: property_includes_1.propertyInclude,
});
exports.getPropertyById = getPropertyById;
const getUserProperties = (userId) => prisma_1.default.property.findMany({
    where: { user_id: userId },
    include: property_includes_1.userPropertyInclude,
    orderBy: { created_at: 'desc' },
});
exports.getUserProperties = getUserProperties;
const toInt = (value) => {
    if (value === undefined || value === null || value === '')
        return undefined;
    return typeof value === 'number' ? value : parseInt(value, 10);
};
const toFloat = (value) => {
    if (value === undefined || value === null || value === '')
        return undefined;
    return typeof value === 'number' ? value : parseFloat(value);
};
const createProperty = async (userId, input) => {
    return prisma_1.default.property.create({
        data: {
            title: input.title,
            description: input.description,
            price: toFloat(input.price),
            area: toFloat(input.area),
            rooms: toInt(input.rooms),
            floor: toInt(input.floor),
            total_floors: toInt(input.total_floors),
            address: input.address,
            year_built: toInt(input.year_built),
            property_type_id: toInt(input.property_type_id),
            transaction_type_id: toInt(input.transaction_type_id),
            city_id: toInt(input.city_id),
            district_id: toInt(input.district_id),
            metro_id: toInt(input.metro_id),
            metro_distance: toFloat(input.metro_distance),
            is_new_building: input.is_new_building ?? false,
            is_commercial: input.is_commercial ?? false,
            is_country: input.is_country ?? false,
            has_renovation: input.has_renovation ?? false,
            user_id: userId,
            images: {
                create: input.images.map((url, index) => ({
                    image_url: url,
                    is_main: index === 0,
                    order: index,
                })),
            },
        },
        include: property_includes_1.propertyInclude,
    });
};
exports.createProperty = createProperty;
/**
 * Превращает «сырые» поля из PUT-запроса в объект, который ожидает Prisma.
 * Поля могут прийти как строкой, так и числом — приводим их к нужным типам
 * и пропускаем те, что клиент не передал.
 */
const buildUpdateData = (input) => {
    const data = {};
    if (input.title !== undefined)
        data.title = input.title;
    if (input.description !== undefined)
        data.description = input.description;
    if (input.address !== undefined)
        data.address = input.address;
    if (input.status !== undefined)
        data.status = input.status;
    if (input.is_new_building !== undefined)
        data.is_new_building = input.is_new_building;
    if (input.is_commercial !== undefined)
        data.is_commercial = input.is_commercial;
    if (input.is_country !== undefined)
        data.is_country = input.is_country;
    if (input.has_renovation !== undefined)
        data.has_renovation = input.has_renovation;
    const price = toFloat(input.price);
    const area = toFloat(input.area);
    const metroDistance = toFloat(input.metro_distance);
    const rooms = toInt(input.rooms);
    const floor = toInt(input.floor);
    const totalFloors = toInt(input.total_floors);
    const yearBuilt = toInt(input.year_built);
    if (price !== undefined)
        data.price = price;
    if (area !== undefined)
        data.area = area;
    if (rooms !== undefined)
        data.rooms = rooms;
    if (floor !== undefined)
        data.floor = floor;
    if (totalFloors !== undefined)
        data.total_floors = totalFloors;
    if (yearBuilt !== undefined)
        data.year_built = yearBuilt;
    if (metroDistance !== undefined)
        data.metro_distance = metroDistance;
    // Связанные сущности обновляем через connect, чтобы избежать конфликта
    // между unchecked-полями (`*_id`) и checked-relations Prisma.
    const propertyTypeId = toInt(input.property_type_id);
    const transactionTypeId = toInt(input.transaction_type_id);
    const cityId = toInt(input.city_id);
    const districtId = toInt(input.district_id);
    const metroId = toInt(input.metro_id);
    if (propertyTypeId !== undefined)
        data.property_type = { connect: { id: propertyTypeId } };
    if (transactionTypeId !== undefined)
        data.transaction_type = { connect: { id: transactionTypeId } };
    if (cityId !== undefined)
        data.city = { connect: { id: cityId } };
    if (districtId !== undefined)
        data.district = { connect: { id: districtId } };
    if (metroId !== undefined)
        data.metro_station = { connect: { id: metroId } };
    return data;
};
const updateProperty = async (id, input) => {
    const data = buildUpdateData(input);
    if (input.images) {
        data.images = {
            deleteMany: {},
            create: input.images.map((url, index) => ({
                image_url: url,
                is_main: index === 0,
                order: index,
            })),
        };
    }
    return prisma_1.default.property.update({
        where: { id },
        data,
        include: property_includes_1.propertyInclude,
    });
};
exports.updateProperty = updateProperty;
const deleteProperty = (id) => prisma_1.default.property.delete({ where: { id } });
exports.deleteProperty = deleteProperty;
const listFavoriteProperties = async (userId) => {
    const favorites = await prisma_1.default.favorite.findMany({
        where: { user_id: userId },
        include: { property: { include: property_includes_1.propertyInclude } },
        orderBy: { created_at: 'desc' },
    });
    return favorites.map((fav) => fav.property);
};
exports.listFavoriteProperties = listFavoriteProperties;
const toggleFavorite = async (userId, propertyId) => {
    const existing = await prisma_1.default.favorite.findUnique({
        where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
    });
    if (existing) {
        await prisma_1.default.favorite.delete({
            where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
        });
        return { favorited: false };
    }
    await prisma_1.default.favorite.create({ data: { user_id: userId, property_id: propertyId } });
    return { favorited: true };
};
exports.toggleFavorite = toggleFavorite;
const isFavorited = async (userId, propertyId) => {
    const favorite = await prisma_1.default.favorite.findUnique({
        where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
    });
    return Boolean(favorite);
};
exports.isFavorited = isFavorited;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Регистрирует факт просмотра объявления пользователем. Если этот же
 * пользователь просматривал объект менее суток назад, время просмотра
 * обновляется — иначе создаётся новая запись.
 */
const recordPropertyView = async (userId, propertyId) => {
    const since = new Date(Date.now() - ONE_DAY_MS);
    const recent = await prisma_1.default.view_history.findFirst({
        where: { user_id: userId, property_id: propertyId, viewed_at: { gte: since } },
    });
    if (recent) {
        const updated = await prisma_1.default.view_history.update({
            where: { id: recent.id },
            data: { viewed_at: new Date() },
        });
        return { updated: true, record: updated };
    }
    const record = await prisma_1.default.view_history.create({
        data: { user_id: userId, property_id: propertyId, viewed_at: new Date() },
    });
    return { updated: false, record };
};
exports.recordPropertyView = recordPropertyView;
/**
 * История просмотров: возвращает только последний просмотр для каждого
 * объявления, отсортированный по дате просмотра по убыванию.
 */
const getViewHistory = async (userId) => {
    const views = await prisma_1.default.view_history.findMany({
        where: { user_id: userId },
        orderBy: { viewed_at: 'desc' },
        include: { property: { include: property_includes_1.propertyInclude } },
    });
    if (views.length === 0)
        return [];
    const latestByProperty = new Map();
    for (const view of views) {
        const existing = latestByProperty.get(view.property_id);
        if (!existing || view.viewed_at > existing.viewed_at) {
            latestByProperty.set(view.property_id, view);
        }
    }
    return Array.from(latestByProperty.values())
        .map((view) => ({ ...view.property, viewed_at: view.viewed_at }))
        .sort((a, b) => b.viewed_at.getTime() - a.viewed_at.getTime());
};
exports.getViewHistory = getViewHistory;
const propertyTypes = () => prisma_1.default.property_type.findMany({ orderBy: { name: 'asc' } });
exports.propertyTypes = propertyTypes;
const transactionTypes = () => prisma_1.default.transaction_type.findMany({ orderBy: { name: 'asc' } });
exports.transactionTypes = transactionTypes;
const cities = () => prisma_1.default.city.findMany({ orderBy: { name: 'asc' } });
exports.cities = cities;
const districtsByCity = (cityId) => prisma_1.default.district.findMany({ where: { city_id: cityId }, orderBy: { name: 'asc' } });
exports.districtsByCity = districtsByCity;
const metroByCity = (cityId) => prisma_1.default.metro_station.findMany({ where: { city_id: cityId }, orderBy: { name: 'asc' } });
exports.metroByCity = metroByCity;
const checkPropertyOwnership = async (propertyId, user) => {
    const property = await prisma_1.default.property.findUnique({ where: { id: propertyId } });
    if (!property)
        return { property: null, owned: false };
    const owned = property.user_id === user.id || user.role === 'ADMIN';
    return { property, owned };
};
exports.checkPropertyOwnership = checkPropertyOwnership;
const propertyExists = async (id) => {
    const count = await prisma_1.default.property.count({ where: { id } });
    return count > 0;
};
exports.propertyExists = propertyExists;
// Логгер используется в search для отладки — оставляем его доступным,
// чтобы не пробрасывать через параметры.
exports._logger = logger_1.logger;
