"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOptionalFloat = exports.toOptionalInt = exports.parseIdParam = void 0;
const http_errors_1 = require("./http-errors");
/**
 * Преобразует строковый параметр маршрута в положительное целое число.
 * Бросает HttpError 400, если значение не является числом.
 */
const parseIdParam = (value, name = 'id') => {
    const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
        throw (0, http_errors_1.badRequest)(`Invalid ${name}`);
    }
    return parsed;
};
exports.parseIdParam = parseIdParam;
/**
 * Безопасно парсит число из строки. Возвращает undefined, если значение пустое
 * или не парсится. Полезен для опциональных query-параметров.
 */
const toOptionalInt = (value) => {
    if (value === undefined || value === null || value === '')
        return undefined;
    const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};
exports.toOptionalInt = toOptionalInt;
/**
 * Безопасно парсит float. Возвращает undefined, если значение пустое или не парсится.
 */
const toOptionalFloat = (value) => {
    if (value === undefined || value === null || value === '')
        return undefined;
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};
exports.toOptionalFloat = toOptionalFloat;
