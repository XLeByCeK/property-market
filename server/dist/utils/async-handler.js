"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Оборачивает async-обработчик Express и направляет любые исключения в next(),
 * чтобы они попадали в централизованный error middleware и не оставляли
 * необработанных промисов.
 */
const asyncHandler = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
