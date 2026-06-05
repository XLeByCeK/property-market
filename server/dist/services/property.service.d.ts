import { Prisma } from '@prisma/client';
export type SearchMode = 'buy' | 'rent';
export type SearchPropertyType = 'apartment' | 'house' | 'townhouse' | 'villa' | 'commercial' | 'land';
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
/**
 * Единая точка получения списка объявлений с одинаковыми связанными
 * сущностями (см. propertyInclude). Используется на витрине, в поиске
 * и фильтрах по категориям.
 */
export declare const findProperties: ({ where, orderBy, take }?: FindOptions) => Promise<({
    property_type: {
        id: number;
        name: string;
        description: string | null;
    };
    transaction_type: {
        id: number;
        name: string;
    };
    images: {
        id: number;
        created_at: Date;
        order: number;
        image_url: string;
        is_main: boolean;
        property_id: number;
    }[];
    city: {
        id: number;
        name: string;
        region: string | null;
        country: string | null;
    };
    district: {
        id: number;
        name: string;
        city_id: number;
    } | null;
    metro_station: {
        id: number;
        name: string;
        city_id: number;
        line: string | null;
        color: string | null;
    } | null;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
} & {
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
})[]>;
/**
 * Объявления с фильтром по типу транзакции (продажа/аренда), отсортированные
 * по дате создания. Если по типу транзакции ничего не нашлось — пробуем
 * фолбэк по ключевым словам в описании (для исторических данных).
 */
export declare const findPropertiesByTransaction: (mode: SearchMode, take?: number, descriptionFallback?: string[]) => Promise<({
    property_type: {
        id: number;
        name: string;
        description: string | null;
    };
    transaction_type: {
        id: number;
        name: string;
    };
    images: {
        id: number;
        created_at: Date;
        order: number;
        image_url: string;
        is_main: boolean;
        property_id: number;
    }[];
    city: {
        id: number;
        name: string;
        region: string | null;
        country: string | null;
    };
    district: {
        id: number;
        name: string;
        city_id: number;
    } | null;
    metro_station: {
        id: number;
        name: string;
        city_id: number;
        line: string | null;
        color: string | null;
    } | null;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
} & {
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
})[]>;
/**
 * Преобразует query-параметры из ?mode=...&type=...&rooms=... в Prisma where.
 * Возвращает уже готовый where, к которому добавлен status: 'active'.
 */
export declare const buildSearchWhere: (filters: SearchFilters) => Prisma.propertyWhereInput;
export declare const getPropertyById: (id: number) => Prisma.Prisma__propertyClient<({
    property_type: {
        id: number;
        name: string;
        description: string | null;
    };
    transaction_type: {
        id: number;
        name: string;
    };
    images: {
        id: number;
        created_at: Date;
        order: number;
        image_url: string;
        is_main: boolean;
        property_id: number;
    }[];
    city: {
        id: number;
        name: string;
        region: string | null;
        country: string | null;
    };
    district: {
        id: number;
        name: string;
        city_id: number;
    } | null;
    metro_station: {
        id: number;
        name: string;
        city_id: number;
        line: string | null;
        color: string | null;
    } | null;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
} & {
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
}) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const getUserProperties: (userId: number) => Prisma.PrismaPromise<({
    favorites: {
        id: number;
        created_at: Date;
        user_id: number;
        property_id: number;
    }[];
    view_history: {
        id: number;
        user_id: number;
        property_id: number;
        viewed_at: Date;
    }[];
    _count: {
        favorites: number;
        city: number;
        district: number;
        metro_station: number;
        property_type: number;
        transaction_type: number;
        user: number;
        features: number;
        images: number;
        messages: number;
        view_history: number;
    };
    property_type: {
        id: number;
        name: string;
        description: string | null;
    };
    transaction_type: {
        id: number;
        name: string;
    };
    images: {
        id: number;
        created_at: Date;
        order: number;
        image_url: string;
        is_main: boolean;
        property_id: number;
    }[];
    city: {
        id: number;
        name: string;
        region: string | null;
        country: string | null;
    };
    district: {
        id: number;
        name: string;
        city_id: number;
    } | null;
    metro_station: {
        id: number;
        name: string;
        city_id: number;
        line: string | null;
        color: string | null;
    } | null;
    user: {
        id: number;
        email: string;
        password: string;
        birth_date: Date | null;
        created_at: Date;
        first_name: string;
        last_name: string;
        phone: string | null;
        updated_at: Date;
        role: string;
    };
    features: {
        id: number;
        property_id: number;
        value: string | null;
        feature_id: number;
    }[];
    messages: {
        message: string;
        id: number;
        created_at: Date;
        property_id: number | null;
        is_read: boolean;
        sender_id: number;
        recipient_id: number;
    }[];
} & {
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
})[]>;
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
    has_renovation?: boolean;
    images: string[];
}
export declare const createProperty: (userId: number, input: CreatePropertyInput) => Promise<{
    property_type: {
        id: number;
        name: string;
        description: string | null;
    };
    transaction_type: {
        id: number;
        name: string;
    };
    images: {
        id: number;
        created_at: Date;
        order: number;
        image_url: string;
        is_main: boolean;
        property_id: number;
    }[];
    city: {
        id: number;
        name: string;
        region: string | null;
        country: string | null;
    };
    district: {
        id: number;
        name: string;
        city_id: number;
    } | null;
    metro_station: {
        id: number;
        name: string;
        city_id: number;
        line: string | null;
        color: string | null;
    } | null;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
} & {
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
}>;
export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
    status?: 'active' | 'sold' | 'inactive';
}
export declare const updateProperty: (id: number, input: UpdatePropertyInput) => Promise<{
    property_type: {
        id: number;
        name: string;
        description: string | null;
    };
    transaction_type: {
        id: number;
        name: string;
    };
    images: {
        id: number;
        created_at: Date;
        order: number;
        image_url: string;
        is_main: boolean;
        property_id: number;
    }[];
    city: {
        id: number;
        name: string;
        region: string | null;
        country: string | null;
    };
    district: {
        id: number;
        name: string;
        city_id: number;
    } | null;
    metro_station: {
        id: number;
        name: string;
        city_id: number;
        line: string | null;
        color: string | null;
    } | null;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
} & {
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
}>;
export declare const deleteProperty: (id: number) => Prisma.Prisma__propertyClient<{
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const listFavoriteProperties: (userId: number) => Promise<({
    property_type: {
        id: number;
        name: string;
        description: string | null;
    };
    transaction_type: {
        id: number;
        name: string;
    };
    images: {
        id: number;
        created_at: Date;
        order: number;
        image_url: string;
        is_main: boolean;
        property_id: number;
    }[];
    city: {
        id: number;
        name: string;
        region: string | null;
        country: string | null;
    };
    district: {
        id: number;
        name: string;
        city_id: number;
    } | null;
    metro_station: {
        id: number;
        name: string;
        city_id: number;
        line: string | null;
        color: string | null;
    } | null;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
} & {
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
})[]>;
export declare const toggleFavorite: (userId: number, propertyId: number) => Promise<{
    favorited: boolean;
}>;
export declare const isFavorited: (userId: number, propertyId: number) => Promise<boolean>;
/**
 * Регистрирует факт просмотра объявления пользователем. Если этот же
 * пользователь просматривал объект менее суток назад, время просмотра
 * обновляется — иначе создаётся новая запись.
 */
export declare const recordPropertyView: (userId: number, propertyId: number) => Promise<{
    updated: boolean;
    record: {
        id: number;
        user_id: number;
        property_id: number;
        viewed_at: Date;
    };
}>;
/**
 * История просмотров: возвращает только последний просмотр для каждого
 * объявления, отсортированный по дате просмотра по убыванию.
 */
export declare const getViewHistory: (userId: number) => Promise<{
    viewed_at: Date;
    property_type: {
        id: number;
        name: string;
        description: string | null;
    };
    transaction_type: {
        id: number;
        name: string;
    };
    images: {
        id: number;
        created_at: Date;
        order: number;
        image_url: string;
        is_main: boolean;
        property_id: number;
    }[];
    city: {
        id: number;
        name: string;
        region: string | null;
        country: string | null;
    };
    district: {
        id: number;
        name: string;
        city_id: number;
    } | null;
    metro_station: {
        id: number;
        name: string;
        city_id: number;
        line: string | null;
        color: string | null;
    } | null;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string | null;
    };
    id: number;
    created_at: Date;
    updated_at: Date;
    description: string;
    property_type_id: number;
    is_commercial: boolean;
    title: string;
    price: number;
    area: number;
    rooms: number;
    floor: number | null;
    total_floors: number | null;
    address: string;
    year_built: number | null;
    transaction_type_id: number;
    city_id: number;
    district_id: number | null;
    metro_id: number | null;
    metro_distance: number | null;
    is_new_building: boolean;
    is_country: boolean;
    has_renovation: boolean;
    status: string;
    user_id: number;
}[]>;
export declare const propertyTypes: () => Prisma.PrismaPromise<{
    id: number;
    name: string;
    description: string | null;
}[]>;
export declare const transactionTypes: () => Prisma.PrismaPromise<{
    id: number;
    name: string;
}[]>;
export declare const cities: () => Prisma.PrismaPromise<{
    id: number;
    name: string;
    region: string | null;
    country: string | null;
}[]>;
export declare const districtsByCity: (cityId: number) => Prisma.PrismaPromise<{
    id: number;
    name: string;
    city_id: number;
}[]>;
export declare const metroByCity: (cityId: number) => Prisma.PrismaPromise<{
    id: number;
    name: string;
    city_id: number;
    line: string | null;
    color: string | null;
}[]>;
export declare const checkPropertyOwnership: (propertyId: number, user: {
    id: number;
    role: string;
}) => Promise<{
    property: null;
    owned: boolean;
} | {
    property: {
        id: number;
        created_at: Date;
        updated_at: Date;
        description: string;
        property_type_id: number;
        is_commercial: boolean;
        title: string;
        price: number;
        area: number;
        rooms: number;
        floor: number | null;
        total_floors: number | null;
        address: string;
        year_built: number | null;
        transaction_type_id: number;
        city_id: number;
        district_id: number | null;
        metro_id: number | null;
        metro_distance: number | null;
        is_new_building: boolean;
        is_country: boolean;
        has_renovation: boolean;
        status: string;
        user_id: number;
    };
    owned: boolean;
}>;
export declare const propertyExists: (id: number) => Promise<boolean>;
export declare const _logger: {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
};
export {};
