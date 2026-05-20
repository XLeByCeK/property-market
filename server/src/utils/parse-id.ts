import { badRequest } from './http-errors';

/**
 * Преобразует строковый параметр маршрута в положительное целое число.
 * Бросает HttpError 400, если значение не является числом.
 */
export const parseIdParam = (value: unknown, name = 'id'): number => {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    throw badRequest(`Invalid ${name}`);
  }
  return parsed;
};

/**
 * Безопасно парсит число из строки. Возвращает undefined, если значение пустое
 * или не парсится. Полезен для опциональных query-параметров.
 */
export const toOptionalInt = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Безопасно парсит float. Возвращает undefined, если значение пустое или не парсится.
 */
export const toOptionalFloat = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
