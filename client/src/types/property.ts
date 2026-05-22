/**
 * Общие типы недвижимости, используемые сервисами, компонентами и страницами.
 * Раньше эти интерфейсы дублировались в propertyService.ts, edit/[id].tsx и
 * нескольких компонентах — теперь они импортируются отсюда.
 */

export interface PropertyImage {
  id: number;
  image_url: string;
  is_main: boolean;
  order: number;
}

export interface PropertyOwner {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface PropertyType {
  id: number;
  name: string;
  description?: string;
}

export interface TransactionType {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  region?: string;
  country?: string;
}

export interface District {
  id: number;
  name: string;
}

export interface MetroStation {
  id: number;
  name: string;
  line?: string;
  color?: string;
}

/** Объект недвижимости в том виде, в каком он приходит с сервера. */
export interface PropertyFromAPI {
  id: number;
  title: string;
  description: string;
  price: number;
  area: number;
  rooms: number;
  floor?: number;
  total_floors?: number;
  address: string;
  year_built?: number;
  status: string;
  is_new_building: boolean;
  is_commercial: boolean;
  is_country: boolean;
  has_renovation: boolean;
  created_at: string;
  updated_at: string;
  property_type_id: number;
  transaction_type_id: number;
  user_id: number;
  city_id: number;
  district_id?: number;
  metro_id?: number;
  metro_distance?: number;
  user: PropertyOwner;
  property_type: PropertyType;
  transaction_type: TransactionType;
  city: City;
  district?: District;
  metro_station?: MetroStation;
  images: PropertyImage[];
}

/** Сокращённый тип, используемый на странице деталей объекта. */
export interface PropertyDetails {
  id: number;
  title: string;
  description: string;
  price: number;
  area: number;
  rooms: number;
  floor?: number;
  total_floors?: number;
  address: string;
  year_built?: number;
  is_new_building: boolean;
  is_commercial: boolean;
  is_country: boolean;
  has_renovation: boolean;
  created_at: string;
  updated_at: string;
  property_type: PropertyType;
  transaction_type: TransactionType;
  city: City;
  district?: District;
  metro_station?: MetroStation;
  metro_distance?: number;
  user: PropertyOwner;
  images: PropertyImage[];
}

/** UI-представление объявления — то, что отображается в карточках/списках. */
export interface Property {
  id: string;
  image: string;
  price: number;
  propertyType: string;
  rooms: string;
  floors: string;
  address: string;
  metro: string;
  isNewBuilding: boolean;
  isCommercial: boolean;
  isForRent: boolean;
  isCountry: boolean;
  description: string;
}

/** Данные формы создания/редактирования объявления. */
export interface PropertyFormData {
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
  is_new_building: boolean;
  is_commercial: boolean;
  is_country: boolean;
  has_renovation: boolean;
  images: string[];
}
