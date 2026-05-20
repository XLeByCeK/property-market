"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * Минимальная обёртка над console: позволяет глушить debug/info в продакшене,
 * не разбрасывая `if (NODE_ENV === ...)` по всему коду.
 */
const isProduction = process.env.NODE_ENV === 'production';
exports.logger = {
    debug: (...args) => {
        if (!isProduction)
            console.log(...args);
    },
    info: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
};
