export declare function searchProperties(aiFilters: any): Promise<{
    image: string | null;
    property_type: {
        id: number;
        name: string;
        description: string | null;
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
    status: string;
    user_id: number;
}[]>;
