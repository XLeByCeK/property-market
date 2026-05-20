import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { propertyInclude, userPropertyInclude } from '../repositories/property.includes';
import { logger } from '../utils/logger';

export type SearchMode = 'buy' | 'rent';
export type SearchPropertyType =
  | 'apartment'
  | 'house'
  | 'townhouse'
  | 'villa'
  | 'commercial'
  | 'land';

export interface SearchFilters {
  mode?: SearchMode;
  type?: SearchPropertyType;
  rooms?: string;
  priceFrom?: string;
  priceTo?: string;
  address?: string;
  city?: string;
  property_type_id?: string;
}

interface FindOptions {
  where?: Prisma.propertyWhereInput;
  orderBy?: Prisma.propertyOrderByWithRelationInput | Prisma.propertyOrderByWithRelationInput[];
  take?: number;
}

const PROPERTY_TYPE_FILTERS: Partial<Record<SearchPropertyType, Prisma.propertyWhereInput>> = {
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

const TRANSACTION_FILTERS: Record<SearchMode, Prisma.propertyWhereInput> = {
  buy: { transaction_type: { name: { contains: 'прода', mode: 'insensitive' } } },
  rent: { transaction_type: { name: { contains: 'аренд', mode: 'insensitive' } } },
};

/**
 * Единая точка получения списка объявлений с одинаковыми связанными
 * сущностями (см. propertyInclude). Используется на витрине, в поиске
 * и фильтрах по категориям.
 */
export const findProperties = async ({ where, orderBy, take }: FindOptions = {}) => {
  return prisma.property.findMany({
    where: { status: 'active', ...where },
    include: propertyInclude,
    orderBy,
    take,
  });
};

/**
 * Объявления с фильтром по типу транзакции (продажа/аренда), отсортированные
 * по дате создания. Если по типу транзакции ничего не нашлось — пробуем
 * фолбэк по ключевым словам в описании (для исторических данных).
 */
export const findPropertiesByTransaction = async (
  mode: SearchMode,
  take?: number,
  descriptionFallback?: string[]
) => {
  const primary = await findProperties({
    where: TRANSACTION_FILTERS[mode],
    orderBy: { created_at: 'desc' },
    take,
  });

  if (primary.length > 0 || !descriptionFallback?.length) {
    return primary;
  }

  return findProperties({
    where: {
      OR: descriptionFallback.map((keyword) => ({
        description: { contains: keyword, mode: 'insensitive' },
      })),
    },
    orderBy: { created_at: 'desc' },
    take,
  });
};

/**
 * Преобразует query-параметры из ?mode=...&type=...&rooms=... в Prisma where.
 * Возвращает уже готовый where, к которому добавлен status: 'active'.
 */
export const buildSearchWhere = (filters: SearchFilters): Prisma.propertyWhereInput => {
  const where: Prisma.propertyWhereInput = { status: 'active' };
  const andClauses: Prisma.propertyWhereInput[] = [];

  if (filters.mode && TRANSACTION_FILTERS[filters.mode]) {
    Object.assign(where, TRANSACTION_FILTERS[filters.mode]);
  }

  if (filters.type) {
    const typeFilter = PROPERTY_TYPE_FILTERS[filters.type];
    if (typeFilter) andClauses.push(typeFilter);
  }

  if (filters.rooms) {
    if (filters.rooms === 'studio') {
      where.rooms = 0;
    } else if (filters.rooms === '4+') {
      where.rooms = { gte: 4 };
    } else {
      const parsed = parseInt(filters.rooms, 10);
      if (Number.isFinite(parsed)) where.rooms = parsed;
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
    if (Number.isFinite(id)) where.property_type_id = id;
  }

  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  return where;
};

export const getPropertyById = (id: number) =>
  prisma.property.findUnique({
    where: { id },
    include: propertyInclude,
  });

export const getUserProperties = (userId: number) =>
  prisma.property.findMany({
    where: { user_id: userId },
    include: userPropertyInclude,
    orderBy: { created_at: 'desc' },
  });

export interface CreatePropertyInput {
  title: string;
  description: string;
  price: number | string;
  area: number | string;
  rooms: number | string;
  floor?: number | string;
  total_floors?: number | string;
  address: string;
  year_built?: number | string;
  property_type_id: number | string;
  transaction_type_id: number | string;
  city_id: number | string;
  district_id?: number | string;
  metro_id?: number | string;
  metro_distance?: number | string;
  is_new_building?: boolean;
  is_commercial?: boolean;
  is_country?: boolean;
  images: string[];
}

const toInt = (value: number | string | undefined): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  return typeof value === 'number' ? value : parseInt(value, 10);
};

const toFloat = (value: number | string | undefined): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  return typeof value === 'number' ? value : parseFloat(value);
};

export const createProperty = async (userId: number, input: CreatePropertyInput) => {
  return prisma.property.create({
    data: {
      title: input.title,
      description: input.description,
      price: toFloat(input.price)!,
      area: toFloat(input.area)!,
      rooms: toInt(input.rooms)!,
      floor: toInt(input.floor),
      total_floors: toInt(input.total_floors),
      address: input.address,
      year_built: toInt(input.year_built),
      property_type_id: toInt(input.property_type_id)!,
      transaction_type_id: toInt(input.transaction_type_id)!,
      city_id: toInt(input.city_id)!,
      district_id: toInt(input.district_id),
      metro_id: toInt(input.metro_id),
      metro_distance: toFloat(input.metro_distance),
      is_new_building: input.is_new_building ?? false,
      is_commercial: input.is_commercial ?? false,
      is_country: input.is_country ?? false,
      user_id: userId,
      images: {
        create: input.images.map((url, index) => ({
          image_url: url,
          is_main: index === 0,
          order: index,
        })),
      },
    },
    include: propertyInclude,
  });
};

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  status?: 'active' | 'sold' | 'inactive';
}

/**
 * Превращает «сырые» поля из PUT-запроса в объект, который ожидает Prisma.
 * Поля могут прийти как строкой, так и числом — приводим их к нужным типам
 * и пропускаем те, что клиент не передал.
 */
const buildUpdateData = (input: UpdatePropertyInput): Prisma.propertyUpdateInput => {
  const data: Prisma.propertyUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.address !== undefined) data.address = input.address;
  if (input.status !== undefined) data.status = input.status;
  if (input.is_new_building !== undefined) data.is_new_building = input.is_new_building;
  if (input.is_commercial !== undefined) data.is_commercial = input.is_commercial;
  if (input.is_country !== undefined) data.is_country = input.is_country;

  const price = toFloat(input.price);
  const area = toFloat(input.area);
  const metroDistance = toFloat(input.metro_distance);
  const rooms = toInt(input.rooms);
  const floor = toInt(input.floor);
  const totalFloors = toInt(input.total_floors);
  const yearBuilt = toInt(input.year_built);

  if (price !== undefined) data.price = price;
  if (area !== undefined) data.area = area;
  if (rooms !== undefined) data.rooms = rooms;
  if (floor !== undefined) data.floor = floor;
  if (totalFloors !== undefined) data.total_floors = totalFloors;
  if (yearBuilt !== undefined) data.year_built = yearBuilt;
  if (metroDistance !== undefined) data.metro_distance = metroDistance;

  // Связанные сущности обновляем через connect, чтобы избежать конфликта
  // между unchecked-полями (`*_id`) и checked-relations Prisma.
  const propertyTypeId = toInt(input.property_type_id);
  const transactionTypeId = toInt(input.transaction_type_id);
  const cityId = toInt(input.city_id);
  const districtId = toInt(input.district_id);
  const metroId = toInt(input.metro_id);

  if (propertyTypeId !== undefined) data.property_type = { connect: { id: propertyTypeId } };
  if (transactionTypeId !== undefined) data.transaction_type = { connect: { id: transactionTypeId } };
  if (cityId !== undefined) data.city = { connect: { id: cityId } };
  if (districtId !== undefined) data.district = { connect: { id: districtId } };
  if (metroId !== undefined) data.metro_station = { connect: { id: metroId } };

  return data;
};

export const updateProperty = async (id: number, input: UpdatePropertyInput) => {
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

  return prisma.property.update({
    where: { id },
    data,
    include: propertyInclude,
  });
};

export const deleteProperty = (id: number) =>
  prisma.property.delete({ where: { id } });

export const listFavoriteProperties = async (userId: number) => {
  const favorites = await prisma.favorite.findMany({
    where: { user_id: userId },
    include: { property: { include: propertyInclude } },
    orderBy: { created_at: 'desc' },
  });
  return favorites.map((fav) => fav.property);
};

export const toggleFavorite = async (userId: number, propertyId: number) => {
  const existing = await prisma.favorite.findUnique({
    where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
    });
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { user_id: userId, property_id: propertyId } });
  return { favorited: true };
};

export const isFavorited = async (userId: number, propertyId: number) => {
  const favorite = await prisma.favorite.findUnique({
    where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
  });
  return Boolean(favorite);
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Регистрирует факт просмотра объявления пользователем. Если этот же
 * пользователь просматривал объект менее суток назад, время просмотра
 * обновляется — иначе создаётся новая запись.
 */
export const recordPropertyView = async (userId: number, propertyId: number) => {
  const since = new Date(Date.now() - ONE_DAY_MS);
  const recent = await prisma.view_history.findFirst({
    where: { user_id: userId, property_id: propertyId, viewed_at: { gte: since } },
  });

  if (recent) {
    const updated = await prisma.view_history.update({
      where: { id: recent.id },
      data: { viewed_at: new Date() },
    });
    return { updated: true, record: updated };
  }

  const record = await prisma.view_history.create({
    data: { user_id: userId, property_id: propertyId, viewed_at: new Date() },
  });
  return { updated: false, record };
};

/**
 * История просмотров: возвращает только последний просмотр для каждого
 * объявления, отсортированный по дате просмотра по убыванию.
 */
export const getViewHistory = async (userId: number) => {
  const views = await prisma.view_history.findMany({
    where: { user_id: userId },
    orderBy: { viewed_at: 'desc' },
    include: { property: { include: propertyInclude } },
  });

  if (views.length === 0) return [];

  const latestByProperty = new Map<number, (typeof views)[number]>();
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

export const propertyTypes = () =>
  prisma.property_type.findMany({ orderBy: { name: 'asc' } });

export const transactionTypes = () =>
  prisma.transaction_type.findMany({ orderBy: { name: 'asc' } });

export const cities = () => prisma.city.findMany({ orderBy: { name: 'asc' } });

export const districtsByCity = (cityId: number) =>
  prisma.district.findMany({ where: { city_id: cityId }, orderBy: { name: 'asc' } });

export const metroByCity = (cityId: number) =>
  prisma.metro_station.findMany({ where: { city_id: cityId }, orderBy: { name: 'asc' } });

export const checkPropertyOwnership = async (
  propertyId: number,
  user: { id: number; role: string }
) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return { property: null, owned: false };
  const owned = property.user_id === user.id || user.role === 'ADMIN';
  return { property, owned };
};

export const propertyExists = async (id: number) => {
  const count = await prisma.property.count({ where: { id } });
  return count > 0;
};

// Логгер используется в search для отладки — оставляем его доступным,
// чтобы не пробрасывать через параметры.
export const _logger = logger;
