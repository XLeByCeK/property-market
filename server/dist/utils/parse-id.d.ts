/**
 * Преобразует строковый параметр маршрута в положительное целое число.
 * Бросает HttpError 400, если значение не является числом.
 */
export declare const parseIdParam: (value: unknown, name?: string) => number;
/**
 * Безопасно парсит число из строки. Возвращает undefined, если значение пустое
 * или не парсится. Полезен для опциональных query-параметров.
 */
export declare const toOptionalInt: (value: unknown) => number | undefined;
/**
 * Безопасно парсит float. Возвращает undefined, если значение пустое или не парсится.
 */
export declare const toOptionalFloat: (value: unknown) => number | undefined;
