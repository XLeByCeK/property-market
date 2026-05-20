export interface PropertyTypeOption {
  value: string;
  label: string;
  type: string;
}

/**
 * Статические опции типов недвижимости в баннере поиска. Привязаны к id из БД
 * (см. таблицу `property_type`) и человеко-читаемому коду, который ищет страница
 * `/search` (например, чтобы понять, что выбрана «Коммерческая»).
 */
export const PROPERTY_TYPE_OPTIONS: PropertyTypeOption[] = [
  { value: '4', label: 'Квартира', type: 'apartment' },
  { value: '2', label: 'Дом', type: 'house' },
  { value: '1', label: 'Таунхаус', type: 'townhouse' },
  { value: '3', label: 'Вилла', type: 'villa' },
  { value: '5', label: 'Коммерческая', type: 'commercial' },
];

export const ROOM_OPTIONS = [
  { value: 'studio', label: 'Студия' },
  { value: '1', label: '1 комната' },
  { value: '2', label: '2 комнаты' },
  { value: '3', label: '3 комнаты' },
  { value: '4+', label: '4+ комнаты' },
];

export const GUEST_OPTIONS = [
  { value: '1', label: '1 гость' },
  { value: '2', label: '2 гостя' },
  { value: '3', label: '3 гостя' },
  { value: '4', label: '4 гостя' },
  { value: '5+', label: '5+ гостей' },
];
