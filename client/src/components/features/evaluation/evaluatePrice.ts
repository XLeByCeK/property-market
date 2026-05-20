import { Property, getPropertiesForSale } from '../../../services/propertyService';

export interface EvaluationInput {
  propertyType: string;
  rooms: string;
  userPrice: number;
}

export type PriceStatus = 'low' | 'market' | 'high';

export interface EvaluationOutput {
  price: number;
  lowPrice: number;
  marketPrice: number;
  highPrice: number;
  priceStatus: PriceStatus;
  similarListings: number;
}

const getMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
};

const getPercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(
    0,
    Math.min(sorted.length - 1, Math.floor((sorted.length * percentile) / 100))
  );
  return sorted[index];
};

const normalizeType = (type: string): string => {
  const lower = type.toLowerCase();
  if (lower.includes('квартир')) return 'квартира';
  if (lower.includes('дом')) return 'дом';
  if (lower.includes('таун')) return 'таунхаус';
  if (lower.includes('вилл')) return 'вилла';
  return lower;
};

const parseRooms = (rooms: string): number => {
  const match = rooms.match(/\d+/);
  if (match) return parseInt(match[0], 10);
  return rooms.toLowerCase().includes('студ') ? 0 : 999;
};

interface Matcher {
  property: Property;
  matchesType: boolean;
  roomsDelta: number;
}

const buildMatcher = (
  properties: Property[],
  normalizedType: string,
  numRooms: number
): Matcher[] =>
  properties.map((property) => ({
    property,
    matchesType: normalizedType
      ? normalizeType(property.propertyType).includes(normalizedType)
      : true,
    roomsDelta: Math.abs(numRooms - parseRooms(property.rooms)),
  }));

/**
 * Постепенно ослабляем критерии поиска, пока не найдём ≥5 похожих объявлений.
 * Этот «funnel» раньше жил прямо в обработчике формы внутри `evaluate.tsx` и
 * был сильно перемешан с UI-логикой.
 */
const findSimilarProperties = (
  properties: Property[],
  normalizedType: string,
  numRooms: number,
  hasRoomsFilter: boolean
): Property[] => {
  const withMeta = buildMatcher(properties, normalizedType, numRooms);

  // 1. Точное совпадение по типу и количеству комнат.
  let result = withMeta.filter(
    (item) => item.matchesType && (!hasRoomsFilter || item.roomsDelta === 0)
  );
  if (result.length >= 5) return result.map((m) => m.property);

  // 2. ±1 комната.
  if (hasRoomsFilter) {
    result = withMeta.filter((item) => item.matchesType && item.roomsDelta <= 1);
    if (result.length >= 5) return result.map((m) => m.property);
  }

  // 3. Только по типу.
  if (normalizedType) {
    result = withMeta.filter((item) => item.matchesType);
    if (result.length >= 5) return result.map((m) => m.property);
  }

  // 4. Сортируем все объявления по релевантности и берём топ-20.
  const ranked = withMeta
    .filter((item) => item.property.price > 0)
    .map((item) => {
      let score = 0;
      if (normalizedType && item.matchesType) score += 10;
      if (hasRoomsFilter) score += Math.max(0, 10 - item.roomsDelta * 2);
      return { property: item.property, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((m) => m.property);

  return ranked;
};

/**
 * Загружает выставленные на продажу объявления, ищет похожие на введённые
 * параметры и возвращает оценочный коридор цен.
 */
export const evaluatePrice = async (input: EvaluationInput): Promise<EvaluationOutput> => {
  const properties = await getPropertiesForSale(500);
  if (!properties || properties.length === 0) {
    throw new Error('No properties available for evaluation');
  }

  const normalizedType = input.propertyType ? normalizeType(input.propertyType) : '';
  const numRooms = input.rooms === 'studio' ? 0 : Number(input.rooms);

  const similar = findSimilarProperties(
    properties,
    normalizedType,
    numRooms,
    Boolean(input.rooms)
  ).filter((p) => p.price > 0);

  if (similar.length === 0) {
    throw new Error('No similar properties found');
  }

  const prices = similar.map((p) => p.price);
  const marketPrice = getMedian(prices);
  const lowPrice = getPercentile(prices, 15);
  const highPrice = getPercentile(prices, 85);

  let priceStatus: PriceStatus = 'market';
  if (input.userPrice < lowPrice) priceStatus = 'low';
  else if (input.userPrice > highPrice) priceStatus = 'high';

  return {
    price: input.userPrice,
    lowPrice,
    marketPrice,
    highPrice,
    priceStatus,
    similarListings: similar.length,
  };
};
